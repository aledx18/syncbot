import ContactsTable from './components/contacts-table'

interface PageProps {
  params: Promise<{ botId: string }>
}

export default async function ContactsPage({ params }: PageProps) {
  const { botId } = await params

  return (
    <div className='p-4 md:p-6'>
      <h1 className='text-2xl font-bold mb-6'>Contacts</h1>
      <ContactsTable botId={botId} />
    </div>
  )
}
