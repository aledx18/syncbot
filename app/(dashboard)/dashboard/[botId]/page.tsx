import Link from 'next/link'
import { ChevronRightIcon, UsersIcon, Settings2Icon } from 'lucide-react'

interface PageProps {
  params: Promise<{ botId: string }>
}

export default async function BotDashboardPage({ params }: PageProps) {
  const { botId } = await params

  return (
    <div className='p-4 md:p-6'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold'>Bot Dashboard</h1>
        <p className='text-sm text-muted-foreground mt-1'>
          Manage your bot settings and view contacts
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        <Link
          href={`/dashboard/${botId}/contacts`}
          className='group block'
        >
          <div className='rounded-lg border bg-card text-card-foreground shadow-sm p-6 hover:border-primary/50 hover:shadow-md transition-all'>
            <div className='flex items-start justify-between'>
              <div className='flex items-center gap-3'>
                <div className='flex size-10 items-center justify-center rounded-lg bg-muted'>
                  <UsersIcon className='size-5 text-muted-foreground' />
                </div>
                <div>
                  <h3 className='font-semibold'>Contacts</h3>
                  <p className='text-sm text-muted-foreground'>
                    Manage bot contacts
                  </p>
                </div>
              </div>
              <ChevronRightIcon className='size-5 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition-all' />
            </div>
          </div>
        </Link>

        <Link
          href={`/dashboard/${botId}/settings`}
          className='group block'
        >
          <div className='rounded-lg border bg-card text-card-foreground shadow-sm p-6 hover:border-primary/50 hover:shadow-md transition-all'>
            <div className='flex items-start justify-between'>
              <div className='flex items-center gap-3'>
                <div className='flex size-10 items-center justify-center rounded-lg bg-muted'>
                  <Settings2Icon className='size-5 text-muted-foreground' />
                </div>
                <div>
                  <h3 className='font-semibold'>Settings</h3>
                  <p className='text-sm text-muted-foreground'>
                    Configure bot settings
                  </p>
                </div>
              </div>
              <ChevronRightIcon className='size-5 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition-all' />
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
