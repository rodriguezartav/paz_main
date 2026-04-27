import { getApplicationSections } from '@/lib/db/queries'
import { ApplicationFormClient } from './application-form-client'

export const metadata = {
  title: 'Apply to Paz Corcovado',
  description: 'Submit your application to stay at Paz Corcovado',
}

export default async function ApplyPage() {
  const sections = await getApplicationSections(true)
  
  return <ApplicationFormClient sections={sections} />
}
