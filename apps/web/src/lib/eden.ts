import { treaty } from '@elysiajs/eden'
import type { HealthResponse } from '@md2img/shared'

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
  }
}

const baseUrl = import.meta.env.VITE_API_BASE_URL

if (!baseUrl) {
  throw new Error('VITE_API_BASE_URL is not set')
}

export const eden = treaty(baseUrl) as unknown as EdenClient
