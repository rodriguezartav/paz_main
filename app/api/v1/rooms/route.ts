import type { NextRequest } from 'next/server'
import { apiError, apiJson, apiOptions, validateStayDates } from '@/lib/api/v1'
import { getRoomsWithAvailability } from '@/lib/api/availability'

export const dynamic = 'force-dynamic'

export function OPTIONS() {
  return apiOptions()
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const arrival = params.get('arrival_date')
  const departure = params.get('departure_date')
  const roomType = params.get('room_type')
  const onlyAvailable = params.get('available') === 'true'

  const hasRange = Boolean(arrival || departure)
  if (hasRange) {
    const dateError = validateStayDates(arrival, departure)
    if (dateError) return apiError('INVALID_INPUT', dateError, 400)
  }

  try {
    let rooms = await getRoomsWithAvailability(hasRange ? { arrival: arrival!, departure: departure! } : undefined)
    if (roomType) rooms = rooms.filter((r) => r.room_type === roomType)
    if (hasRange && onlyAvailable) rooms = rooms.filter((r) => r.available_beds > 0)

    return apiJson({
      date_range: hasRange ? { arrival_date: arrival, departure_date: departure } : null,
      availability_checked: hasRange,
      count: rooms.length,
      rooms,
    })
  } catch (error) {
    console.error('GET /api/v1/rooms failed:', error)
    return apiError('INTERNAL_ERROR', 'Failed to load rooms.', 500)
  }
}
