'use server'

import { updateApplication, deleteApplication } from '@/lib/db/queries'
import { revalidatePath } from 'next/cache'
import type { ApplicationStatus } from '@/lib/types'

export async function updateApplicationStatus(id: string, status: ApplicationStatus) {
  const updates: { status: ApplicationStatus; reviewed_at?: string } = { status }
  
  if (status !== 'pending') {
    updates.reviewed_at = new Date().toISOString()
  }
  
  await updateApplication(id, updates)
  revalidatePath('/applications')
  revalidatePath(`/applications/${id}`)
}

export async function updateApplicationScore(id: string, score: number) {
  await updateApplication(id, { internal_score: score })
  revalidatePath('/applications')
  revalidatePath(`/applications/${id}`)
}

export async function updateApplicationNotes(id: string, notes: string) {
  await updateApplication(id, { reviewer_notes: notes })
  revalidatePath('/applications')
  revalidatePath(`/applications/${id}`)
}

export async function deleteApplicationAction(id: string) {
  await deleteApplication(id)
  revalidatePath('/applications')
}
