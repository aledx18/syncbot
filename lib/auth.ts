import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  fetchOptions: {
    credentials: 'include'
  }
})

export const { signIn, signUp, signOut, useSession, getSession } = authClient

export async function getServerSession(cookieHeader: string | null) {
  if (!cookieHeader) return null
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/api/auth/get-session`,
      {
        headers: { cookie: cookieHeader },
        // Importante: no cachear esto
        cache: 'no-store'
      }
    )
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}
