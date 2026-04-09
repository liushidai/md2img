import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { healthRoutes } from './modules/health'

const app = new Elysia()
  .use(
    cors({
      origin: 'http://localhost:5173',
    }),
  )
  .use(healthRoutes)
  .listen(3000)

export type App = typeof app

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
