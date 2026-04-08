import type { HealthResponse } from '@md2img/shared'

export async function getHealth(): Promise<HealthResponse> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL

  if (!baseUrl) {
    throw new Error('VITE_API_BASE_URL is not set')
  }

  const res = await fetch(`${baseUrl}/api/health`)

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }

  return res.json() as Promise<HealthResponse>
}
