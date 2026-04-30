import { BotsCards } from '@/components/bots/cards'
import { Spinner } from '@/components/ui/spinner'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    return (
      <div className='flex justify-center my-auto'>
        <Spinner color='current' />
      </div>
    )
  }
  return (
    <div className='p-4 md:p-6'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold'>Select a Bot</h1>
        <p className='text-sm text-muted-foreground mt-1'>
          Choose a bot to manage its contacts and settings
        </p>
      </div>
      <BotsCards />
    </div>
  )
}
