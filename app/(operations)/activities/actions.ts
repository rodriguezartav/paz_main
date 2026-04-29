'use server'

import { revalidatePath } from 'next/cache'
import { 
  createScheduledActivity, 
  updateScheduledActivity, 
  deleteScheduledActivity 
} from '@/lib/db/queries'
import type { ActivityType, ActivityStatus } from '@/lib/types'

export async function createActivityAction(data: {
  title: string
  activity_type: ActivityType
  date: string
  start_time: string | null
  end_time: string | null
  location: string | null
  facilitator_name: string | null
  capacity: number | null
  status: ActivityStatus
  notes: string | null
  is_public: boolean
  guest_description: string | null
  what_to_bring: string | null
  safety_note: string | null
  signup_enabled: boolean
}) {
  await createScheduledActivity({
    ...data,
    facilitator_user_id: null,
  })
  revalidatePath('/activities')
  revalidatePath('/(operations)/activities')
}

export async function updateActivityAction(id: string, data: {
  title?: string
  activity_type?: ActivityType
  date?: string
  start_time?: string | null
  end_time?: string | null
  location?: string | null
  facilitator_name?: string | null
  capacity?: number | null
  status?: ActivityStatus
  notes?: string | null
  is_public?: boolean
  guest_description?: string | null
  what_to_bring?: string | null
  safety_note?: string | null
  signup_enabled?: boolean
}) {
  await updateScheduledActivity(id, data)
  revalidatePath('/activities')
  revalidatePath('/(operations)/activities')
}

export async function deleteActivityAction(id: string) {
  await deleteScheduledActivity(id)
  revalidatePath('/activities')
  revalidatePath('/(operations)/activities')
}
