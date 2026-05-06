import { getScheduledActivities } from '@/lib/db/queries'
import { getActiveActivityTemplates } from '../activity-templates/actions'
import { ActivitiesPageClient } from './activities-page-client'

export const dynamic = 'force-dynamic'

export default async function ActivitiesPage() {
  const [activities, templates] = await Promise.all([
    getScheduledActivities(),
    getActiveActivityTemplates(),
  ])
  
  return <ActivitiesPageClient initialActivities={activities} templates={templates} />
}
