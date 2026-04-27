'use server'

import { revalidatePath } from 'next/cache'
import {
  createWeeklyMenuTemplate,
  updateWeeklyMenuTemplate,
  deleteWeeklyMenuTemplate,
  duplicateWeeklyMenuTemplate,
  updateTemplateMeal,
  addRecipeToTemplateMeal,
  updateTemplateMealRecipe,
  removeRecipeFromTemplateMeal,
  reorderTemplateMealRecipes
} from '@/lib/db/queries'

export async function createTemplateAction(name: string, description: string | null) {
  try {
    const template = await createWeeklyMenuTemplate({ name, description })
    revalidatePath('/meal-planner')
    return { success: true, template }
  } catch (error) {
    console.error('Failed to create template:', error)
    return { success: false, error: 'Failed to create template' }
  }
}

export async function updateTemplateAction(id: string, updates: { name?: string; description?: string | null; active?: boolean }) {
  try {
    const template = await updateWeeklyMenuTemplate(id, updates)
    revalidatePath('/meal-planner')
    revalidatePath(`/meal-planner/${id}`)
    return { success: true, template }
  } catch (error) {
    console.error('Failed to update template:', error)
    return { success: false, error: 'Failed to update template' }
  }
}

export async function deleteTemplateAction(id: string) {
  try {
    await deleteWeeklyMenuTemplate(id)
    revalidatePath('/meal-planner')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete template:', error)
    return { success: false, error: 'Failed to delete template' }
  }
}

export async function duplicateTemplateAction(id: string, newName: string) {
  try {
    const template = await duplicateWeeklyMenuTemplate(id, newName)
    revalidatePath('/meal-planner')
    return { success: true, template }
  } catch (error) {
    console.error('Failed to duplicate template:', error)
    return { success: false, error: 'Failed to duplicate template' }
  }
}

export async function updateMealAction(id: string, updates: { prep_day_offset?: number; notes?: string | null }) {
  try {
    const meal = await updateTemplateMeal(id, updates)
    revalidatePath('/meal-planner')
    return { success: true, meal }
  } catch (error) {
    console.error('Failed to update meal:', error)
    return { success: false, error: 'Failed to update meal' }
  }
}

export async function addRecipeToMealAction(
  templateMealId: string,
  recipeId: string,
  recipeRole: string,
  servingTarget: string,
  notes?: string
) {
  try {
    const recipe = await addRecipeToTemplateMeal(templateMealId, recipeId, recipeRole, servingTarget, notes)
    revalidatePath('/meal-planner')
    return { success: true, recipe }
  } catch (error) {
    console.error('Failed to add recipe:', error)
    return { success: false, error: 'Failed to add recipe' }
  }
}

export async function updateMealRecipeAction(
  id: string,
  updates: { recipe_role?: string; serving_target?: string; order_index?: number; notes?: string | null }
) {
  try {
    const recipe = await updateTemplateMealRecipe(id, updates)
    revalidatePath('/meal-planner')
    return { success: true, recipe }
  } catch (error) {
    console.error('Failed to update recipe:', error)
    return { success: false, error: 'Failed to update recipe' }
  }
}

export async function removeRecipeFromMealAction(id: string) {
  try {
    await removeRecipeFromTemplateMeal(id)
    revalidatePath('/meal-planner')
    return { success: true }
  } catch (error) {
    console.error('Failed to remove recipe:', error)
    return { success: false, error: 'Failed to remove recipe' }
  }
}

export async function reorderMealRecipesAction(templateMealId: string, recipeIds: string[]) {
  try {
    await reorderTemplateMealRecipes(templateMealId, recipeIds)
    revalidatePath('/meal-planner')
    return { success: true }
  } catch (error) {
    console.error('Failed to reorder recipes:', error)
    return { success: false, error: 'Failed to reorder recipes' }
  }
}
