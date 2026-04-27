// lib/get-query-client.ts
import { QueryClient } from '@tanstack/react-query'
import { cache } from 'react'

export const getQueryClient = cache(() =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // Datos frescos por 1 min post-hydrate — evita refetch inmediato en background
        staleTime: 60_000
      }
    }
  })
)
