import { Hono } from 'hono'
import { requireAuth, Variables } from '@/lib/auth-guard'
import prisma from '@/lib/prismaClient'
import { zValidator } from '@hono/zod-validator'
import z from 'zod'

const app = new Hono<{ Variables: Variables }>()

  // GET /api/admin/bots — list all bots for user
  .get('/', requireAuth, async (c) => {
    const user = c.get('user')

    const bots = await prisma.bot.findMany({
      where: {
        organization: {
          user_id: user.id
        }
      },
      include: {
        organization: true
      }
    })

    return c.json({ bots })
  })

  // ── Texts ──────────────────────────────────────────────────────────────

  // GET /api/admin/bots/:botId/texts
  .get('/:botId/texts', requireAuth, async (c) => {
    const botId = c.req.param('botId')
    const user = c.get('user')

    const texts = await prisma.botText.findMany({
      where: {
        bot_id: botId,
        bot: {
          organization: {
            user_id: user.id
          }
        }
      }
    })

    return c.json({ texts })
  })

  // POST /api/admin/bots/:botId/texts — create text
  .post(
    '/:botId/texts',
    requireAuth,
    zValidator(
      'json',
      z.object({
        key: z.string(),
        value: z.string(),
        triggers: z.array(z.string()).optional(),
        handler: z.string().nullable().optional()
      })
    ),
    async (c) => {
      const botId = c.req.param('botId')
      const user = c.get('user')
      const { key, value, triggers, handler } = c.req.valid('json')

      const bot = await prisma.bot.findFirst({
        where: {
          id: botId,
          organization: {
            user_id: user.id
          }
        }
      })

      if (!bot) {
        return c.json({ error: 'Bot not found' }, 404)
      }

      const text = await prisma.botText.upsert({
        where: {
          key_bot_id: { key, bot_id: botId }
        },
        update: { value, triggers, handler },
        create: { key, value, triggers: triggers ?? [], handler, bot_id: botId }
      })

      return c.json({ text })
    }
  )

  // GET /api/admin/bots/:botId/texts/:key
  .get('/:botId/texts/:key', requireAuth, async (c) => {
    const botId = c.req.param('botId')
    const key = c.req.param('key')
    const user = c.get('user')

    const text = await prisma.botText.findFirst({
      where: {
        key,
        bot_id: botId,
        bot: {
          organization: {
            user_id: user.id
          }
        }
      }
    })

    if (!text) {
      return c.json({ error: 'Text not found' }, 404)
    }

    return c.json({ text })
  })

  // PUT /api/admin/bots/:botId/texts/:key — update text
  .put(
    '/:botId/texts/:key',
    requireAuth,
    zValidator('param', z.object({ botId: z.string(), key: z.string() })),
    zValidator(
      'json',
      z
        .object({
          value: z.string(),
          triggers: z.array(z.string()),
          handler: z.string().nullable()
        })
        .partial()
    ),
    async (c) => {
      const { botId, key } = c.req.valid('param')
      const partial = c.req.valid('json')

      const text = await prisma.botText.update({
        where: {
          key_bot_id: { key, bot_id: botId }
        },
        data: partial
      })

      return c.json({ text })
    }
  )

  // DELETE /api/admin/bots/:botId/texts/:key
  .delete(
    '/:botId/texts/:key',
    requireAuth,
    zValidator('param', z.object({ botId: z.string(), key: z.string() })),
    async (c) => {
      const { botId, key } = c.req.valid('param')

      await prisma.botText.delete({
        where: {
          key_bot_id: { key, bot_id: botId }
        }
      })

      return c.json({ success: true })
    }
  )

  // ── Contacts ───────────────────────────────────────────────────────────

  // GET /api/admin/bots/:botId/contacts
  .get('/:botId/contacts', requireAuth, async (c) => {
    const botId = c.req.param('botId')
    const user = c.get('user')

    const contacts = await prisma.contact.findMany({
      where: {
        bot_id: botId,
        bot: {
          organization: {
            user_id: user.id
          }
        }
      },
      include: {
        conversation: true,
        _count: {
          select: { appointments: true }
        }
      }
    })

    return c.json({ contacts })
  })

  // GET /api/admin/bots/:botId/contacts/:contactId
  .get('/:botId/contacts/:contactId', requireAuth, async (c) => {
    const botId = c.req.param('botId')
    const contactId = c.req.param('contactId')
    const user = c.get('user')

    const contact = await prisma.contact.findFirst({
      where: {
        id: contactId,
        bot_id: botId,
        bot: {
          organization: {
            user_id: user.id
          }
        }
      },
      include: {
        conversation: true,
        appointments: {
          include: {
            service: true,
            availability: true
          }
        }
      }
    })

    if (!contact) {
      return c.json({ error: 'Contact not found' }, 404)
    }

    return c.json({ contact })
  })

  // PUT /api/admin/bots/:botId/contacts/:contactId — update contact
  .put(
    '/:botId/contacts/:contactId',
    requireAuth,
    zValidator('param', z.object({ botId: z.string(), contactId: z.string() })),
    zValidator(
      'json',
      z
        .object({
          name: z.string()
        })
        .partial()
    ),
    async (c) => {
      const { contactId } = c.req.valid('param')
      const partial = c.req.valid('json')

      const contact = await prisma.contact.update({
        where: { id: contactId },
        data: {
          ...(partial.name !== undefined && { name: partial.name })
        }
      })

      return c.json({ contact })
    }
  )

  // ── Lists ─────────────────────────────────────────────────────────────

  // GET /api/admin/bots/:botId/lists
  .get('/:botId/lists', requireAuth, async (c) => {
    const botId = c.req.param('botId')
    const user = c.get('user')

    const lists = await prisma.botList.findMany({
      where: {
        bot_id: botId,
        bot: {
          organization: {
            user_id: user.id
          }
        }
      },
      include: {
        rows: {
          orderBy: { order: 'asc' }
        }
      }
    })

    return c.json({ lists })
  })

  // ── Services ──────────────────────────────────────────────────────────

  // GET /api/admin/bots/:botId/services
  .get('/:botId/services', requireAuth, async (c) => {
    const botId = c.req.param('botId')
    const user = c.get('user')

    const services = await prisma.service.findMany({
      where: {
        bot_id: botId,
        bot: {
          organization: {
            user_id: user.id
          }
        }
      },
      include: {
        availability: true
      }
    })

    return c.json({ services })
  })

export default app
