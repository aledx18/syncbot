'use client'

import { SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar'

import { UserButton } from '@/components/user/user-button'

export function NavUser() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <UserButton />
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
