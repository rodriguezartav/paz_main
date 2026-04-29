'use server'

import { revalidatePath } from 'next/cache'
import { 
  getWeeklyMealPlanWithMealsForShoppingList, 
  updateIngredientStock, 
  bulkUpdateIngredientStock,
  getShoppingRelevantIngredients,
  getActiveResidentsForDateRange,
  getMealsWithPrepDateInRange
} from '@/lib/db/queries'
import type { 
  ShoppingListCalculatedItem, 
  ShoppingListResult, 
  DayOfWeek, 
  Ingredient,
  WeeklyMealPlanMeal
} from '@/lib/types'

const dayOfWeekOrder: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

function getDateForDayOfWeek(weekStartDate: string, dayOfWeek: DayOfWeek): string {
  // Parse the date parts directly to avoid timezone issues
  const [year, month, day] = weekStartDate.split('-').map(Number)
  const startDate = new Date(year, month - 1, day)
  const dayIndex = dayOfWeekOrder.indexOf(dayOfWeek)
  const targetDate = new Date(startDate)
  targetDate.setDate(startDate.getDate() + dayIndex)
  // Format as YYYY-MM-DD without timezone conversion
  const y = targetDate.getFullYear()
  const m = String(targetDate.getMonth() + 1).padStart(2, '0')
  const d = String(targetDate.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getDayOfWeekFromDate(weekStartDate: string, date: string): DayOfWeek | null {
  // Parse dates directly to avoid timezone issues
  const [sy, sm, sd] = weekStartDate.split('-').map(Number)
  const [ty, tm, td] = date.split('-').map(Number)
  const start = new Date(sy, sm - 1, sd)
  const target = new Date(ty, tm - 1, td)
  const diffDays = Math.round((target.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays >= 0 && diffDays < 7) {
    return dayOfWeekOrder[diffDays]
  }
  return null
}

function getMealTotalHeadcount(meal: WeeklyMealPlanMeal): number {
  return (meal.headcount_eats_all || 0) + (meal.headcount_vegetarian || 0) + (meal.headcount_vegan || 0)
}

// Calculate the prep date for a meal (meal_date - prep_day_offset)
function getPrepDate(mealDate: string, prepDayOffset: number): string {
  const [year, month, day] = mealDate.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() - prepDayOffset)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Check if a prep date falls within a date range
function isPrepDateInRange(mealDate: string, prepDayOffset: number, rangeStart: string, rangeEnd: string): boolean {
  const prepDate = getPrepDate(mealDate, prepDayOffset)
  return prepDate >= rangeStart && prepDate <= rangeEnd
}

export async function updateIngredientStockAction(
  id: string, 
  itemsInStock: number
): Promise<{ success: boolean; error?: string }> {
  try {
    await updateIngredientStock(id, itemsInStock)
    revalidatePath('/shopping-list')
    return { success: true }
  } catch (error) {
    console.error('Failed to update ingredient stock:', error)
    return { success: false, error: 'Failed to update stock' }
  }
}

export async function bulkUpdateIngredientStockAction(
  updates: { id: string; items_in_stock: number }[]
): Promise<{ success: boolean; error?: string }> {
  try {
    await bulkUpdateIngredientStock(updates)
    revalidatePath('/shopping-list')
    return { success: true }
  } catch (error) {
    console.error('Failed to bulk update ingredient stock:', error)
    return { success: false, error: 'Failed to update stock' }
  }
}

export async function fetchIngredientsForRangeAction(
  weeklyMealPlanId: string,
  startDate: string,
  endDate: string
): Promise<{ 
  success: boolean
  ingredients?: Array<{
    id: string
    name: string
    type: string
    measurement: string
    items_in_stock: number | null
    add_to_shopping_list_per_person: number | null
    add_to_shopping_list_per_week: number | null
    source: 'recipe' | 'per_person' | 'per_week'
    recipe_name?: string
    recipe_amount?: number
    meal_date?: string
    prep_date?: string
  }>
  error?: string 
}> {
  try {
    // Fetch meals where prep_date falls within our shopping range
    // This includes meals from current week AND next week if their prep_day_offset puts them in range
    const meals = await getMealsWithPrepDateInRange(startDate, endDate)
    
    const shoppingIngredients = await getShoppingRelevantIngredients()
    
    // Track unique ingredients with their sources
    const ingredientMap = new Map<string, {
      id: string
      name: string
      type: string
      measurement: string
      items_in_stock: number | null
      add_to_shopping_list_per_person: number | null
      add_to_shopping_list_per_week: number | null
      source: 'recipe' | 'per_person' | 'per_week'
      recipe_name?: string
      recipe_amount?: number
      meal_date?: string
      prep_date?: string
    }>()

    // Process meals where prep_date (meal_date - prep_day_offset) falls in range
    for (const meal of meals) {
      const mealDate = meal.meal_date
      if (!mealDate) continue
      
      const prepDayOffset = meal.prep_day_offset || 0
      
      // Check if prep_date falls within our shopping range
      if (!isPrepDateInRange(mealDate, prepDayOffset, startDate, endDate)) {
        continue
      }
      
      if (!meal.recipes) continue
      
      const prepDate = getPrepDate(mealDate, prepDayOffset)
      
      for (const recipeEntry of meal.recipes) {
        const recipe = recipeEntry.recipe
        if (!recipe || !recipe.recipe_ingredients) continue

        for (const ri of recipe.recipe_ingredients) {
          if (!ri.ingredient) continue
          const ing = ri.ingredient
          
          // Add as recipe ingredient (unique by ingredient + recipe + meal_date)
          const key = `recipe-${ing.id}-${recipe.id}-${mealDate}`
          if (!ingredientMap.has(key)) {
            ingredientMap.set(key, {
              id: ing.id,
              name: ing.name,
              type: ing.type,
              measurement: ing.measurement,
              items_in_stock: ing.items_in_stock,
              add_to_shopping_list_per_person: ing.add_to_shopping_list_per_person,
              add_to_shopping_list_per_week: ing.add_to_shopping_list_per_week,
              source: 'recipe',
              recipe_name: recipe.name,
              recipe_amount: ri.amount,
              meal_date: mealDate,
              prep_date: prepDate
            })
          }
        }
      }
    }

    // Add per-person ingredients
    for (const ing of shoppingIngredients) {
      if ((ing.add_to_shopping_list_per_person || 0) > 0) {
        const key = `per_person-${ing.id}`
        if (!ingredientMap.has(key)) {
          ingredientMap.set(key, {
            id: ing.id,
            name: ing.name,
            type: ing.type,
            measurement: ing.measurement,
            items_in_stock: ing.items_in_stock,
            add_to_shopping_list_per_person: ing.add_to_shopping_list_per_person,
            add_to_shopping_list_per_week: ing.add_to_shopping_list_per_week,
            source: 'per_person'
          })
        }
      }
    }

    // Add per-week ingredients
    for (const ing of shoppingIngredients) {
      if ((ing.add_to_shopping_list_per_week || 0) > 0) {
        const key = `per_week-${ing.id}`
        if (!ingredientMap.has(key)) {
          ingredientMap.set(key, {
            id: ing.id,
            name: ing.name,
            type: ing.type,
            measurement: ing.measurement,
            items_in_stock: ing.items_in_stock,
            add_to_shopping_list_per_person: ing.add_to_shopping_list_per_person,
            add_to_shopping_list_per_week: ing.add_to_shopping_list_per_week,
            source: 'per_week'
          })
        }
      }
    }

    const ingredients = Array.from(ingredientMap.values())
    // Sort by source, then type, then name
    ingredients.sort((a, b) => {
      const sourceOrder = { recipe: 0, per_person: 1, per_week: 2 }
      if (sourceOrder[a.source] !== sourceOrder[b.source]) {
        return sourceOrder[a.source] - sourceOrder[b.source]
      }
      if (a.type !== b.type) return a.type.localeCompare(b.type)
      return a.name.localeCompare(b.name)
    })

    return { success: true, ingredients }
  } catch (error) {
    console.error('Failed to fetch ingredients for range:', error)
    return { success: false, error: 'Failed to fetch ingredients' }
  }
}

export async function generateShoppingListAction(
  weeklyMealPlanId: string,
  startDate: string,
  endDate: string
): Promise<{ success: boolean; result?: ShoppingListResult; error?: string }> {
  try {
    // Fetch meals where prep_date falls within our shopping range
    // This includes meals from current week AND next week if their prep_day_offset puts them in range
    const allMeals = await getMealsWithPrepDateInRange(startDate, endDate)

    // Fetch shopping-relevant ingredients (per-person and weekly flags)
    const shoppingIngredients = await getShoppingRelevantIngredients()
    
    // Get fallback resident count
    const fallbackResidentCount = await getActiveResidentsForDateRange(startDate, endDate)

    // Build a map of ingredient calculations
    const ingredientMap = new Map<string, ShoppingListCalculatedItem>()

    // Helper to ensure ingredient exists in map
    const ensureIngredient = (ingredient: Ingredient) => {
      if (!ingredientMap.has(ingredient.id)) {
        ingredientMap.set(ingredient.id, {
          ingredient_id: ingredient.id,
          name: ingredient.name,
          type: ingredient.type,
          measurement: ingredient.measurement,
          recipe_amount: 0,
          per_person_amount: 0,
          weekly_amount: 0,
          total_needed: 0,
          items_in_stock: ingredient.items_in_stock || 0,
          final_amount_to_buy: 0,
          source_breakdown: {
            recipes: [],
            per_person_days: [],
            weekly: 0
          }
        })
      }
      return ingredientMap.get(ingredient.id)!
    }

    // Get all dates in the selected range
    const datesInRange: string[] = []
    // Parse dates directly to avoid timezone issues
    const [sy, sm, sd] = startDate.split('-').map(Number)
    const [ey, em, ed] = endDate.split('-').map(Number)
    const current = new Date(sy, sm - 1, sd)
    const end = new Date(ey, em - 1, ed)
    while (current <= end) {
      const y = current.getFullYear()
      const m = String(current.getMonth() + 1).padStart(2, '0')
      const d = String(current.getDate()).padStart(2, '0')
      datesInRange.push(`${y}-${m}-${d}`)
      current.setDate(current.getDate() + 1)
    }

    // Filter meals where prep_date falls in our shopping range and group by date
    const mealsByDate = new Map<string, { brunch?: WeeklyMealPlanMeal; dinner?: WeeklyMealPlanMeal }>()
    const mealsForRecipes: WeeklyMealPlanMeal[] = []
    
    for (const meal of allMeals) {
      const mealDate = meal.meal_date
      if (!mealDate) continue
      
      const prepDayOffset = meal.prep_day_offset || 0
      
      // Check if prep_date falls within our shopping range
      if (isPrepDateInRange(mealDate, prepDayOffset, startDate, endDate)) {
        mealsForRecipes.push(meal)
      }
      
      // For headcount purposes, only count meals actually served in the date range
      if (mealDate >= startDate && mealDate <= endDate) {
        if (!mealsByDate.has(mealDate)) {
          mealsByDate.set(mealDate, {})
        }
        const dateEntry = mealsByDate.get(mealDate)!
        if (meal.meal_type === 'brunch') {
          dateEntry.brunch = meal
        } else if (meal.meal_type === 'dinner') {
          dateEntry.dinner = meal
        }
      }
    }

    // A. Process scheduled recipes from meals (based on prep_date in range)
    for (const meal of mealsForRecipes) {
      if (!meal.recipes) continue
      
      const mealDate = meal.meal_date!
      const prepDayOffset = meal.prep_day_offset || 0
      const prepDate = getPrepDate(mealDate, prepDayOffset)
      const mealHeadcount = getMealTotalHeadcount(meal)
      
      for (const recipeEntry of meal.recipes) {
        const recipe = recipeEntry.recipe
        if (!recipe || !recipe.recipe_ingredients) continue

        for (const ri of recipe.recipe_ingredients) {
          if (!ri.ingredient) continue
          
          const item = ensureIngredient(ri.ingredient)
          const amount = ri.amount * mealHeadcount
          item.recipe_amount += amount
          item.source_breakdown.recipes.push({
            name: `${recipe.name} (served ${mealDate}, prep ${prepDate})`,
            amount
          })
        }
      }
    }

    // B. Process per-person shopping ingredients
    for (const date of datesInRange) {
      const meals = mealsByDate.get(date) || {}
      const brunchTotal = meals.brunch ? getMealTotalHeadcount(meals.brunch) : 0
      const dinnerTotal = meals.dinner ? getMealTotalHeadcount(meals.dinner) : 0
      
      // Use max of brunch/dinner, or fallback to resident count
      let peopleFedThatDay = Math.max(brunchTotal, dinnerTotal)
      if (peopleFedThatDay === 0) {
        peopleFedThatDay = fallbackResidentCount
      }

      for (const ingredient of shoppingIngredients) {
        if ((ingredient.add_to_shopping_list_per_person || 0) > 0) {
          const item = ensureIngredient(ingredient)
          const amount = (ingredient.add_to_shopping_list_per_person || 0) * peopleFedThatDay
          item.per_person_amount += amount
          item.source_breakdown.per_person_days.push({
            date,
            people: peopleFedThatDay,
            amount
          })
        }
      }
    }

    // C. Process weekly shopping ingredients (add once)
    for (const ingredient of shoppingIngredients) {
      if ((ingredient.add_to_shopping_list_per_week || 0) > 0) {
        const item = ensureIngredient(ingredient)
        item.weekly_amount = ingredient.add_to_shopping_list_per_week || 0
        item.source_breakdown.weekly = ingredient.add_to_shopping_list_per_week || 0
      }
    }

    // D. Calculate totals and final amounts
    const items: ShoppingListCalculatedItem[] = []
    for (const item of ingredientMap.values()) {
      item.total_needed = item.recipe_amount + item.per_person_amount + item.weekly_amount
      item.final_amount_to_buy = Math.max(0, item.total_needed - item.items_in_stock)
      
      // Only include items that need to be bought
      if (item.final_amount_to_buy > 0) {
        items.push(item)
      }
    }

    // Sort by type then name
    items.sort((a, b) => {
      if (a.type !== b.type) return a.type.localeCompare(b.type)
      return a.name.localeCompare(b.name)
    })

    const result: ShoppingListResult = {
      items,
      date_range: { start: startDate, end: endDate },
      weekly_meal_plan_id: weeklyMealPlanId,
      generated_at: new Date().toISOString()
    }

    return { success: true, result }
  } catch (error) {
    console.error('Failed to generate shopping list:', error)
    return { success: false, error: 'Failed to generate shopping list' }
  }
}
