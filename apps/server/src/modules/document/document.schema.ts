import { t } from 'elysia'

export const currentDocumentSchema = t.Object({
    markdownContent: t.String(),
    createdAt: t.Union([t.String(), t.Null()]),
    updatedAt: t.Union([t.String(), t.Null()]),
})

export const updateCurrentDocumentRequestSchema = t.Object({
    markdownContent: t.String(),
})
