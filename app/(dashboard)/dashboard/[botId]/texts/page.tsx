import prisma from '@/lib/prismaClient'
import { TextsTable } from './components/texts-table'

interface PageProps {
  params: Promise<{ botId: string }>
}

export default async function TextsPage({ params }: PageProps) {
  const { botId } = await params

  const texts = await prisma.botText.findMany({
    where: {
      bot_id: botId
    }
  })

  return (
    <div className='p-4 md:p-6'>
      <h1 className='text-2xl font-bold mb-6'>Texts</h1>
      <TextsTable botId={botId} initialData={{ texts, total: texts.length }} />
    </div>
  )
}
