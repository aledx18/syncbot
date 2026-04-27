import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { ContactsTable } from '@/components/bots/contacts-table'
import { serverFetch } from '@/lib/server-fetch'
import { getQueryClient } from '@/lib/get-query-client'

interface PageProps {
  params: Promise<{ botId: string }>
}

async function getContacts(botId: string) {
  return serverFetch<{ contacts: unknown[]; total: number }>(
    `api/admin/bots/${botId}/contacts`
  )
}

export default async function ContactsPage({ params }: PageProps) {
  const { botId } = await params
  const queryClient = getQueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['contacts', botId],
    queryFn: () => getContacts(botId)
  })

  return (
    <div className='p-4 md:p-6'>
      <h1 className='text-2xl font-bold mb-6'>Contacts</h1>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ContactsTable botId={botId} />
      </HydrationBoundary>
    </div>
  )
}
