import type { NextRequest } from 'next/server'
import { z } from 'zod'
import {
  apiError,
  apiJson,
  apiOptions,
  countNights,
  isValidDate,
  requireApiKey,
  todayInCostaRica,
  validateStayDates,
} from '@/lib/api/v1'
import { getRoomsWithAvailability, type ApiRoom } from '@/lib/api/availability'
import { buildQuote } from '@/lib/api/pricing'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const RESERVATION_FIELDS =
  'id, name, email, whatsapp, nationality, gender, age, diet, resident_type, status, arrival_date, departure_date, nightly_rate, room, bed, notes, created_at'

const STATUSES = ['upcoming', 'checked_in', 'staying', 'checking_out_today', 'checked_out', 'cancelled']

const createReservationSchema = z
  .object({
    name: z.string().trim().min(1).max(200),
    email: z.string().trim().email().max(320),
    gender: z.enum(['female', 'male']),
    diet: z.enum(['eats_all', 'vegetarian', 'vegan']).default('eats_all'),
    resident_type: z.enum(['resident', 'volunteer', 'retreat']).default('resident'),
    arrival_date: z.string(),
    departure_date: z.string(),
    bed_id: z.string().uuid().optional(),
    room_id: z.string().uuid().optional(),
    room_type: z.enum(['private', 'double', 'triple', 'quad']).optional(),
    whatsapp: z.string().trim().max(50).optional().nullable(),
    nationality: z.string().trim().max(100).optional().nullable(),
    age: z.number().int().min(0).max(120).optional().nullable(),
    notes: z.string().trim().max(2000).optional().nullable(),
    source: z.string().trim().max(100).optional(),
  })
  .refine((d) => d.bed_id || d.room_id || d.room_type, {
    message: 'Provide one of bed_id, room_id or room_type.',
    path: ['bed_id'],
  })

export function OPTIONS() {
  return apiOptions()
}

export async function GET(request: NextRequest) {
  const authError = requireApiKey(request)
  if (authError) return authError

  const params = request.nextUrl.searchParams
  const from = params.get('from')
  const to = params.get('to')
  const status = params.get('status')
  const email = params.get('email')

  if ((from && !isValidDate(from)) || (to && !isValidDate(to))) {
    return apiError('INVALID_INPUT', 'from and to must be YYYY-MM-DD.', 400)
  }
  if (status && !STATUSES.includes(status)) {
    return apiError('INVALID_INPUT', `status must be one of: ${STATUSES.join(', ')}.`, 400)
  }

  try {
    const supabase = await createClient()
    let query = supabase.from('residents').select(RESERVATION_FIELDS).order('arrival_date', { ascending: true }).limit(500)

    if (from) query = query.gte('departure_date', from)
    if (to) query = query.lte('arrival_date', to)
    if (status) query = query.eq('status', status)
    if (email) query = query.ilike('email', email)

    const { data, error } = await query
    if (error) throw error

    return apiJson({ count: data?.length || 0, reservations: data || [] })
  } catch (error) {
    console.error('GET /api/v1/reservations failed:', error)
    return apiError('INTERNAL_ERROR', 'Failed to load reservations.', 500)
  }
}

function pickBed(rooms: ApiRoom[], body: z.infer<typeof createReservationSchema>) {
  if (body.bed_id) {
    for (const room of rooms) {
      const bed = room.beds.find((b) => b.id === body.bed_id)
      if (bed) return { room, bed, found: true }
    }
    return { room: null, bed: null, found: false }
  }

  const candidates = body.room_id
    ? rooms.filter((r) => r.id === body.room_id)
    : rooms.filter((r) => r.room_type === body.room_type)

  if (body.room_id && candidates.length === 0) return { room: null, bed: null, found: false }

  for (const room of candidates) {
    const bed = room.beds.find((b) => b.available)
    if (bed) return { room, bed, found: true }
  }
  return { room: candidates[0] || null, bed: null, found: true }
}

export async function POST(request: NextRequest) {
  const authError = requireApiKey(request)
  if (authError) return authError

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return apiError('INVALID_INPUT', 'Request body must be valid JSON.', 400)
  }

  const parsed = createReservationSchema.safeParse(json)
  if (!parsed.success) {
    return apiError('INVALID_INPUT', 'Invalid reservation payload.', 400, parsed.error.flatten())
  }
  const body = parsed.data

  const dateError = validateStayDates(body.arrival_date, body.departure_date)
  if (dateError) return apiError('INVALID_INPUT', dateError, 400)
  if (body.arrival_date < todayInCostaRica()) {
    return apiError('INVALID_INPUT', 'arrival_date cannot be in the past.', 400)
  }

  try {
    const rooms = await getRoomsWithAvailability({ arrival: body.arrival_date, departure: body.departure_date })
    const { room, bed, found } = pickBed(rooms, body)

    if (!found || !room) return apiError('NOT_FOUND', 'The requested room or bed does not exist.', 404)
    if (!bed || !bed.available) {
      return apiError('NO_AVAILABILITY', 'No bed is available for the requested dates.', 409)
    }

    const nights = countNights(body.arrival_date, body.departure_date)
    const outcome = await buildQuote({ nights, roomType: room.room_type, residentType: body.resident_type })
    if (!outcome.ok) {
      return apiError(outcome.code, outcome.message, outcome.code === 'NO_RATE_FOUND' ? 422 : 400)
    }

    const supabase = await createClient()
    const sourceNote = `[Booked via API${body.source ? `: ${body.source}` : ''}]`

    const { data: resident, error: insertError } = await supabase
      .from('residents')
      .insert({
        name: body.name,
        email: body.email,
        whatsapp: body.whatsapp || null,
        nationality: body.nationality || null,
        gender: body.gender,
        age: body.age ?? null,
        diet: body.diet,
        resident_type: body.resident_type,
        arrival_date: body.arrival_date,
        departure_date: body.departure_date,
        nightly_rate: outcome.quote.final_nightly_rate,
        status: 'upcoming',
        room: room.name,
        bed: bed.name,
        notes: body.notes ? `${sourceNote} ${body.notes}` : sourceNote,
        check_in_completed: false,
        release_accepted: false,
        health_insurance_confirmed: false,
        media_release_accepted: false,
        orientation_completed: false,
      })
      .select(RESERVATION_FIELDS)
      .single()

    if (insertError || !resident) throw insertError

    const { error: bedError } = await supabase.from('resident_beds').insert({
      resident_id: resident.id,
      bed_id: bed.id,
      is_active: true,
      assigned_at: new Date().toISOString(),
    })

    if (bedError) {
      await supabase.from('residents').delete().eq('id', resident.id)
      throw bedError
    }

    return apiJson(
      {
        reservation: {
          ...resident,
          room: { id: room.id, name: room.name, room_type: room.room_type, building: room.building },
          bed: { id: bed.id, name: bed.name },
          nights,
        },
        quote: outcome.quote,
      },
      201,
    )
  } catch (error) {
    console.error('POST /api/v1/reservations failed:', error)
    return apiError('INTERNAL_ERROR', 'Failed to create reservation.', 500)
  }
}
