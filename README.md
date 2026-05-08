# Syncbot

Frontend for Syncbot — Next.js 16 + Hono backend + better-auth. React Query para estado de servidor, Hono como API layer.

## Stack

| Category | Choice |
|----------|--------|
| Framework | Next.js 16 (App Router, React 19, Turbopack) |
| Package Manager | Bun |
| Auth | better-auth + @better-auth-ui/react |
| API Layer | Hono + hono/vercel adapter |
| Server State | TanStack Query (React Query v5) |
| API Client | Hono client (`hc<AppType>`) |
| Validation | Zod + zodValidator (@hono/zod-validator) |
| UI | shadcn/ui (Radix primitives, OKLCH colors) |
| Styling | Tailwind CSS v4 (CSS-first config via `@theme inline`) |
| Forms | react-hook-form + @hookform/resolvers/zod |
| Linting | Biome |
| Formatting | Prettier (.ts/.tsx) |
| Database | Prisma (PrismaClient with adapter) |

## Setup

```bash
bun install
cp .env.example .env.local
bun dev
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js App Router                       │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  app/api/[[...route]]/route.ts  (Hono + Vercel)      │    │
│  │  ├── auth handlers (Better Auth)                      │    │
│  │  └── /api/admin/bots/* routes (admin-bots router)     │    │
│  └──────────────────────────────────────────────────────┘    │
│                              │                               │
│                     hc<AppType> client                       │
│                              │                               │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  React Query hooks (useGetTexts, useEditText, etc.)  │    │
│  │  ├── Optimistic updates                             │    │
│  │  ├── Toast notifications                             │    │
│  │  └── Automatic cache invalidation                   │    │
│  └──────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## API Layer — Hono + Vercel

### Route Structure

```
app/api/
├── [[...route]]/
│   ├── route.ts          # Hono app entry + Vercel handler
│   └── routers/
│       └── admin-bots.ts # All /api/admin/bots/* routes
```

### route.ts

```typescript
import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { auth } from '@/lib/auth'
import adminBotsRouter from './routers/admin-bots'

const app = new Hono().basePath('/api')

// Better Auth
app.on(['GET', 'POST'], '/auth/*', (c) => auth.handler(c.req.raw))

// Admin routes
const routes = app.route('/admin/bots', adminBotsRouter)

export const GET = handle(routes)
export const POST = handle(routes)
export const PUT = handle(routes)
export const DELETE = handle(routes)
export const PATCH = handle(routes)

export type AppType = typeof routes
```

### admin-bots.ts — Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/bots` | List all bots for user |
| GET | `/api/admin/bots/:botId/texts` | List all texts for bot |
| POST | `/api/admin/bots/:botId/texts` | Create text |
| GET | `/api/admin/bots/:botId/texts/:key` | Get single text |
| PUT | `/api/admin/bots/:botId/texts/:key` | Update text (partial) |
| DELETE | `/api/admin/bots/:botId/texts/:key` | Delete text |
| GET | `/api/admin/bots/:botId/contacts` | List contacts |
| GET | `/api/admin/bots/:botId/contacts/:contactId` | Get single contact |
| PUT | `/api/admin/bots/:botId/contacts/:contactId` | Update contact (partial) |
| GET | `/api/admin/bots/:botId/lists` | List lists |
| GET | `/api/admin/bots/:botId/services` | List services |

### Zod Validation Pattern

Todos los endpoints mutativos usan `zValidator`:

```typescript
.put(
  '/:botId/texts/:key',
  requireAuth,
  zValidator('param', z.object({ botId: z.string(), key: z.string() })),
  zValidator(
    'json',
    z.object({ value: z.string(), triggers: z.array(z.string()), handler: z.string().nullable() }).partial()
  ),
  async (c) => { ... }
)
```

El `.partial()` en el json schema permite updates parciales — mandás solo los campos que querés cambiar.

## Hono Client — `hc<AppType>`

El cliente se define en `lib/honoclient.ts`:

```typescript
import { hc } from 'hono/client'
import type { AppType } from '@/app/api/[[...route]]/route'

export const client = hc<AppType>('http://localhost:3000')
```

### Usage with React Query

```typescript
// lib/honoclient.ts
export const client = hc<AppType>('http://localhost:3000')

// hooks/use-get-texts.ts
import { client } from '@/lib/honoclient'

export function useGetTexts(botId: string) {
  return useQuery({
    enabled: !!botId,
    queryKey: ['texts', { botId }],  // Object form!
    queryFn: async () => {
      const res = await client.api.admin.bots[':botId'].texts.$get({ param: { botId } })
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    }
  })
}
```

### Important: QueryKey Consistency

```typescript
// ✅ Correct — object form
queryKey: ['texts', { botId }]

// ✅ Consistent — mutations use same key
queryClient.setQueryData(['texts', { botId }], ...)

// ❌ Wrong — different key, cache won't match
queryKey: ['texts', botId]
```

### Note on Type Inference

El tipado de `hc` no infiere correctamente los `param` types para rutas con path params como `:botId` o `:key`. Usá `as any` como workaround:

```typescript
const res = await (client.api.admin.bots as any)[':botId'].texts[':key'].$put({
  param: { botId, key },
  json: { value: 'new message' }
})
```

## React Query Hooks Pattern

### Structure

```
app/(dashboard)/dashboard/[botId]/
├── texts/
│   ├── api/
│   │   ├── use-get-texts.ts      # Query hook
│   │   └── use-texts-mutations.ts # Mutation hooks
│   └── components/
│       └── texts-table.tsx
└── contacts/
    ├── api/
    │   ├── use-get-contacts.ts
    │   └── use-edit-contact.ts
    └── components/
        ├── contacts-table.tsx
        └── cell-action.tsx
```

### useGetTexts — returns `{ texts: [...] }`

```typescript
export function useGetTexts(botId: string) {
  return useQuery({
    enabled: !!botId,
    queryKey: ['texts', { botId }],
    queryFn: async () => {
      const res = await client.api.admin.bots[':botId'].texts.$get({ param: { botId } })
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      return { texts: data.texts }  // Wrapped for optimistic updates
    }
  })
}
```

### useEditText — partial updates + optimistic

```typescript
export const useEditText = (botId: string, key: string) => {
  const queryClient = useQueryClient()

  return useMutation<EditTextResponse, Error, EditTextInput, EditTextContext>({
    mutationFn: async (input) => {
      const res = await (client.api.admin.bots as any)[':botId'].texts[':key'].$put({
        param: { botId, key },
        json: input
      })
      if (!res.ok) throw new Error('Failed to update')
      return res.json()
    },
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: ['texts', { botId }] })
      const previous = queryClient.getQueryData(['texts', { botId }])
      queryClient.setQueryData(
        ['texts', { botId }],
        (old: { texts?: Array<{ key: string } & Record<string, unknown>> } | undefined) => {
          if (!old?.texts) return old
          return { ...old, texts: old.texts.map((t) => t.key === key ? { ...t, ...patch } : t) }
        }
      )
      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(['texts', { botId }], ctx.previous)
      toast.error('Failed to update')
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['texts', { botId }] }),
    onSuccess: () => toast.success('Updated')
  })
}
```

### useDeleteText — optimistic removal

```typescript
export const useDeleteText = (botId: string) => {
  return useMutation<unknown, Error, string, { previous: unknown }>({
    mutationFn: async (key) => {
      const res = await (client.api.admin.bots as any)[':botId'].texts[':key'].$delete({ param: { botId, key } })
      if (!res.ok) throw new Error('Failed to delete')
      return res.json()
    },
    onMutate: async (key) => { /* remove from cache */ },
    onError: (_err, _vars, ctx) => { /* rollback */ },
    onSettled: () => { /* invalidate */ }
  })
}
```

### useCreateText

```typescript
export const useCreateText = (botId: string) => {
  return useMutation({
    mutationFn: async (input: { key: string; value: string; triggers?: string[]; handler?: string | null }) => {
      const res = await (client.api.admin.bots as any)[':botId'].texts.$post({ json: input })
      if (!res.ok) throw new Error('Failed to create')
      return res.json()
    },
    onError: () => toast.error('Failed to create'),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['texts', { botId }] }),
    onSuccess: () => toast.success('Created')
  })
}
```

## Form Validation with react-hook-form + zod

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().optional(),
  phone_number: z.string()
})

type FormValues = z.infer<typeof contactSchema>

export const EditContactModal: React.FC<Props> = ({ contact, onSubmit }) => {
  const form = useForm<FormValues>({
    defaultValues: { name: contact.name ?? undefined, phone_number: contact.phone_number },
    resolver: zodResolver(contactSchema)
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Input {...form.register('phone_number')} />
      <Button type='submit'>Save</Button>
    </form>
  )
}
```

## Commands

```bash
bun dev          # Dev server with Turbopack (port 3000)
bun build        # Production build
bun start        # Start production server
bun lint         # Biome lint (check only)
bun format       # Prettier on .ts/.tsx
bun typecheck    # tsc --noEmit
bun db:push      # Push Prisma schema to DB
bun db:studio    # Open Prisma Studio
bun db:seed      # Seed database
```

**CI order:** lint → typecheck → build

## Adding Components

```bash
bun x shadcn@latest add button
```

Components land in `components/ui/`. Import with `@/components/ui/<name>`.

## Key Files

| File | Purpose |
|------|---------|
| `app/api/[[...route]]/route.ts` | Hono + Vercel entry point |
| `app/api/[[...route]]/routers/admin-bots.ts` | All admin API routes |
| `lib/honoclient.ts` | `hc<AppType>` client |
| `lib/auth-guard.ts` | `requireAuth` middleware for Hono |
| `lib/query-providers.tsx` | React Query provider |
| `lib/prismaClient.ts` | Prisma client singleton |

## Routes

| Path | Description |
|------|-------------|
| `/auth/sign-in` | Sign in |
| `/auth/sign-up` | Sign up |
| `/auth/reset-password` | Password reset |
| `/dashboard` | Protected dashboard |
| `/dashboard/:botId/texts` | Bot texts management |
| `/dashboard/:botId/contacts` | Bot contacts |
| `/dashboard/:botId/lists` | Bot lists |
| `/dashboard/:botId/services` | Bot services |
| `/dashboard/settings/account` | Account settings |
| `/dashboard/settings/security` | Security settings |