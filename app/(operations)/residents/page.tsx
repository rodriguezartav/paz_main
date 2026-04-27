import { getResidentsWithPayments } from '@/lib/db/queries'
import { ResidentsPageClient } from './residents-page-client'

export default async function ResidentsPage() {
  const residentsWithPayments = await getResidentsWithPayments()

  return <ResidentsPageClient residentsWithPayments={residentsWithPayments} />
}
