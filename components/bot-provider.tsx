'use client'

import * as React from 'react'
import type { Bot } from '@/types/typesPrisma'

interface BotContextValue {
  activeBot: Bot | null
  setActiveBot: (bot: Bot | null) => void
}

const BotContext = React.createContext<BotContextValue | null>(null)

export function BotProvider({ children }: { children: React.ReactNode }) {
  const [activeBot, setActiveBot] = React.useState<Bot | null>(null)

  return (
    <BotContext.Provider value={{ activeBot, setActiveBot }}>
      {children}
    </BotContext.Provider>
  )
}

export function useBotContext() {
  const ctx = React.use(BotContext)
  if (!ctx) throw new Error('useBotContext must be used within BotProvider')
  return ctx
}
