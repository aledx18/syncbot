import { Geist_Mono, Outfit } from 'next/font/google'

import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { cn } from '@/lib/utils'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProviders } from '@/components/providers/providers'
import Providers from '@/lib/query-providers'

const outfit = Outfit({ subsets: ['latin'], variable: '--font-sans' })

const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono'
})

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang='en'
      suppressHydrationWarning
      className={cn(
        'antialiased',
        fontMono.variable,
        'font-sans',
        outfit.variable
      )}
    >
      <body>
        <ThemeProvider>
          <TooltipProvider>
            <Providers>
              <AuthProviders>{children}</AuthProviders>
            </Providers>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
