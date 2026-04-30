'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'

interface BreadcrumbItemData {
  label: string
  href?: string
}

const sectionLabels: Record<string, string> = {
  texts: 'Texts',
  contacts: 'Contacts',
  services: 'Services',
  lists: 'Lists',
  settings: 'Settings'
}

export function BreadcrumbNav() {
  const pathname = usePathname()

  const segments = pathname.split('/').filter(Boolean)
  const items = buildItems(segments)

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <BreadcrumbItem key={item.label}>
              {index > 0 && <BreadcrumbSeparator />}
              {isLast ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={item.href ?? '/'}>{item.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

function buildItems(segments: string[]): BreadcrumbItemData[] {
  const items: BreadcrumbItemData[] = [{ label: 'Dashboard', href: '/' }]

  if (!segments.includes('dashboard')) return items

  const dashIndex = segments.indexOf('dashboard')
  const botId = segments[dashIndex + 1]

  if (botId) {
    items.push({ label: 'Bot', href: `/dashboard/${botId}` })

    const section = segments[dashIndex + 2]
    if (section) {
      const label = sectionLabels[section] ?? section
      items.push({ label })
    }
  }

  return items
}