import {
  LayoutDashboardIcon,
  ChartBarIcon,
  FolderIcon,
  Table2Icon,
  UsersIcon,
  Settings2Icon,
  CircleHelpIcon,
  SearchIcon,
  DatabaseIcon,
  FileChartColumnIcon,
  FileIcon,
  CommandIcon,
  BotIcon
} from 'lucide-react'

export const navMain = [
  {
    title: 'Bots',
    href: '/dashboard/bots',
    icon: BotIcon
  },
  {
    title: 'Contacts',
    href: '/dashboard/contacts',
    icon: Table2Icon
  },
  {
    title: 'Analytics',
    href: '/dashboard/analytics',
    icon: ChartBarIcon
  },
  {
    title: 'Projects',
    href: '/dashboard/projects',
    icon: FolderIcon
  },
  {
    title: 'Team',
    href: '/dashboard/team',
    icon: UsersIcon
  }
] as const

export const navSecondary = [
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings2Icon
  },
  {
    title: 'Get Help',
    href: '/help',
    icon: CircleHelpIcon
  },
  {
    title: 'Search',
    href: '/search',
    icon: SearchIcon
  }
] as const

export const documents = [
  { name: 'Data Library', url: '/dashboard/data-library', icon: DatabaseIcon },
  { name: 'Reports', url: '/dashboard/reports', icon: FileChartColumnIcon },
  { name: 'Word Assistant', url: '/dashboard/word-assistant', icon: FileIcon }
] as const

export const sidebarHeader = {
  label: 'Acme Inc.',
  href: '/dashboard',
  icon: CommandIcon
} as const
