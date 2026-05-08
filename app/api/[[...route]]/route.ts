import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { auth } from '@/lib/auth'
import adminBotsRouter from '@/app/api/[[...route]]/routers/admin-bots'

const app = new Hono().basePath('/api')

// Better Auth
app.on(['GET', 'POST'], '/auth/*', (c) => auth.handler(c.req.raw))

// Admin routes — all under /admin/bots
const routes = app.route('/admin/bots', adminBotsRouter)

export const GET = handle(routes)
export const POST = handle(routes)
export const PUT = handle(routes)
export const DELETE = handle(routes)
export const PATCH = handle(routes)

export type AppType = typeof routes