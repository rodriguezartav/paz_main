import type { NextRequest } from 'next/server'
import { apiError, apiJson, apiOptions, requireApiKey } from '@/lib/api/v1'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function OPTIONS() {
  return apiOptions()
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireApiKey(request)
  if (authError) return authError

  const { id } = await params
  if (!UUID_RE.test(id)) return apiError('INVALID_INPUT', 'id must be a UUID.', 400)

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('residents')
      .select(
        'id, name, email, whatsapp, nationality, gender, age, diet, resident_type, status, arrival_date, departure_date, nightly_rate, room, bed, notes, created_at',
      )
      .eq('id', id)
      .maybeSingle()

    if (error) throw error
    if (!data) return apiError('NOT_FOUND', 'Reservation not found.', 404)

    return apiJson({ reservation: data })
  } catch (error) {
    console.error('GET /api/v1/reservations/[id] failed:', error)
    return apiError('INTERNAL_ERROR', 'Failed to load reservation.', 500)
  }
}
