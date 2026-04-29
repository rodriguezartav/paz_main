import { getResidentBills, getResidents } from '@/lib/db/queries'
import { BillsPageClient } from './bills-page-client'

export const metadata = {
  title: 'Bills - Paz Operations',
  description: 'Manage resident bills',
}

export default async function BillsPage() {
  const [bills, residents] = await Promise.all([
    getResidentBills(),
    getResidents()
  ])
  
  return <BillsPageClient initialBills={bills} residents={residents} />
}
