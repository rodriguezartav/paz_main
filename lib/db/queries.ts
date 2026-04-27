import { createClient } from '@/lib/supabase/server'
import type { Resident, Payment, Ingredient, Recipe, RecipeIngredient } from '@/lib/types'

// Resident queries
export async function getResidents(): Promise<Resident[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('residents')
    .select('*')
    .order('arrival_date', { ascending: true })
  
  if (error) throw error
  return data || []
}

export async function getResidentById(id: string): Promise<Resident | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('residents')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) return null
  return data
}

export async function getResidentsByStatus(status: Resident['status']): Promise<Resident[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('residents')
    .select('*')
    .eq('status', status)
    .order('arrival_date', { ascending: true })
  
  if (error) throw error
  return data || []
}

// Payment queries
export async function getPayments(): Promise<Payment[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .order('payment_date', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function getPaymentByResidentId(residentId: string): Promise<Payment | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('resident_id', residentId)
    .single()
  
  if (error) return null
  return data
}

export async function getResidentsWithPayments(): Promise<{ resident: Resident; payment: Payment | null }[]> {
  const supabase = await createClient()
  
  const { data: residents, error: residentsError } = await supabase
    .from('residents')
    .select('*')
    .order('arrival_date', { ascending: true })
  
  if (residentsError) throw residentsError
  
  const { data: payments, error: paymentsError } = await supabase
    .from('payments')
    .select('*')
  
  if (paymentsError) throw paymentsError
  
  const paymentMap = new Map<string, Payment>()
  payments?.forEach(p => paymentMap.set(p.resident_id, p))
  
  return (residents || []).map(resident => ({
    resident,
    payment: paymentMap.get(resident.id) || null
  }))
}

// Ingredient queries
export async function getIngredients(): Promise<Ingredient[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('ingredients')
    .select('*')
    .order('name', { ascending: true })
  
  if (error) throw error
  return data || []
}

export async function getIngredientById(id: string): Promise<Ingredient | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('ingredients')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) return null
  return data
}

export async function createIngredient(ingredient: Omit<Ingredient, 'id' | 'created_at' | 'updated_at'>): Promise<Ingredient> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('ingredients')
    .insert(ingredient)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateIngredient(id: string, ingredient: Partial<Omit<Ingredient, 'id' | 'created_at' | 'updated_at'>>): Promise<Ingredient> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('ingredients')
    .update(ingredient)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteIngredient(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('ingredients')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Recipe queries
export async function getRecipes(): Promise<Recipe[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      *,
      recipe_ingredients (
        *,
        ingredient:ingredients (*)
      )
    `)
    .order('name', { ascending: true })
  
  if (error) throw error
  return data || []
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      *,
      recipe_ingredients (
        *,
        ingredient:ingredients (*)
      )
    `)
    .eq('id', id)
    .single()
  
  if (error) return null
  return data
}

export async function createRecipe(
  recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'recipe_ingredients'>,
  ingredients: { ingredient_id: string; amount: number; measurement: string }[]
): Promise<Recipe> {
  const supabase = await createClient()
  
  const { data: newRecipe, error: recipeError } = await supabase
    .from('recipes')
    .insert(recipe)
    .select()
    .single()
  
  if (recipeError) throw recipeError
  
  if (ingredients.length > 0) {
    const recipeIngredients = ingredients.map(ing => ({
      recipe_id: newRecipe.id,
      ingredient_id: ing.ingredient_id,
      amount: ing.amount,
      measurement: ing.measurement
    }))
    
    const { error: ingredientsError } = await supabase
      .from('recipe_ingredients')
      .insert(recipeIngredients)
    
    if (ingredientsError) throw ingredientsError
  }
  
  return newRecipe
}

export async function updateRecipe(
  id: string,
  recipe: Partial<Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'recipe_ingredients'>>,
  ingredients?: { ingredient_id: string; amount: number; measurement: string }[]
): Promise<Recipe> {
  const supabase = await createClient()
  
  const { data: updatedRecipe, error: recipeError } = await supabase
    .from('recipes')
    .update(recipe)
    .eq('id', id)
    .select()
    .single()
  
  if (recipeError) throw recipeError
  
  if (ingredients !== undefined) {
    // Delete existing ingredients
    await supabase
      .from('recipe_ingredients')
      .delete()
      .eq('recipe_id', id)
    
    // Insert new ingredients
    if (ingredients.length > 0) {
      const recipeIngredients = ingredients.map(ing => ({
        recipe_id: id,
        ingredient_id: ing.ingredient_id,
        amount: ing.amount,
        measurement: ing.measurement
      }))
      
      const { error: ingredientsError } = await supabase
        .from('recipe_ingredients')
        .insert(recipeIngredients)
      
      if (ingredientsError) throw ingredientsError
    }
  }
  
  return updatedRecipe
}

export async function deleteRecipe(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Resident mutations
export async function updateResident(id: string, updates: Partial<Omit<Resident, 'id' | 'created_at' | 'updated_at'>>): Promise<Resident> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('residents')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updatePayment(id: string, updates: Partial<Omit<Payment, 'id' | 'created_at' | 'updated_at'>>): Promise<Payment> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('payments')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Helper function to calculate nights
export function calculateNights(arrivalDate: string, departureDate: string): number {
  const arrival = new Date(arrivalDate)
  const departure = new Date(departureDate)
  const diffTime = Math.abs(departure.getTime() - arrival.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}
