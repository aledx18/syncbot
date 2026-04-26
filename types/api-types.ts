/**
 * Tipos para el cliente RPC (Hono client-side)
 * Coinciden con los endpoints del backend /api/admin/bots/*
 */

import type { Bot } from './typesPrisma'

// ============================================================
// API Response Types
// ============================================================

export interface BotsResponse {
  bots: (Bot & { organization?: { name: string } })[]
}

// ============================================================
// API Request Types (form data / json)
// ============================================================

export type GetBotsRequest = Record<string, never> // no query params

export type GetBotsResponse = BotsResponse
