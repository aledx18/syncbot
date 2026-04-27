/**
 * Fetch para Client Components (browser)
 * Las cookies se envían automáticamente con credentials: 'include'
 */
export async function clientFetch<T>(endpoint: string): Promise<T> {
  const res = await fetch(endpoint, {
    credentials: 'include',
    cache: 'no-store'
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch ${endpoint}: ${res.status}`)
  }

  return res.json()
}
