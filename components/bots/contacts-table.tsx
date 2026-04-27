'use client'

import * as React from 'react'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState
} from '@tanstack/react-table'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  RefreshCwIcon,
  SearchIcon
} from 'lucide-react'
import { toast } from 'sonner'

const contactSchema = z.object({
  id: z.string(),
  phone_number: z.string(),
  name: z.string().nullable(),
  created_at: z.string(),
  last_seen_at: z.string(),
  bot_id: z.string(),
  _count: z.object({
    appointments: z.number()
  })
})

type Contact = z.infer<typeof contactSchema>

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

const columns: ColumnDef<Contact>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => row.original.name ?? '—'
  },
  {
    accessorKey: 'phone_number',
    header: 'Phone'
  },
  {
    accessorKey: 'created_at',
    header: 'Created',
    cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString()
  },
  {
    accessorKey: 'last_seen_at',
    header: 'Last Seen',
    cell: ({ row }) => formatRelativeTime(row.original.last_seen_at)
  },
  {
    accessorKey: '_count.appointments',
    header: 'Appointments',
    cell: ({ row }) => (
      <Badge variant='outline' className='text-muted-foreground'>
        {row.original._count.appointments}
      </Badge>
    )
  }
]

interface ContactsTableProps {
  botId: string
}

async function fetchContacts(botId: string): Promise<{ contacts: Contact[]; total: number }> {
  const res = await fetch(
    `http://localhost:3000/api/admin/bots/${botId}/contacts`,
    {
      credentials: 'include'
    }
  )
  if (!res.ok) throw new Error('Failed')
  return res.json()
}

export function ContactsTable({ botId }: ContactsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState('')
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10
  })

  const {
    data,
    isFetching,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['contacts', botId],
    queryFn: () => fetchContacts(botId),
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    retry: 1
  })

  const contacts = data?.contacts ?? []

  const table = useReactTable({
    data: contacts,
    columns,
    state: {
      sorting,
      globalFilter,
      pagination
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

  // ✅ useEffect evita loop infinito de toasts
  React.useEffect(() => {
    if (isError) {
      toast.error(error instanceof Error ? error.message : 'Failed to load contacts')
    }
  }, [isError, error])

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center justify-between gap-4'>
        <div className='relative flex-1 max-w-sm'>
          <SearchIcon className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder='Search contacts...'
            value={globalFilter ?? ''}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className='pl-9'
          />
        </div>
        <Button
          variant='outline'
          size='sm'
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCwIcon
            className={`size-4 ${isFetching ? 'animate-spin' : ''}`}
          />
          Refresh
        </Button>
      </div>

      <div className='rounded-lg border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isFetching && contacts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center text-muted-foreground'
                >
                  Loading contacts...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center text-muted-foreground'
                >
                  No contacts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className='flex items-center justify-between'>
        <div className='text-sm text-muted-foreground'>
          {table.getFilteredRowModel().rows.length} total contacts
          {isFetching && <span className='ml-2'>— syncing...</span>}
        </div>
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2'>
            <Label className='text-sm font-medium'>Rows per page</Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger className='w-20'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent side='top'>
                <SelectGroup>
                  {[10, 20, 30, 50].map((size) => (
                    <SelectItem key={size} value={`${size}`}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className='text-sm font-medium'>
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </div>
          <div className='flex items-center gap-1'>
            <Button
              variant='outline'
              size='icon'
              className='size-8'
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeftIcon className='size-4' />
            </Button>
            <Button
              variant='outline'
              size='icon'
              className='size-8'
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeftIcon className='size-4' />
            </Button>
            <Button
              variant='outline'
              size='icon'
              className='size-8'
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRightIcon className='size-4' />
            </Button>
            <Button
              variant='outline'
              size='icon'
              className='size-8'
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRightIcon className='size-4' />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
