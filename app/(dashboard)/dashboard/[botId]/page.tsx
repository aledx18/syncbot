interface PageProps {
  params: Promise<{ botId: string }>
}

export default async function BotDashboardPage({ params }: PageProps) {
  const { botId } = await params

  return (
    <div className='p-4 md:p-6'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold'>Bot Dashboard</h1>
        <p className='text-sm text-muted-foreground mt-1'>
          Manage your bot settings and view contacts {botId}
        </p>
      </div>
    </div>
  )
}
