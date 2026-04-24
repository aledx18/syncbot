'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import type { ReactNode } from 'react'

import { AuthProvider } from '../auth/auth-provider'
import { Toaster } from '../ui/sonner'
import { authClient } from '@/lib/auth'

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  return (
    <AuthProvider
      authClient={authClient}
      appearance={{ theme, setTheme }}
      redirectTo='/dashboard'
      navigate={({ to, replace }) =>
        replace ? router.replace(to) : router.push(to)
      }
      Link={Link}
    >
      {children}

      <Toaster />
    </AuthProvider>
  )
}
