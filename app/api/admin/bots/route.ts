import { NextResponse } from 'next/server'
import prisma from '@/lib/prismaClient'
import { requireAuth } from '@/lib/auth-guard'

export async function GET() {
  const { session, error } = await requireAuth()
  if (error) return error

  const bots = await prisma.bot.findMany({
    where: {
      organization: {
        user_id: session.user.id
      }
    },
    include: {
      organization: true
    }
  })

  return NextResponse.json({ bots })
}