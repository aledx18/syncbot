'use client'

import { useAuth, useSession } from '@better-auth-ui/react'
import { Check, CirclePlus } from 'lucide-react'

import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSubContent
} from '@/components/ui/dropdown-menu'
import { UserView } from './user-view'

/**
 * Render the submenu content for switching between multiple authenticated sessions.
 *
 * Shows the current session with a checkmark, lists other device sessions that can be activated,
 * and provides an option to add a new account. This component should be rendered inside a
 * DropdownMenuSub to defer the useListDeviceSessions query until the submenu is opened.
 *
 * @returns The switch account submenu content as a JSX element
 */
export function SwitchAccountMenu() {
  const { basePaths, viewPaths, localization, Link } = useAuth()
  const { data: session } = useSession()
  // TODO: disabled multi-session request — no device sessions
  const isPending = false

  return (
    <DropdownMenuSubContent className='min-w-48 md:min-w-56 max-w-[48svw]'>
      <DropdownMenuItem>
        <UserView isPending={isPending} />

        {!isPending && <Check className='ml-auto' />}
      </DropdownMenuItem>

      {/* Multi-session disabled — no device sessions to list */}

      <DropdownMenuSeparator />

      <DropdownMenuItem asChild>
        <Link href={`${basePaths.auth}/${viewPaths.auth.signIn}`}>
          <CirclePlus className='text-muted-foreground' />

          {localization.auth.addAccount}
        </Link>
      </DropdownMenuItem>
    </DropdownMenuSubContent>
  )
}
