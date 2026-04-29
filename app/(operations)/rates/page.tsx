import { getRateRules } from '@/lib/db/queries'
import { RatesPageClient } from './rates-page-client'

export default async function RatesPage() {
  const rates = await getRateRules()

  return <RatesPageClient initialRates={rates} />
}
