import { NextResponse } from 'next/server'
import prisma from '@/lib/prismaClient'
import { requireAuth } from '@/lib/auth-guard'

interface Params {
  params: Promise<{ botId: string; key: string }>
}

export async function GET(request: Request, { params }: Params) {
  const { session, error } = await requireAuth()
  if (error) return error

  const { botId, key } = await params

  const text = await prisma.botText.findFirst({
    where: {
      key,
      bot_id: botId,
      bot: {
        organization: {
          user_id: session.user.id
        }
      }
    }
  })

  if (!text) {
    return NextResponse.json({ error: 'Text not found' }, { status: 404 })
  }

  return NextResponse.json({ text })
}

export async function PUT(request: Request, { params }: Params) {
  const { session, error } = await requireAuth()
  if (error) return error

  const { botId, key } = await params
  const body = await request.json()
  const { value, triggers, handler } = body

  const text = await prisma.botText.update({
    where: {
      key_bot_id: {
        key,
        bot_id: botId
      }
    },
    data: {
      value,
      triggers: triggers ?? undefined,
      handler: handler ?? undefined
    }
  })

  return NextResponse.json({ text })
}
