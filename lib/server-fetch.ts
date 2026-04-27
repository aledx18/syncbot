import { cookies } from 'next/headers'

export async function serverFetch<T>(endpoint: string): Promise<T> {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore.toString()

  const res = await fetch(`http://localhost:3000/${endpoint}`, {
    headers: {
      Cookie: cookieHeader // Forward cookies automáticamente
    },
    // No cachear requests autenticados por defecto
    cache: 'no-store'
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch ${endpoint}: ${res.status}`)
  }

  return res.json()
}
