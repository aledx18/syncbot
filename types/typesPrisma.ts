/**
 * Tipos de Prisma para uso del frontend
 * Generado automáticamente desde prisma/schema.prisma
 * NO EDITAR — regenerar con: bun run scripts/gen-frontend-types.ts
 */

// ============================================================
// Enums
// ============================================================

export const AppointmentStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  RESCHEDULED: 'RESCHEDULED'
} as const

export type AppointmentStatus =
  (typeof AppointmentStatus)[keyof typeof AppointmentStatus]

// ============================================================
// Models (solo campos escalares, sin relaciones)
// ============================================================

export interface Organization {
  name: string
  kapso_api_key: string
  updated_at: Date
  user_id?: string
}

export interface Bot {
  id: string
  name: string
  webhook_secret: string
  phone_number_id: string
  is_active: boolean
  created_at?: Date
  updated_at: Date
  organization_id: string
}

export interface Contact {
  phone_number: string
  name?: string
  last_seen_at: Date
  bot_id: string
}

export interface Conversation {
  flow?: string
  step?: string
}

export interface BotText {
  key: string
  value: string
  triggers: string[]
  handler?: string
  updated_at: Date
  bot_id: string
}

export interface BotList {
  list_key: string
  section_title: string
  header?: string
  body: string
  button_label: string
  footer?: string
  bot_id: string
}

export interface BotListRow {
  id_key: string
  title: string
  description?: string
  order: number
  is_active: boolean
  flow?: string
  handler?: string
  list_id: string
}

export interface Service {
  name: string
  description?: string
  duration_minutes: number
  is_active: boolean
  bot_id: string
}

export interface Availability {
  total_slots: number
  booked_slots: number
  is_blocked: boolean
  service_id: string
  bot_id: string
}

export interface Appointment {
  notes?: string
  cancelled_reason?: string
  slot_iso?: string
  updated_at: Date
  contact_id: string
  availability_id: string
  service_id: string
  bot_id: string
}

export interface User {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image?: string
  updatedAt: Date
}

export interface Session {
  id: string
  expiresAt: Date
  token: string
  updatedAt: Date
  ipAddress?: string
  userAgent?: string
  userId: string
}

export interface Account {
  id: string
  accountId: string
  providerId: string
  userId: string
  accessToken?: string
  refreshToken?: string
  idToken?: string
  accessTokenExpiresAt?: Date
  refreshTokenExpiresAt?: Date
  scope?: string
  password?: string
  updatedAt: Date
}

export interface Verification {
  id: string
  identifier: string
  value: string
  expiresAt: Date
  updatedAt: Date
}
