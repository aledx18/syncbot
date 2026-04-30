'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { BotIcon, ChevronRightIcon } from 'lucide-react'
import type { Bot, Organization } from '@/generated/prisma/client'

async function fetchBots(): Promise<{
  bots: (Bot & { organization: Organization })[]
}> {
  const res = await fetch('/api/admin/bots', { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch bots')
  return res.json()
}
export function BotsCards() {
  const { data, isLoading } = useQuery({
    queryKey: ['bots'],
    queryFn: fetchBots
  })

  const bots = data?.bots ?? []

  if (isLoading) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {[1, 2, 3].map((i) => (
          <div key={i} className='rounded-lg border bg-card p-6 animate-pulse'>
            <div className='flex items-center gap-3'>
              <div className='size-10 rounded-lg bg-muted' />
              <div className='space-y-2'>
                <div className='h-4 w-24 bg-muted rounded' />
                <div className='h-3 w-16 bg-muted rounded' />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (bots.length === 0) {
    return (
      <div className='text-center py-12 text-muted-foreground'>
        <BotIcon className='size-12 mx-auto mb-4 opacity-50' />
        <p>No bots found. Create your first bot to get started.</p>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
      {bots.map((bot) => (
        <Link
          key={bot.id}
          href={`/dashboard/${bot.id}`}
          className='group block'
        >
          <div className='rounded-lg border bg-card text-card-foreground shadow-sm p-6 hover:border-primary/50 hover:shadow-md transition-all'>
            <div className='flex items-start justify-between'>
              <div className='flex items-center gap-3'>
                <div className='flex size-10 items-center justify-center rounded-lg bg-muted'>
                  <BotIcon className='size-5 text-muted-foreground' />
                </div>
                <div>
                  <h3 className='font-semibold'>{bot.name}</h3>
                  <p className='text-sm text-muted-foreground'>
                    {bot.phone_number_id}
                  </p>
                </div>
              </div>
              <ChevronRightIcon className='size-5 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition-all' />
            </div>

            <div className='mt-4 flex items-center gap-2'>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  bot.is_active
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                }`}
              >
                {bot.is_active ? 'Active' : 'Inactive'}
              </span>
              {bot.organization && (
                <span className='text-xs text-muted-foreground'>
                  {bot.organization.name}
                </span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
