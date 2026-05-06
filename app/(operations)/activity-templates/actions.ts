'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ActivityTemplate, ActivityType } from '@/lib/types'

export async function getActivityTemplates(): Promise<ActivityTemplate[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('activity_templates')
    .select('*')
    .order('title')
  
  if (error) throw error
  return data || []
}

export async function getActiveActivityTemplates(): Promise<ActivityTemplate[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('activity_templates')
    .select('*')
    .eq('is_active', true)
    .order('title')
  
  if (error) throw error
  return data || []
}

export async function createActivityTemplateAction(data: {
  title: string
  activity_type: ActivityType
  default_start_time?: string | null
  default_end_time?: string | null
  default_location?: string | null
  default_facilitator_name?: string | null
  default_capacity?: number | null
  description?: string | null
  guest_description?: string | null
  what_to_bring?: string | null
  safety_note?: string | null
  image_url?: string | null
  is_public?: boolean
  is_active?: boolean
}) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('activity_templates')
    .insert(data)
  
  if (error) throw error
  
  revalidatePath('/activity-templates')
  revalidatePath('/activities')
}

export async function updateActivityTemplateAction(id: string, data: {
  title?: string
  activity_type?: ActivityType
  default_start_time?: string | null
  default_end_time?: string | null
  default_location?: string | null
  default_facilitator_name?: string | null
  default_capacity?: number | null
  description?: string | null
  guest_description?: string | null
  what_to_bring?: string | null
  safety_note?: string | null
  image_url?: string | null
  is_public?: boolean
  is_active?: boolean
}) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('activity_templates')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
  
  if (error) throw error
  
  revalidatePath('/activity-templates')
  revalidatePath('/activities')
}

export async function deleteActivityTemplateAction(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('activity_templates')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  
  revalidatePath('/activity-templates')
  revalidatePath('/activities')
}
