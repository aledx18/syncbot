import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getServerSession } from '@/lib/auth'

export default async function DashboardPage() {
  const cookieHeader = (await headers()).get('cookie')
  const session = await getServerSession(cookieHeader)

  if (!session) redirect('/auth/sign-in')
  return (
    <div>
      <h1>Welcome {session.user.name}</h1>
    </div>
  )
}
