import { getScheduledActivities } from '@/lib/db/queries'
import { ActivitiesPageClient } from './activities-page-client'

export default async function ActivitiesPage() {
  const activities = await getScheduledActivities()
  
  return <ActivitiesPageClient initialActivities={activities} />
}
