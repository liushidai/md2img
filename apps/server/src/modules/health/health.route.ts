import { Elysia } from 'elysia'
import type { HealthResponse } from '@md2img/shared'

export const healthRoutes = new Elysia({ prefix: '/api/health' }).get(
    '/',
    (): HealthResponse => ({
        ok: true,
        service: 'server',
        time: new Date().toISOString(),
    })
)