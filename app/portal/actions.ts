'use server'

import { revalidatePath } from 'next/cache'
import { createShortageReport, resolveShortageReport, resolveAllShortageReports } from '@/lib/db/queries'

export async function reportShortageAction(data: {
  item_name: string
  reported_by?: string | null
  notes?: string | null
}) {
  try {
    await createShortageReport(data)
    revalidatePath('/portal')
    revalidatePath('/shopping-list')
    return { success: true }
  } catch (error) {
    console.error('Failed to report shortage:', error)
    return { success: false, error: 'Failed to report shortage' }
  }
}

export async function resolveShortageAction(id: string) {
  try {
    await resolveShortageReport(id)
    revalidatePath('/portal')
    revalidatePath('/shopping-list')
    return { success: true }
  } catch (error) {
    console.error('Failed to resolve shortage:', error)
    return { success: false, error: 'Failed to resolve shortage' }
  }
}

export async function resolveAllShortagesAction() {
  try {
    await resolveAllShortageReports()
    revalidatePath('/portal')
    revalidatePath('/shopping-list')
    return { success: true }
  } catch (error) {
    console.error('Failed to resolve all shortages:', error)
    return { success: false, error: 'Failed to resolve all shortages' }
  }
}
