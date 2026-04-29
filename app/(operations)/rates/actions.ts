'use server'

import { createRateRule, updateRateRule, toggleRateRuleActive } from '@/lib/db/queries'
import type { RateApplicationType, RateRoomType } from '@/lib/types'
import { revalidatePath } from 'next/cache'

export async function createRateRuleAction(data: {
  name: string
  application_type: RateApplicationType
  room_type: RateRoomType
  base_nightly_rate: number
  currency: string
  is_active: boolean
  notes?: string | null
}) {
  await createRateRule({
    name: data.name,
    application_type: data.application_type,
    room_type: data.room_type,
    base_nightly_rate: data.base_nightly_rate,
    currency: data.currency,
    is_active: data.is_active,
    notes: data.notes || null
  })
  revalidatePath('/rates')
}

export async function updateRateRuleAction(
  id: string,
  data: {
    name?: string
    application_type?: RateApplicationType
    room_type?: RateRoomType
    base_nightly_rate?: number
    currency?: string
    is_active?: boolean
    notes?: string | null
  }
) {
  await updateRateRule(id, data)
  revalidatePath('/rates')
}

export async function toggleRateRuleActiveAction(id: string, isActive: boolean) {
  await toggleRateRuleActive(id, isActive)
  revalidatePath('/rates')
}
