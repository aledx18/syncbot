import { BotsCards } from '@/components/bots/cards'
import { serverFetch } from '@/lib/server-fetch'
import { getQueryClient } from '@/lib/get-query-client'
import { GetBotsResponse } from '@/types/api-types'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

async function getBots() {
  return serverFetch<GetBotsResponse>('api/admin/bots')
}

export default async function DashboardPage() {
  const queryClient = getQueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['bots'],
    queryFn: getBots
  })

  return (
    <div className='p-4 md:p-6'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold'>Select a Bot</h1>
        <p className='text-sm text-muted-foreground mt-1'>
          Choose a bot to manage its contacts and settings
        </p>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <BotsCards />
      </HydrationBoundary>
    </div>
  )
}
