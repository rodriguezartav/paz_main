'use server'

import { revalidatePath } from 'next/cache'
import {
  createRoom,
  updateRoom,
  deleteRoom,
  createBed,
  updateBed,
  deleteBed,
  assignResidentToBed,
  assignResidentToMultipleBeds,
  unassignBed,
  getRoomById,
} from '@/lib/db/queries'
import type { Room, Bed } from '@/lib/types'

export async function createRoomAction(
  room: Omit<Room, 'id' | 'created_at' | 'updated_at' | 'beds' | 'building'>
) {
  const newRoom = await createRoom(room)
  revalidatePath('/rooms')
  return newRoom
}

export async function updateRoomAction(
  id: string,
  room: Partial<Omit<Room, 'id' | 'created_at' | 'updated_at' | 'beds' | 'building'>>
) {
  const updatedRoom = await updateRoom(id, room)
  revalidatePath('/rooms')
  return updatedRoom
}

export async function deleteRoomAction(id: string) {
  await deleteRoom(id)
  revalidatePath('/rooms')
}

export async function createBedAction(
  bed: Omit<Bed, 'id' | 'created_at' | 'updated_at' | 'room' | 'current_assignment'>
) {
  const newBed = await createBed(bed)
  revalidatePath('/rooms')
  return newBed
}

export async function updateBedAction(
  id: string,
  bed: Partial<Omit<Bed, 'id' | 'created_at' | 'updated_at' | 'room' | 'current_assignment'>>
) {
  const updatedBed = await updateBed(id, bed)
  revalidatePath('/rooms')
  return updatedBed
}

export async function deleteBedAction(id: string) {
  await deleteBed(id)
  revalidatePath('/rooms')
}

export async function assignBedAction(residentId: string, bedId: string) {
  const assignment = await assignResidentToBed(residentId, bedId)
  revalidatePath('/rooms')
  revalidatePath('/residents')
  return assignment
}

export async function unassignBedAction(bedId: string) {
  await unassignBed(bedId)
  revalidatePath('/rooms')
  revalidatePath('/residents')
}

export async function assignAllBedsInRoomAction(residentId: string, roomId: string) {
  const room = await getRoomById(roomId)
  if (!room || !room.beds) {
    throw new Error('Room not found or has no beds')
  }
  
  const bedIds = room.beds.map(bed => bed.id)
  const assignments = await assignResidentToMultipleBeds(residentId, bedIds)
  revalidatePath('/rooms')
  revalidatePath('/residents')
  return assignments
}
