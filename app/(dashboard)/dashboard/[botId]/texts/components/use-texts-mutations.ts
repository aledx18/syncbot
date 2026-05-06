'use client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { BotText } from '@/generated/prisma/client'

async function updateText(
  botId: string,
  key: string,
  payload: { value?: string; triggers?: string[] }
): Promise<BotText> {
  const res = await fetch(`/api/admin/bots/${botId}/texts/${key}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload)
  })
  if (!res.ok) throw new Error('Failed to update text')
  const data = await res.json()
  return data.text as BotText
}

function updateTextInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  botId: string,
  key: string,
  patch: Partial<BotText>
) {
  queryClient.setQueryData<{ texts: BotText[]; total: number }>(
    ['texts', botId],
    (old) => {
      if (!old) return old
      return {
        ...old,
        texts: old.texts.map((t) => (t.key === key ? { ...t, ...patch } : t))
      }
    }
  )
}

export function useTriggers(botId: string, textKey: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (triggers: string[]) =>
      updateText(botId, textKey, { triggers }),

    onMutate: async (triggers) => {
      await queryClient.cancelQueries({ queryKey: ['texts', botId] })
      const previous = queryClient.getQueryData(['texts', botId])
      updateTextInCache(queryClient, botId, textKey, { triggers })
      return { previous }
    },

    onError: (_err, _triggers, ctx) => {
      if (ctx?.previous)
        queryClient.setQueryData(['texts', botId], ctx.previous)
      toast.error('Failed to update triggers. Please try again.')
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['texts', botId] })
    }
  })
}

export function useUpdateTextValue(botId: string, textKey: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (value: string) => updateText(botId, textKey, { value }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['texts', botId] })
      toast.success('Text updated successfully')
    },
    onError: () => {
      toast.error('Failed to update text. Please try again.')
    }
  })
}
