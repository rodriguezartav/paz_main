import { getActivityTemplates } from './actions'
import { ActivityTemplatesClient } from './activity-templates-client'

export const dynamic = 'force-dynamic'

export default async function ActivityTemplatesPage() {
  const templates = await getActivityTemplates()

  return <ActivityTemplatesClient initialTemplates={templates} />
}
