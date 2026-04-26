import { AppSidebar } from '@/components/app-sidebar'
import { BotProvider } from '@/components/bot-provider'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { getServerSession } from '@/lib/auth'
import { headers } from 'next/headers'

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession((await headers()).get('cookie'))
  if (!session) return null

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 64)',
          '--header-height': 'calc(var(--spacing) * 12)'
        } as React.CSSProperties
      }
    >
      <BotProvider>
        <AppSidebar variant='inset' />
        <SidebarInset>
          <SiteHeader />
          <div className='flex flex-1 flex-col'>
            <div className='@container/main flex flex-1 flex-col gap-2'>
              <div className='flex flex-col gap-4 md:gap-6'>{children}</div>
            </div>
          </div>
        </SidebarInset>
      </BotProvider>
    </SidebarProvider>
  )
}
