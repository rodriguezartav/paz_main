'use server'

import { createRecipe, updateRecipe, deleteRecipe } from '@/lib/db/queries'
import type { Recipe } from '@/lib/types'

export async function createRecipeAction(
  data: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'recipe_ingredients'>,
  ingredients: { ingredient_id: string; amount: number; measurement: string }[]
) {
  return createRecipe(data, ingredients)
}

export async function updateRecipeAction(
  id: string,
  data: Partial<Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'recipe_ingredients'>>,
  ingredients?: { ingredient_id: string; amount: number; measurement: string }[]
) {
  return updateRecipe(id, data, ingredients)
}

export async function deleteRecipeAction(id: string) {
  return deleteRecipe(id)
}
