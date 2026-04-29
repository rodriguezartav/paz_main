import { getRateRules, getResidentPriceModifiers } from '@/lib/db/queries'
import { RatesPageClient } from './rates-page-client'

export default async function RatesPage() {
  const [rates, modifiers] = await Promise.all([
    getRateRules(),
    getResidentPriceModifiers()
  ])

  return <RatesPageClient initialRates={rates} initialModifiers={modifiers} />
}
