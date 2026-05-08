import { useQuery } from '@tanstack/react-query'
import { client } from '@/lib/honoclient'

export function useGetContacts(botId: string) {
  const query = useQuery({
    enabled: !!botId,
    queryKey: ['contacts', { botId }],
    queryFn: async () => {
      const response = await client.api.admin.bots[':botId'].contacts.$get({
        param: { botId }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch contacts')
      }

      const data = await response.json()
      return data.contacts
    }
  })

  return query
}
