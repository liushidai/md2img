import { Database } from 'bun:sqlite'
import { join } from 'node:path'
import type { CreateDocumentRequest, DocumentDetail, DocumentSummary } from '@md2img/shared'

type DocumentRow = {
    id: number
    title: string
    markdown_content: string
    created_at: string
    updated_at: string
}

const DEFAULT_DOCUMENT_TITLE = '未命名文档'

const database = new Database(join(process.cwd(), 'documents.sqlite'), {
    create: true,
})

database.exec(`
    CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL DEFAULT '${DEFAULT_DOCUMENT_TITLE}',
        markdown_content TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )
`)

const tableInfoStatement = database.query<
    {
        name: string
    },
    []
>('PRAGMA table_info(documents)')

function deriveLegacyTitle(markdownContent: string): string {
    const lines = markdownContent.split(/\r?\n/)

    for (const line of lines) {
        const trimmedLine = line.trim()

        if (!trimmedLine) {
            continue
        }

        const matched = trimmedLine.match(/^#\s+(.+)$/)

        if (!matched) {
            return DEFAULT_DOCUMENT_TITLE
        }

        return matched[1]?.trim() || DEFAULT_DOCUMENT_TITLE
    }

    return DEFAULT_DOCUMENT_TITLE
}

function ensureDocumentsTableSchema() {
    const columns = tableInfoStatement.all().map((column) => column.name)

    if (!columns.includes('title')) {
        database.exec('BEGIN')

        try {
            database.exec(
                `ALTER TABLE documents ADD COLUMN title TEXT NOT NULL DEFAULT '${DEFAULT_DOCUMENT_TITLE}'`
            )

            const fillLegacyTitleStatement = database.prepare(`
                UPDATE documents
                SET title = ?2
                WHERE id = ?1
            `)

            const legacyRows = database
                .query<Pick<DocumentRow, 'id' | 'markdown_content'>, []>(
                    'SELECT id, markdown_content FROM documents'
                )
                .all()

            for (const row of legacyRows) {
                fillLegacyTitleStatement.run(row.id, deriveLegacyTitle(row.markdown_content))
            }

            database.exec('COMMIT')
        } catch (error) {
            database.exec('ROLLBACK')
            throw error
        }
    }
}

ensureDocumentsTableSchema()

const listDocumentsStatement = database.query<DocumentRow, []>(`
    SELECT id, title, markdown_content, created_at, updated_at
    FROM documents
    ORDER BY updated_at DESC, id DESC
`)

const getDocumentByIdStatement = database.query<DocumentRow, [number]>(`
    SELECT id, title, markdown_content, created_at, updated_at
    FROM documents
    WHERE id = ?1
`)

const createDocumentStatement = database.prepare(`
    INSERT INTO documents (title, markdown_content, created_at, updated_at)
    VALUES (?1, ?2, ?3, ?4)
`)

const updateDocumentStatement = database.prepare(`
    UPDATE documents
    SET title = ?2,
        markdown_content = ?3,
        updated_at = ?4
    WHERE id = ?1
`)

function mapRowToDocumentSummary(row: DocumentRow): DocumentSummary {
    return {
        id: row.id,
        title: row.title,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    }
}

function mapRowToDocumentDetail(row: DocumentRow): DocumentDetail {
    return {
        ...mapRowToDocumentSummary(row),
        markdownContent: row.markdown_content,
    }
}

export function listDocuments(): DocumentSummary[] {
    return listDocumentsStatement.all().map(mapRowToDocumentSummary)
}

export function getDocumentById(id: number): DocumentDetail | null {
    const row = getDocumentByIdStatement.get(id) ?? null

    if (!row) {
        return null
    }

    return mapRowToDocumentDetail(row)
}

export function createDocument(input: CreateDocumentRequest = {}): DocumentDetail {
    const now = new Date().toISOString()
    const title = input.title?.trim() || DEFAULT_DOCUMENT_TITLE
    const markdownContent = input.markdownContent ?? ''

    const result = createDocumentStatement.run(title, markdownContent, now, now)

    return getDocumentById(Number(result.lastInsertRowid)) as DocumentDetail
}

export function updateDocument(id: number, title: string, markdownContent: string): DocumentDetail | null {
    const existingDocument = getDocumentById(id)

    if (!existingDocument) {
        return null
    }

    updateDocumentStatement.run(id, title.trim() || DEFAULT_DOCUMENT_TITLE, markdownContent, new Date().toISOString())

    return getDocumentById(id)
}
