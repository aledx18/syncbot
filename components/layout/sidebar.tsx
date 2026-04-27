'use client'

import { useParams, usePathname } from 'next/navigation'

import { BotSwitcher } from '@/components/bots/switcher'
import { NavMain } from '@/components/nav/main'
import { NavSecondary } from '@/components/nav/secondary'
import { NavUser } from '@/components/nav/user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader
} from '@/components/ui/sidebar'
import {
  Table2Icon,
  CircleHelpIcon,
  SearchIcon,
  LayoutDashboardIcon
} from 'lucide-react'

// ============================================================
// Navegación cuando NO hay bot seleccionado (landing /dashboard)
// ============================================================

const landingNav = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboardIcon
  }
]

const landingSecondaryNav = [
  {
    title: 'Search',
    href: '/search',
    icon: SearchIcon
  },
  {
    title: 'Get Help',
    href: '/help',
    icon: CircleHelpIcon
  }
]

// ============================================================
// Navegación cuando hay bot seleccionado (/dashboard/[botId]/*)
// ============================================================

function getBotNav(botId: string) {
  return [
    {
      title: 'Overview',
      href: `/dashboard/${botId}`,
      icon: LayoutDashboardIcon
    },
    {
      title: 'Contacts',
      href: `/dashboard/${botId}/contacts`,
      icon: Table2Icon
    }
  ]
}

// ============================================================
// Componente
// ============================================================

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const params = useParams()
  const pathname = usePathname()

  // Si hay botId en params, estamos en modo bot activo
  const botId = params?.botId as string | undefined

  const currentNav = botId ? getBotNav(botId) : landingNav
  const currentSecondaryNav = botId ? [] : landingSecondaryNav

  return (
    <Sidebar collapsible='offcanvas' {...props}>
      <SidebarHeader>
        <BotSwitcher />
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={currentNav} activeHref={pathname} />
        {currentSecondaryNav.length > 0 && (
          <NavSecondary items={currentSecondaryNav} className='mt-auto' />
        )}
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
