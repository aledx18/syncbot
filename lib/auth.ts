import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import prisma from './prismaClient'
import { createAuthMiddleware } from 'better-auth/api'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql'
  }),
  emailAndPassword: {
    enabled: true
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (!ctx.path.startsWith('/sign-up')) return

      const newSession = ctx.context.newSession
      if (!newSession) return

      try {
        const webhookSecret = process.env.WEBHOOK_SECRET
        if (!webhookSecret || !process.env.KAPSO_API_KEY) {
          throw new Error('Missing required environment variables')
        }

        const organization = await prisma.organization.create({
          data: {
            name: 'Mi organización',
            user_id: newSession.user.id,
            kapso_api_key: process.env.KAPSO_API_KEY
          }
        })

        await prisma.bot.create({
          data: {
            name: 'Mi bot',
            webhook_secret: webhookSecret,
            phone_number_id: '',
            organization_id: organization.id
          }
        })
      } catch (err) {
        console.error('[Auth Hook] Error creating org/bot:', err)
      }
    })
  }
})
// todo: add hooks for create organization on sign up
