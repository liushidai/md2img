import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { documentRoutes } from './modules/document'
import { healthRoutes } from './modules/health'

const devOrigins = [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/]

const app = new Elysia()
  .use(
    cors({
      origin: devOrigins,
    }),
  )
  .use(documentRoutes)
  .use(healthRoutes)
  .listen(3000)

export type App = typeof app

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
