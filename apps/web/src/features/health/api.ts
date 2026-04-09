import { eden } from '@/lib/eden'
import type { HealthResponse } from '@md2img/shared'

export async function getHealth(): Promise<HealthResponse> {
  const { data, error } = await eden.api.health.get()

  if (error) {
    throw new Error(`HTTP ${error.status}`)
  }

  if (!data) {
    throw new Error('health response is empty')
  }

  return data
}
