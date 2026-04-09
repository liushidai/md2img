import { Elysia } from 'elysia'
import type {
    CreateDocumentResponse,
    GetDocumentResponse,
    ListDocumentsResponse,
    UpdateDocumentResponse,
} from '@md2img/shared'
import {
    createDocumentRequestSchema,
    documentDetailSchema,
    documentParamsSchema,
    errorResponseSchema,
    listDocumentsResponseSchema,
    updateDocumentRequestSchema,
} from './document.schema'
import {
    createDocument,
    getDocumentById,
    listDocuments,
    updateDocument,
} from './document.service'

export const documentRoutes = new Elysia({ prefix: '/api/documents' })
    .get(
        '/',
        (): ListDocumentsResponse => listDocuments(),
        {
            response: listDocumentsResponseSchema,
        }
    )
    .post(
        '/',
        ({ body }): CreateDocumentResponse => createDocument(body),
        {
            body: createDocumentRequestSchema,
            response: documentDetailSchema,
        }
    )
    .get(
        '/:id',
        ({ params, set }): GetDocumentResponse | { message: string } => {
            const document = getDocumentById(params.id)

            if (!document) {
                set.status = 404
                return { message: '文档不存在' }
            }

            return document
        },
        {
            params: documentParamsSchema,
            response: {
                200: documentDetailSchema,
                404: errorResponseSchema,
            },
        }
    )
    .put(
        '/:id',
        ({ body, params, set }): UpdateDocumentResponse | { message: string } => {
            const document = updateDocument(params.id, body.title, body.markdownContent)

            if (!document) {
                set.status = 404
                return { message: '文档不存在' }
            }

            return document
        },
        {
            params: documentParamsSchema,
            body: updateDocumentRequestSchema,
            response: {
                200: documentDetailSchema,
                404: errorResponseSchema,
            },
        }
    )
