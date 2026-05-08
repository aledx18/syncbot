import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { client } from '@/lib/honoclient'
import { InferRequestType, InferResponseType } from 'hono'

type EditContactInput = InferRequestType<
  (typeof client.api.admin.bots)[':botId']['contacts'][':contactId']['$put']
>['json']

type EditContactResponse = InferResponseType<
  (typeof client.api.admin.bots)[':botId']['contacts'][':contactId']['$put']
>

export const useEditContact = (botId: string, contactId: string) => {
  const queryClient = useQueryClient()

  return useMutation<
    EditContactResponse,
    Error,
    EditContactInput,
    { previous: unknown }
  >({
    mutationFn: async (input) => {
      const endpoint = client.api.admin.bots[':botId'].contacts[':contactId']
      const res = await endpoint.$put({
        param: { botId, contactId },
        json: input
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Failed to update contact')
      }
      return res.json()
    },
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: ['contacts', { botId }] })
      const previous = queryClient.getQueryData(['contacts', { botId }])
      queryClient.setQueryData(
        ['contacts', { botId }],
        (
          old:
            | { contacts?: Array<{ id: string } & Record<string, unknown>> }
            | undefined
        ) => {
          if (!old?.contacts) return old
          return {
            ...old,
            contacts: old.contacts.map((c) =>
              c.id === contactId ? { ...c, ...patch } : c
            )
          }
        }
      )
      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(['contacts', { botId }], ctx.previous)
      }
      toast.error('Failed to update contact. Please try again.')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts', { botId }] })
    },
    onSuccess: () => {
      toast.success('Contact updated successfully')
    }
  })
}
