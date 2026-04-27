'use server'

import { updateRecipe } from '@/lib/db/queries'

export async function updateRecipeIngredientsAction(
  recipeId: string,
  ingredients: { ingredient_id: string; amount: number; measurement: string }[]
) {
  // We only update the ingredients, passing an empty object for recipe data
  return updateRecipe(recipeId, {}, ingredients)
}
