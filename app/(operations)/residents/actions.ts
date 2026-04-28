'use server'

import { deleteResident } from '@/lib/db/queries'
import { revalidatePath } from 'next/cache'

export async function deleteResidentAction(id: string) {
  await deleteResident(id)
  revalidatePath('/residents')
  revalidatePath('/dashboard')
}
