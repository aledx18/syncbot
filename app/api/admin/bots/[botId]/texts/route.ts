import { NextResponse } from 'next/server'
import prisma from '@/lib/prismaClient'
import { requireAuth } from '@/lib/auth-guard'

interface Params {
  params: Promise<{ botId: string }>
}

export async function GET(request: Request, { params }: Params) {
  const { session, error } = await requireAuth()
  if (error) return error

  const { botId } = await params

  const texts = await prisma.botText.findMany({
    where: {
      bot_id: botId,
      bot: {
        organization: {
          user_id: session.user.id
        }
      }
    }
  })

  return NextResponse.json({ texts })
}

export async function POST(request: Request, { params }: Params) {
  const { session, error } = await requireAuth()
  if (error) return error

  const { botId } = await params
  const body = await request.json()
  const { key, value, triggers, handler } = body

  if (!key || !value) {
    return NextResponse.json(
      { error: 'key and value are required' },
      { status: 400 }
    )
  }

  const text = await prisma.botText.upsert({
    where: {
      key_bot_id: {
        key,
        bot_id: botId
      }
    },
    update: {
      value,
      triggers: triggers ?? [],
      handler: handler ?? null
    },
    create: {
      key,
      value,
      triggers: triggers ?? [],
      handler: handler ?? null,
      bot_id: botId
    }
  })

  return NextResponse.json({ text })
}