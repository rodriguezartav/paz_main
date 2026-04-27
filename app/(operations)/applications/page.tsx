import { getApplications } from '@/lib/db/queries'
import { ApplicationsListClient } from './applications-list-client'

export const metadata = {
  title: 'Resident Applications - Paz Operations',
  description: 'Review and manage resident applications',
}

export default async function ApplicationsPage() {
  const applications = await getApplications()
  
  return <ApplicationsListClient applications={applications} />
}
