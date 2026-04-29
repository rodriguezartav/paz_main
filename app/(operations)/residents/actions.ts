'use server'

import { deleteResident, updateResident, assignResidentToBed, createResidentBill } from '@/lib/db/queries'
import { revalidatePath } from 'next/cache'

export async function deleteResidentAction(id: string) {
  await deleteResident(id)
  revalidatePath('/residents')
  revalidatePath('/dashboard')
}

export async function markResidentCheckedInAction(id: string) {
  await updateResident(id, {
    check_in_completed: true,
    status: 'checked_in'
  })
  revalidatePath('/residents')
  revalidatePath(`/residents/${id}`)
  revalidatePath('/dashboard')
}

export async function markResidentCheckedOutAction(id: string) {
  await updateResident(id, {
    status: 'checked_out'
  })
  revalidatePath('/residents')
  revalidatePath(`/residents/${id}`)
  revalidatePath('/dashboard')
}

export async function updateResidentChecklistAction(
  id: string, 
  field: 'release_accepted' | 'health_insurance_confirmed' | 'media_release_accepted' | 'orientation_completed',
  value: boolean
) {
  await updateResident(id, { [field]: value })
  revalidatePath(`/residents/${id}`)
}

export async function assignBedToResidentAction(residentId: string, bedId: string) {
  await assignResidentToBed(residentId, bedId)
  revalidatePath('/residents')
  revalidatePath(`/residents/${residentId}`)
  revalidatePath('/rooms')
  revalidatePath('/dashboard')
}

export async function updateResidentStayAction(
  id: string,
  data: {
    arrival_date?: string
    departure_date?: string
    resident_type?: 'volunteer' | 'resident' | 'retreat'
    resident_since?: string | null
    nightly_rate?: number | null
    notes?: string | null
  }
) {
  await updateResident(id, data)
  revalidatePath('/residents')
  revalidatePath(`/residents/${id}`)
  revalidatePath('/dashboard')
}

export async function createStayBillAction(
  residentId: string,
  arrivalDate: string,
  departureDate: string,
  nightlyRate: number
) {
  // Calculate nights
  const arrival = new Date(arrivalDate)
  const departure = new Date(departureDate)
  const nights = Math.ceil((departure.getTime() - arrival.getTime()) / (1000 * 60 * 60 * 24))
  
  if (nights <= 0) {
    throw new Error('Invalid date range')
  }
  
  const amount = nights * nightlyRate
  const tax = 0 // No tax by default
  const total = amount + tax
  
  const bill = await createResidentBill({
    resident_id: residentId,
    description: `Stay: ${nights} nights @ $${nightlyRate}/night (${arrivalDate} to ${departureDate})`,
    amount,
    tax,
    total,
    amount_paid: 0,
    amount_due: total,
    status: 'unpaid',
    payment_details: null,
    due_date: arrivalDate, // Due on arrival
  })
  
  revalidatePath('/residents')
  revalidatePath(`/residents/${residentId}`)
  revalidatePath('/bills')
  
  return bill
}
