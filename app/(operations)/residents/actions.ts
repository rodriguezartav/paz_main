'use server'

import { deleteResident, updateResident, assignResidentToBed } from '@/lib/db/queries'
import { revalidatePath } from 'next/cache'

export async function deleteResidentAction(id: string) {
  await deleteResident(id)
  revalidatePath('/residents')
  revalidatePath('/dashboard')
}

export async function markResidentCheckedInAction(id: string) {
  await updateResident(id, {
    check_in_completed: true,
    status: 'checked_in'
  })
  revalidatePath('/residents')
  revalidatePath(`/residents/${id}`)
  revalidatePath('/dashboard')
}

export async function markResidentCheckedOutAction(id: string) {
  await updateResident(id, {
    status: 'checked_out'
  })
  revalidatePath('/residents')
  revalidatePath(`/residents/${id}`)
  revalidatePath('/dashboard')
}

export async function updateResidentChecklistAction(
  id: string, 
  field: 'release_accepted' | 'health_insurance_confirmed' | 'media_release_accepted' | 'orientation_completed',
  value: boolean
) {
  await updateResident(id, { [field]: value })
  revalidatePath(`/residents/${id}`)
}

export async function assignBedToResidentAction(residentId: string, bedId: string) {
  await assignResidentToBed(residentId, bedId)
  revalidatePath('/residents')
  revalidatePath(`/residents/${residentId}`)
  revalidatePath('/rooms')
  revalidatePath('/dashboard')
}
