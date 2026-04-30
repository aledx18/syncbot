'use client'

import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { BotIcon, ChevronsUpDown } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import type { Bot } from '@/generated/prisma/client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'

interface BotsResponse {
  bots: Bot[]
}

async function fetchBots(): Promise<BotsResponse> {
  const res = await fetch('/api/admin/bots', { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch bots')
  return res.json()
}

export function BotSwitcher() {
  const router = useRouter()
  const params = useParams()
  const { isMobile } = useSidebar()

  const { data, isLoading } = useQuery({
    queryKey: ['bots'],
    queryFn: fetchBots,
    staleTime: 5 * 60 * 1000
  })

  const bots = data?.bots ?? []

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-muted'>
                <BotIcon className='size-4' />
              </div>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                {isLoading ? (
                  <div className='flex flex-col gap-1'>
                    <Skeleton className='h-4 w-24' />
                    <Skeleton className='h-3 w-16' />
                  </div>
                ) : (
                  <>
                    <span className='font-medium truncate'>
                      {bots[0]?.name ?? 'No bot'}
                    </span>
                    <span className='text-xs text-muted-foreground truncate'>
                      {bots.length} bot{bots.length === 1 ? '' : 's'}
                    </span>
                  </>
                )}
              </div>
              <ChevronsUpDown className='ml-auto' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
            align='start'
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className='text-xs text-muted-foreground'>
              Your Bots
            </DropdownMenuLabel>
            {bots.map((bot) => (
              <DropdownMenuItem key={bot.id} asChild className='cursor-pointer'>
                <Link href={`/dashboard/${bot.id}`}>
                  <div className='flex size-6 items-center justify-center rounded-md border bg-muted'>
                    <BotIcon className='size-3.5 shrink-0' />
                  </div>
                  <div className='flex flex-col'>
                    <span className='font-medium'>{bot.name}</span>
                    <span className='text-xs text-muted-foreground'>
                      {bot.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className='gap-2 cursor-pointer'>
              <Link href='/dashboard'>
                <div className='flex size-6 items-center justify-center rounded-md border bg-muted'>
                  <BotIcon className='size-3.5 shrink-0' />
                </div>
                <div className='font-medium text-muted-foreground'>
                  View all bots
                </div>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
