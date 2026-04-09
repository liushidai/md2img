export type HealthResponse = {
    ok: boolean
    service: string
    time: string
}

export type DocumentSummary = {
    id: number
    title: string
    createdAt: string
    updatedAt: string
}

export type DocumentDetail = DocumentSummary & {
    markdownContent: string
}

export type ListDocumentsResponse = DocumentSummary[]

export type GetDocumentResponse = DocumentDetail

export type CreateDocumentRequest = {
    title?: string
    markdownContent?: string
}

export type CreateDocumentResponse = DocumentDetail

export type UpdateDocumentRequest = {
    title: string
    markdownContent: string
}

export type UpdateDocumentResponse = DocumentDetail
