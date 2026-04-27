'use server'

import { revalidatePath } from 'next/cache'
import { 
  createWeeklyMealPlan, 
  deleteWeeklyMealPlan, 
  getDietHeadcountsForWeek,
  refreshMealPlanHeadcounts,
  getWeeklyMealPlanById,
  updateMealPlanMealHeadcounts,
  addRecipeToMealPlanMeal,
  removeRecipeFromMealPlanMeal
} from '@/lib/db/queries'
import type { WeeklyMealPlan, WeeklyMealPlanMeal, WeeklyMealPlanRecipe } from '@/lib/types'

export async function createWeeklyMealPlanAction(
  weekStartDate: string,
  templateId: string | null
): Promise<{ success: boolean; plan?: WeeklyMealPlan; error?: string }> {
  try {
    // Get default headcounts from residents
    const headcounts = await getDietHeadcountsForWeek(weekStartDate)
    
    const plan = await createWeeklyMealPlan(weekStartDate, templateId, headcounts)
    
    revalidatePath('/weekly-calendar')
    return { success: true, plan }
  } catch (error) {
    console.error('Failed to create weekly meal plan:', error)
    return { success: false, error: 'Failed to create plan' }
  }
}

export async function deleteWeeklyMealPlanAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteWeeklyMealPlan(id)
    revalidatePath('/weekly-calendar')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete weekly meal plan:', error)
    return { success: false, error: 'Failed to delete plan' }
  }
}

export async function refreshHeadcountsAction(
  planId: string
): Promise<{ success: boolean; plan?: WeeklyMealPlan; error?: string }> {
  try {
    await refreshMealPlanHeadcounts(planId)
    const plan = await getWeeklyMealPlanById(planId)
    
    revalidatePath('/weekly-calendar')
    revalidatePath(`/weekly-calendar/${planId}`)
    
    return { success: true, plan: plan || undefined }
  } catch (error) {
    console.error('Failed to refresh headcounts:', error)
    return { success: false, error: 'Failed to refresh headcounts' }
  }
}

export async function updateMealHeadcountsAction(
  mealId: string,
  headcounts: { headcount_eats_all: number; headcount_vegetarian: number; headcount_vegan: number }
): Promise<{ success: boolean; meal?: WeeklyMealPlanMeal; error?: string }> {
  try {
    const meal = await updateMealPlanMealHeadcounts(mealId, headcounts)
    revalidatePath('/weekly-calendar')
    return { success: true, meal }
  } catch (error) {
    console.error('Failed to update meal headcounts:', error)
    return { success: false, error: 'Failed to update headcounts' }
  }
}

export async function addRecipeToMealAction(
  mealId: string,
  recipeId: string,
  recipeRole: string,
  servingTarget: string
): Promise<{ success: boolean; recipe?: WeeklyMealPlanRecipe; error?: string }> {
  try {
    const recipe = await addRecipeToMealPlanMeal(mealId, recipeId, recipeRole, servingTarget)
    revalidatePath('/weekly-calendar')
    return { success: true, recipe }
  } catch (error) {
    console.error('Failed to add recipe to meal:', error)
    return { success: false, error: 'Failed to add recipe' }
  }
}

export async function removeRecipeFromMealAction(
  recipeId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await removeRecipeFromMealPlanMeal(recipeId)
    revalidatePath('/weekly-calendar')
    return { success: true }
  } catch (error) {
    console.error('Failed to remove recipe from meal:', error)
    return { success: false, error: 'Failed to remove recipe' }
  }
}
