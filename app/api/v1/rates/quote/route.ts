import type { NextRequest } from 'next/server'
import { apiError, apiJson, apiOptions, countNights, validateStayDates } from '@/lib/api/v1'
import { buildQuote } from '@/lib/api/pricing'
import { createClient } from '@/lib/supabase/server'
import type { ResidentType } from '@/lib/types'

export const dynamic = 'force-dynamic'

const RESIDENT_TYPES: ResidentType[] = ['resident', 'volunteer', 'retreat']

export function OPTIONS() {
  return apiOptions()
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const arrival = params.get('arrival_date')
  const departure = params.get('departure_date')
  const residentType = (params.get('resident_type') || 'resident') as ResidentType
  const roomId = params.get('room_id')
  let roomType = params.get('room_type')

  const dateError = validateStayDates(arrival, departure)
  if (dateError) return apiError('INVALID_INPUT', dateError, 400)

  if (!RESIDENT_TYPES.includes(residentType)) {
    return apiError('INVALID_INPUT', `resident_type must be one of: ${RESIDENT_TYPES.join(', ')}.`, 400)
  }

  try {
    if (roomId) {
      const supabase = await createClient()
      const { data: room } = await supabase.from('rooms').select('room_type').eq('id', roomId).maybeSingle()
      if (!room) return apiError('NOT_FOUND', 'Room not found.', 404)
      roomType = room.room_type
    }

    if (!roomType) {
      return apiError('INVALID_INPUT', 'Provide room_type or room_id.', 400)
    }

    const outcome = await buildQuote({
      nights: countNights(arrival!, departure!),
      roomType,
      residentType,
    })

    if (!outcome.ok) {
      return apiError(outcome.code, outcome.message, outcome.code === 'NO_RATE_FOUND' ? 422 : 400)
    }

    return apiJson({ arrival_date: arrival, departure_date: departure, quote: outcome.quote })
  } catch (error) {
    console.error('GET /api/v1/rates/quote failed:', error)
    return apiError('INTERNAL_ERROR', 'Failed to calculate quote.', 500)
  }
}
