import { getRooms, getActiveResidents } from '@/lib/db/queries'
import { RoomsPageClient } from './rooms-page-client'

export default async function RoomsPage() {
  const [rooms, residents] = await Promise.all([
    getRooms(),
    getActiveResidents()
  ])

  return <RoomsPageClient initialRooms={rooms} residents={residents} />
}
