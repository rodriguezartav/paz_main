import { createClient } from '@/lib/supabase/server'
import { calculateRate, isRateCalculationError } from '@/lib/utils/rate-calculator'
import type { RateRoomType, RateRule, ResidentPriceModifier, ResidentType } from '@/lib/types'

export async function getActivePricing(): Promise<{ rates: RateRule[]; modifiers: ResidentPriceModifier[] }> {
  const supabase = await createClient()
  const [ratesRes, modifiersRes] = await Promise.all([
    supabase.from('rate_rules').select('*').eq('is_active', true).order('application_type'),
    supabase.from('resident_price_modifiers').select('*').eq('is_active', true).order('min_nights'),
  ])
  if (ratesRes.error) throw ratesRes.error
  if (modifiersRes.error) throw modifiersRes.error
  return { rates: ratesRes.data || [], modifiers: modifiersRes.data || [] }
}

export interface ApiQuote {
  nights: number
  resident_type: ResidentType
  application_type: string
  room_type: string
  rate_name: string
  currency: string
  base_nightly_rate: number
  modifier: { name: string; adjustment_type: string; adjustment_value: number } | null
  adjustment_per_night: number
  final_nightly_rate: number
  total_cost: number
}

export type QuoteOutcome = { ok: true; quote: ApiQuote } | { ok: false; code: 'NO_RATE_FOUND' | 'INVALID_INPUT'; message: string }

export async function buildQuote(input: { nights: number; roomType: string; residentType: ResidentType }): Promise<QuoteOutcome> {
  const { rates, modifiers } = await getActivePricing()
  const result = calculateRate(
    { nights: input.nights, roomType: input.roomType as RateRoomType, residentType: input.residentType },
    rates,
    modifiers,
  )

  if (isRateCalculationError(result)) {
    return { ok: false, code: result.code, message: result.message }
  }

  const round = (n: number) => Math.round(n * 100) / 100

  return {
    ok: true,
    quote: {
      nights: result.nights,
      resident_type: input.residentType,
      application_type: result.applicationType,
      room_type: input.roomType,
      rate_name: result.rateName,
      currency: result.rateRule?.currency || 'USD',
      base_nightly_rate: round(result.baseRate),
      modifier: result.modifier
        ? {
            name: result.modifier.name,
            adjustment_type: result.modifier.adjustment_type,
            adjustment_value: result.modifier.adjustment_value,
          }
        : null,
      adjustment_per_night: round(result.breakdown.adjustmentAmount),
      final_nightly_rate: round(result.finalRate),
      total_cost: round(result.totalCost),
    },
  }
}
