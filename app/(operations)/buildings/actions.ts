'use server'

import { revalidatePath } from 'next/cache'
import { 
  createBuilding, 
  updateBuilding, 
  deleteBuilding,
  createRoom,
  updateRoom,
  deleteRoom,
  createBed,
  deleteBed
} from '@/lib/db/queries'

// Building actions
export async function createBuildingAction(data: { name: string; description: string }) {
  await createBuilding({
    name: data.name,
    description: data.description || null
  })
  revalidatePath('/buildings')
  revalidatePath('/rooms')
}

export async function updateBuildingAction(id: string, data: { name: string; description: string }) {
  await updateBuilding(id, {
    name: data.name,
    description: data.description || null
  })
  revalidatePath('/buildings')
  revalidatePath('/rooms')
}

export async function deleteBuildingAction(id: string) {
  await deleteBuilding(id)
  revalidatePath('/buildings')
  revalidatePath('/rooms')
}

// Room actions
export async function createRoomAction(data: { name: string; description: string; is_private: boolean; building_id: string }) {
  await createRoom({
    name: data.name,
    description: data.description || null,
    is_private: data.is_private,
    building_id: data.building_id || null
  })
  revalidatePath('/buildings')
  revalidatePath('/rooms')
}

export async function updateRoomAction(id: string, data: { name: string; description: string; is_private: boolean; building_id: string }) {
  await updateRoom(id, {
    name: data.name,
    description: data.description || null,
    is_private: data.is_private,
    building_id: data.building_id || null
  })
  revalidatePath('/buildings')
  revalidatePath('/rooms')
}

export async function deleteRoomAction(id: string) {
  await deleteRoom(id)
  revalidatePath('/buildings')
  revalidatePath('/rooms')
}

// Bed actions
export async function createBedAction(data: { name: string; room_id: string }) {
  await createBed({
    name: data.name,
    room_id: data.room_id
  })
  revalidatePath('/buildings')
  revalidatePath('/rooms')
}

export async function deleteBedAction(id: string) {
  await deleteBed(id)
  revalidatePath('/buildings')
  revalidatePath('/rooms')
}
