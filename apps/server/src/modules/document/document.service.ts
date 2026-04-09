import { Database } from 'bun:sqlite'
import { join } from 'node:path'
import type { CurrentDocument } from '@md2img/shared'

type DocumentRow = {
    markdown_content: string
    created_at: string
    updated_at: string
}

const CURRENT_DOCUMENT_ID = 1
const database = new Database(join(process.cwd(), 'documents.sqlite'), {
    create: true,
})

database.exec(`
    CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY,
        markdown_content TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )
`)

const getCurrentDocumentStatement = database
    .query<DocumentRow, [number]>(
        'SELECT markdown_content, created_at, updated_at FROM documents WHERE id = ?1'
    )

const saveCurrentDocumentStatement = database.prepare(`
    INSERT INTO documents (id, markdown_content, created_at, updated_at)
    VALUES (?1, ?2, ?3, ?4)
    ON CONFLICT(id) DO UPDATE SET
        markdown_content = excluded.markdown_content,
        updated_at = excluded.updated_at
`)

const mapRowToCurrentDocument = (row: DocumentRow | null): CurrentDocument => {
    if (!row) {
        return {
            markdownContent: '',
            createdAt: null,
            updatedAt: null,
        }
    }

    return {
        markdownContent: row.markdown_content,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    }
}

export const getCurrentDocument = (): CurrentDocument => {
    const row = getCurrentDocumentStatement.get(CURRENT_DOCUMENT_ID) ?? null

    return mapRowToCurrentDocument(row)
}

export const saveCurrentDocument = (markdownContent: string): CurrentDocument => {
    const existingDocument = getCurrentDocumentStatement.get(CURRENT_DOCUMENT_ID) ?? null
    const now = new Date().toISOString()
    const createdAt = existingDocument?.created_at ?? now

    saveCurrentDocumentStatement.run(CURRENT_DOCUMENT_ID, markdownContent, createdAt, now)

    return mapRowToCurrentDocument(
        getCurrentDocumentStatement.get(CURRENT_DOCUMENT_ID) ?? null
    )
}
