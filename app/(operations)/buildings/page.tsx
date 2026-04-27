import { getBuildings, getActiveResidents } from '@/lib/db/queries'
import { BuildingsPageClient } from './buildings-page-client'

export default async function BuildingsPage() {
  const [buildings, residents] = await Promise.all([
    getBuildings(),
    getActiveResidents()
  ])
  
  return <BuildingsPageClient initialBuildings={buildings} residents={residents} />
}
