'use server'

import { createIngredient, updateIngredient, deleteIngredient } from '@/lib/db/queries'
import type { Ingredient } from '@/lib/types'

export async function createIngredientAction(
  data: Omit<Ingredient, 'id' | 'created_at' | 'updated_at'>
) {
  return createIngredient(data)
}

export async function updateIngredientAction(
  id: string, 
  data: Partial<Omit<Ingredient, 'id' | 'created_at' | 'updated_at'>>
) {
  return updateIngredient(id, data)
}

export async function deleteIngredientAction(id: string) {
  return deleteIngredient(id)
}
