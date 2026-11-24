import { apiError, apiJson, apiOptions } from '@/lib/api/v1'
import { getActivePricing } from '@/lib/api/pricing'

export const dynamic = 'force-dynamic'

export function OPTIONS() {
  return apiOptions()
}

export async function GET() {
  try {
    const { rates, modifiers } = await getActivePricing()

    return apiJson({
      pricing_rules: {
        application_type: [
          'resident_type "volunteer" always uses volunteer rates.',
          'Otherwise, stays under 8 nights use "retreat" rates and stays of 8+ nights use "resident" rates.',
        ],
        room_matching:
          'A rate with the exact room_type is used first; otherwise the rate with room_type "any" for that application_type.',
        modifiers:
          'Length-of-stay modifiers only apply to "resident" rates, when min_nights <= nights <= max_nights (max_nights null = no limit). Negative adjustment_value is a discount.',
        formula: 'final_nightly_rate = base_nightly_rate + adjustment; total_cost = final_nightly_rate * nights',
        nights: 'nights = departure_date - arrival_date (in days).',
      },
      rates: rates.map((r) => ({
        id: r.id,
        name: r.name,
        application_type: r.application_type,
        room_type: r.room_type,
        base_nightly_rate: Number(r.base_nightly_rate),
        currency: r.currency,
        notes: r.notes,
      })),
      modifiers: modifiers.map((m) => ({
        id: m.id,
        name: m.name,
        min_nights: m.min_nights,
        max_nights: m.max_nights,
        adjustment_type: m.adjustment_type,
        adjustment_value: Number(m.adjustment_value),
        notes: m.notes,
      })),
    })
  } catch (error) {
    console.error('GET /api/v1/rates failed:', error)
    return apiError('INTERNAL_ERROR', 'Failed to load rates.', 500)
  }
}
