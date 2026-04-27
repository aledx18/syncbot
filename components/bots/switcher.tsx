'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BotIcon, ChevronsUpDown } from 'lucide-react'

import { useQuery } from '@tanstack/react-query'
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
import { GetBotsResponse } from '@/types/api-types'
import { clientFetch } from '@/lib/client-fetch'

async function fetchBots(): Promise<GetBotsResponse> {
  return clientFetch<GetBotsResponse>('http://localhost:3000/api/admin/bots')
}

export function BotSwitcher() {
  const router = useRouter()
  const { isMobile } = useSidebar()

  const { data } = useQuery({
    queryKey: ['bots'],
    queryFn: fetchBots
  })

  const bots = data?.bots ?? []

  // Si no hay bots, no renderizamos nada
  if (bots.length === 0) {
    return null
  }

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
                <span className='truncate font-medium'>Select a Bot</span>
                <span className='truncate text-xs text-muted-foreground'>
                  {bots.length} bot{bots.length !== 1 ? 's' : ''} available
                </span>
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
              <DropdownMenuItem
                key={bot.id}
                onClick={() => router.push(`/dashboard/${bot.id}`)}
                className='gap-2 cursor-pointer'
              >
                <div className='flex size-6 items-center justify-center rounded-md border bg-muted'>
                  <BotIcon className='size-3.5 shrink-0' />
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='truncate font-medium'>{bot.name}</div>
                  <div className='truncate text-xs text-muted-foreground'>
                    {bot.phone_number_id}
                  </div>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                    bot.is_active
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                  }`}
                >
                  {bot.is_active ? 'Active' : 'Inactive'}
                </span>
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
