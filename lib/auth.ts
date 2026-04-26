// lib/auth.ts
import { createAuthClient } from 'better-auth/react'
import { cache } from 'react'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  fetchOptions: {
    credentials: 'include'
  }
})

export const { signIn, signUp, signOut, useSession } = authClient

// 👇 cache() deduplica llamadas en el mismo request
export const getServerSession = cache(async (cookieHeader: string | null) => {
  console.log('🔍 getServerSession ejecutado')
  if (!cookieHeader) return null
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/api/auth/get-session`,
      {
        headers: { cookie: cookieHeader },
        cache: 'no-store' // 👈 no cachear en fetch cache, solo en React cache
      }
    )
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
})
