'use client'

import { useQuery } from '@tanstack/react-query'
import { MessageSquareIcon, PlusIcon, XIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { BotText } from '@/generated/prisma/client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'

import { useTriggers, useUpdateTextValue } from './use-texts-mutations'

// ── API ──────────────────────────────────────────────────────────────────────

async function fetchTexts(
  botId: string
): Promise<{ texts: BotText[]; total: number }> {
  const res = await fetch(`/api/admin/bots/${botId}/texts`, {
    credentials: 'include'
  })
  if (!res.ok) throw new Error('Failed to fetch texts')
  return res.json()
}

// ── TextCard ──────────────────────────────────────────────────────────────────

interface TextCardProps {
  text: BotText
  botId: string
}

function TextCard({ text, botId }: TextCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draftValue, setDraftValue] = useState(text.value)
  const [newTrigger, setNewTrigger] = useState('')

  const updateValueMutation = useUpdateTextValue(botId, text.key)
  const triggersMutation = useTriggers(botId, text.key)

  const handleEdit = () => setIsEditing(true)

  const handleCancel = () => {
    setDraftValue(text.value)
    setIsEditing(false)
    setNewTrigger('')
  }

  const handleAddTrigger = () => {
    const trimmed = newTrigger.trim()
    if (!trimmed) return
    if (text.triggers.includes(trimmed)) {
      toast.error('Trigger already exists.')
      return
    }
    triggersMutation.mutate([...text.triggers, trimmed], {
      onSuccess: () => setNewTrigger('')
    })
  }

  const handleRemoveTrigger = (trigger: string) => {
    triggersMutation.mutate(text.triggers.filter((t) => t !== trigger))
  }

  const isBusy = updateValueMutation.isPending || triggersMutation.isPending

  return (
    <Card className='flex flex-col h-full'>
      <CardHeader>
        <div className='flex items-start justify-between'>
          <div className='flex-1 min-w-0'>
            <Badge variant='outline' className='mb-3'>
              <MessageSquareIcon className='size-4 mr-1 text-green-600' />
              {text.key}
            </Badge>
            <CardTitle>
              {text.value.slice(0, 50)}
              {text.value.length > 50 ? '...' : ''}
            </CardTitle>
          </div>
          {text.handler && (
            <Badge variant='secondary' className='shrink-0'>
              {text.handler}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className='flex flex-col flex-1 space-y-3'>
        {/* ── Message ────────────────────────────────────────────────── */}
        <div className='space-y-2'>
          <Label className='text-xs text-muted-foreground'>Message</Label>
          <Input
            value={draftValue}
            readOnly={!isEditing}
            onChange={(e) => setDraftValue(e.target.value)}
            onClick={() => !isEditing && handleEdit()}
            className={
              !isEditing ? 'cursor-pointer text-muted-foreground' : undefined
            }
          />
        </div>

        {/* ── Triggers ───────────────────────────────────────────────── */}
        <div className='space-y-2'>
          <Label className='text-xs text-muted-foreground'>
            Triggers ({text.triggers.length})
          </Label>
          <div className='flex flex-wrap gap-2'>
            {text.triggers.map((trigger) => (
              <Button
                key={`${text.id}-${trigger}`}
                type='button'
                variant='secondary'
                size='xs'
                disabled={isBusy}
                onClick={() => handleRemoveTrigger(trigger)}
              >
                {trigger}
                <XIcon className='size-3' />
              </Button>
            ))}

            <Popover
              onOpenChange={(open) => {
                if (!open) setNewTrigger('')
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  type='button'
                  variant='ghost'
                  size='xs'
                  disabled={isBusy}
                >
                  Add <PlusIcon className='size-3' />
                </Button>
              </PopoverTrigger>

              <PopoverContent align='start'>
                <div className='flex w-full items-center gap-2'>
                  <Input
                    autoFocus
                    value={newTrigger}
                    onChange={(e) => setNewTrigger(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddTrigger()
                    }}
                    placeholder='e.g. Hola'
                    disabled={isBusy}
                    type='text'
                  />
                  <Button
                    type='button'
                    variant='default'
                    size='sm'
                    onClick={handleAddTrigger}
                    disabled={isBusy || !newTrigger.trim()}
                  >
                    Add
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Separator />

        {/* ── Footer ────────────────────────────────────────────────── */}
        <div className='flex items-center justify-between text-xs text-muted-foreground'>
          <span>Updated {new Date(text.updated_at).toLocaleDateString()}</span>

          <div className='flex gap-1'>
            {isEditing ? (
              <>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={handleCancel}
                  disabled={updateValueMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type='button'
                  variant='default'
                  size='sm'
                  onClick={() => {
                    updateValueMutation.mutate(draftValue, {
                      onSuccess: () => setIsEditing(false)
                    })
                  }}
                  disabled={updateValueMutation.isPending}
                >
                  {updateValueMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
              </>
            ) : (
              <Button
                type='button'
                variant='default'
                size='sm'
                onClick={handleEdit}
              >
                Edit
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ── TextsTable ────────────────────────────────────────────────────────────────

export function TextsTable({
  botId,
  initialData
}: {
  botId: string
  initialData: { texts: BotText[]; total: number }
}) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['texts', botId],
    queryFn: () => fetchTexts(botId),
    staleTime: 20 * 60 * 1000,
    initialData
  })

  if (isLoading) return <p>Loading...</p>
  if (isError) return <p>Error: {error.message}</p>

  const { texts } = data

  if (texts.length === 0) {
    return (
      <div className='text-center py-12 text-muted-foreground'>
        <MessageSquareIcon className='size-12 mx-auto mb-4 opacity-50' />
        <p>No texts found for this bot.</p>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch'>
      {texts.map((text) => (
        <TextCard key={text.id} text={text} botId={botId} />
      ))}
    </div>
  )
}
