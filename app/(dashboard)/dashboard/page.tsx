import { DataTable } from '@/components/data-table'

import data from './data.json'

export default function DashboardPage() {
  return <DataTable data={data} />
}
