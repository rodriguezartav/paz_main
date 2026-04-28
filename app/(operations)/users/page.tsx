import { getUsers } from '@/lib/auth/utils'
import { UsersPageClient } from './users-page-client'

export const metadata = {
  title: 'Users - Paz Operations',
  description: 'Manage user accounts',
}

export default async function UsersPage() {
  const users = await getUsers()
  
  return <UsersPageClient users={users} />
}
