'use client'

import { z } from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/components/ui/field'

const contactSchema = z.object({
  name: z.string().optional()
})

type FormValues = z.infer<typeof contactSchema>

interface EditContactModalProps {
  isOpen: boolean
  onClose: () => void
  contact: {
    name?: string | null
  }
  onSubmit: (values: FormValues) => void
  loading?: boolean
}

export const EditContactModal: React.FC<EditContactModalProps> = ({
  isOpen,
  onClose,
  contact,
  onSubmit,
  loading
}) => {
  const form = useForm<FormValues>({
    defaultValues: {
      name: contact.name ?? undefined
    },
    resolver: zodResolver(contactSchema)
  })

  return (
    <Modal
      title='Edit Contact'
      description='Update contact information.'
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className='flex flex-col gap-4'>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name='name'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Contact Name</FieldLabel>
                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    placeholder='Contact name'
                    autoComplete='off'
                    required
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>

        <Field orientation='horizontal' className='justify-end'>
          <Button variant='outline' type='button' onClick={onClose}>
            Cancel
          </Button>
          <Button type='submit' disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </Field>
      </div>

      {/* <form onSubmit={form.handleSubmit(onSubmit)} className='pt-6 space-y-4'>
        <div>
          <label htmlFor='name' className='text-sm text-muted-foreground'>
            Name
          </label>
          <Input
            id='name'
            {...form.register('name')}
            placeholder='Contact name'
          />
        </div>
        <div>
          <label
            htmlFor='phone_number'
            className='text-sm text-muted-foreground'
          >
            Phone
          </label>
          <Input
            id='phone_number'
            {...form.register('phone_number')}
            placeholder='+54...'
          />
        </div>
        <div className='flex justify-end gap-2'>
          <Button variant='outline' type='button' onClick={onClose}>
            Cancel
          </Button>
          <Button type='submit' disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form> */}
    </Modal>
  )
}
