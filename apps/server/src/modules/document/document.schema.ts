import { t } from 'elysia'

export const documentSummarySchema = t.Object({
    id: t.Number(),
    title: t.String(),
    createdAt: t.String(),
    updatedAt: t.String(),
})

export const documentDetailSchema = t.Object({
    ...documentSummarySchema.properties,
    markdownContent: t.String(),
})

export const listDocumentsResponseSchema = t.Array(documentSummarySchema)

export const documentParamsSchema = t.Object({
    id: t.Numeric(),
})

export const createDocumentRequestSchema = t.Object({
    title: t.Optional(t.String()),
    markdownContent: t.Optional(t.String()),
})

export const updateDocumentRequestSchema = t.Object({
    title: t.String(),
    markdownContent: t.String(),
})

export const errorResponseSchema = t.Object({
    message: t.String(),
})
