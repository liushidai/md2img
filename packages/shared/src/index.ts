export type HealthResponse = {
    ok: boolean
    service: string
    time: string
}

export type CurrentDocument = {
    markdownContent: string
    createdAt: string | null
    updatedAt: string | null
}

export type GetCurrentDocumentResponse = CurrentDocument

export type UpdateCurrentDocumentRequest = {
    markdownContent: string
}

export type UpdateCurrentDocumentResponse = CurrentDocument
