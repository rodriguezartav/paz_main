import { getApplicationSections, getRateRules, getResidentPriceModifiers } from '@/lib/db/queries'
import { ApplicationFormClient } from './application-form-client'

export const metadata = {
  title: 'Apply to Paz Corcovado',
  description: 'Submit your application to stay at Paz Corcovado',
}

export default async function ApplyPage() {
  const [sections, rates, modifiers] = await Promise.all([
    getApplicationSections(true),
    getRateRules(),
    getResidentPriceModifiers()
  ])
  
  return <ApplicationFormClient sections={sections} rates={rates} modifiers={modifiers} />
}
