'use client'

import { SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar'

import { UserButton } from './user/user-button'

export function NavUser() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <UserButton />
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
