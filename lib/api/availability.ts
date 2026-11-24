import { createClient } from '@/lib/supabase/server'
import type { RoomType } from '@/lib/types'

const NON_BLOCKING_STATUSES = ['checked_out', 'cancelled']

export interface ApiBed {
  id: string
  name: string
  available: boolean
}

export interface ApiRoom {
  id: string
  name: string
  description: string | null
  room_type: RoomType
  is_private: boolean
  building: { id: string; name: string } | null
  total_beds: number
  available_beds: number
  beds: ApiBed[]
}

interface RawAssignment {
  bed_id: string
  is_active: boolean
  resident: {
    arrival_date: string
    departure_date: string
    status: string
  } | null
}

/**
 * Returns every room with its beds. When a date range is given, each bed is marked
 * available if no active (non-cancelled, non-checked-out) reservation overlaps
 * the half-open interval [arrival, departure).
 */
export async function getRoomsWithAvailability(range?: { arrival: string; departure: string }): Promise<ApiRoom[]> {
  const supabase = await createClient()

  const { data: rooms, error: roomsError } = await supabase
    .from('rooms')
    .select('id, name, description, room_type, is_private, building:buildings (id, name), beds (id, name)')
    .order('name', { ascending: true })

  if (roomsError) throw roomsError

  const occupiedBedIds = new Set<string>()

  if (range) {
    const { data: assignments, error: assignmentsError } = await supabase
      .from('resident_beds')
      .select('bed_id, is_active, resident:residents (arrival_date, departure_date, status)')
      .eq('is_active', true)

    if (assignmentsError) throw assignmentsError

    for (const a of (assignments || []) as unknown as RawAssignment[]) {
      const r = a.resident
      if (!r || NON_BLOCKING_STATUSES.includes(r.status)) continue
      if (r.arrival_date < range.departure && r.departure_date > range.arrival) {
        occupiedBedIds.add(a.bed_id)
      }
    }
  }

  return (rooms || []).map((room: any) => {
    const beds: ApiBed[] = (room.beds || [])
      .map((bed: { id: string; name: string }) => ({
        id: bed.id,
        name: bed.name,
        available: !occupiedBedIds.has(bed.id),
      }))
      .sort((a: ApiBed, b: ApiBed) => a.name.localeCompare(b.name))

    const building = Array.isArray(room.building) ? room.building[0] : room.building

    return {
      id: room.id,
      name: room.name,
      description: room.description,
      room_type: room.room_type,
      is_private: room.is_private,
      building: building ? { id: building.id, name: building.name } : null,
      total_beds: beds.length,
      available_beds: beds.filter((b) => b.available).length,
      beds,
    }
  })
}
