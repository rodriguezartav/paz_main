'use server'

import { createResidentBill, updateResidentBill, deleteResidentBill } from '@/lib/db/queries'
import type { BillStatus } from '@/lib/types'
import { revalidatePath } from 'next/cache'

export async function createBillAction(data: {
  resident_id: string
  description: string
  amount: number
  tax: number
  total: number
  amount_paid: number
  amount_due: number
  status: BillStatus
  payment_details?: string | null
  due_date?: string | null
}) {
  await createResidentBill({
    resident_id: data.resident_id,
    description: data.description,
    amount: data.amount,
    tax: data.tax,
    total: data.total,
    amount_paid: data.amount_paid,
    amount_due: data.amount_due,
    status: data.status,
    payment_details: data.payment_details || null,
    due_date: data.due_date || null
  })
  revalidatePath('/bills')
  revalidatePath('/residents')
}

export async function updateBillAction(
  id: string,
  data: {
    description?: string
    amount?: number
    tax?: number
    total?: number
    amount_paid?: number
    amount_due?: number
    status?: BillStatus
    payment_details?: string | null
    due_date?: string | null
  }
) {
  await updateResidentBill(id, data)
  revalidatePath('/bills')
  revalidatePath('/residents')
}

export async function deleteBillAction(id: string) {
  await deleteResidentBill(id)
  revalidatePath('/bills')
  revalidatePath('/residents')
}
