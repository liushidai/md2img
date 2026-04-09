import { treaty } from '@elysiajs/eden'
import type {
  CurrentDocument,
  HealthResponse,
  UpdateCurrentDocumentRequest,
} from '@md2img/shared'

type EdenError = {
  status: number
}

type EdenResponse<T> = {
  data: T | null
  error: EdenError | null
}

type EdenClient = {
  api: {
    health: {
      get: () => Promise<EdenResponse<HealthResponse>>
    }
    documents: {
      current: {
        get: () => Promise<EdenResponse<CurrentDocument>>
        put: (
          body: UpdateCurrentDocumentRequest,
        ) => Promise<EdenResponse<CurrentDocument>>
      }
    }
  }
}

const baseUrl = import.meta.env.VITE_API_BASE_URL

if (!baseUrl) {
  throw new Error('VITE_API_BASE_URL is not set')
}

export const eden = treaty(baseUrl) as unknown as EdenClient
