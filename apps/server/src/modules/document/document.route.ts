import { Elysia } from 'elysia'
import type {
    GetCurrentDocumentResponse,
    UpdateCurrentDocumentResponse,
} from '@md2img/shared'
import {
    currentDocumentSchema,
    updateCurrentDocumentRequestSchema,
} from './document.schema'
import { getCurrentDocument, saveCurrentDocument } from './document.service'

export const documentRoutes = new Elysia({ prefix: '/api/documents' })
    .get(
        '/current',
        (): GetCurrentDocumentResponse => getCurrentDocument(),
        {
            response: currentDocumentSchema,
        }
    )
    .put(
        '/current',
        ({ body }): UpdateCurrentDocumentResponse =>
            saveCurrentDocument(body.markdownContent),
        {
            body: updateCurrentDocumentRequestSchema,
            response: currentDocumentSchema,
        }
    )
