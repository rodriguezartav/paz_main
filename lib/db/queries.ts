import { createClient } from '@/lib/supabase/server'
import type { Resident, Payment, Ingredient, Recipe, RecipeIngredient, Room, Bed, ResidentBed } from '@/lib/types'

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

// Room queries
export async function getRooms(): Promise<Room[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('rooms')
    .select(`
      *,
      beds (
        *,
        current_assignment:resident_beds (
          *,
          resident:residents (*)
        )
      )
    `)
    .order('name', { ascending: true })
  
  if (error) throw error
  
  // Filter to only active assignments
  return (data || []).map(room => ({
    ...room,
    beds: room.beds?.map((bed: any) => ({
      ...bed,
      current_assignment: bed.current_assignment?.find((a: any) => a.is_active) || null
    }))
  }))
}

export async function getRoomById(id: string): Promise<Room | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('rooms')
    .select(`
      *,
      beds (
        *,
        current_assignment:resident_beds (
          *,
          resident:residents (*)
        )
      )
    `)
    .eq('id', id)
    .single()
  
  if (error) return null
  
  return {
    ...data,
    beds: data.beds?.map((bed: any) => ({
      ...bed,
      current_assignment: bed.current_assignment?.find((a: any) => a.is_active) || null
    }))
  }
}

export async function createRoom(room: Omit<Room, 'id' | 'created_at' | 'updated_at' | 'beds'>): Promise<Room> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('rooms')
    .insert(room)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateRoom(id: string, room: Partial<Omit<Room, 'id' | 'created_at' | 'updated_at' | 'beds'>>): Promise<Room> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('rooms')
    .update(room)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteRoom(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('rooms')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Bed queries
export async function createBed(bed: Omit<Bed, 'id' | 'created_at' | 'updated_at' | 'room' | 'current_assignment'>): Promise<Bed> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('beds')
    .insert(bed)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateBed(id: string, bed: Partial<Omit<Bed, 'id' | 'created_at' | 'updated_at' | 'room' | 'current_assignment'>>): Promise<Bed> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('beds')
    .update(bed)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteBed(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('beds')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Resident-Bed assignment queries
export async function assignResidentToBed(residentId: string, bedId: string): Promise<ResidentBed> {
  const supabase = await createClient()
  
  // First, check if bed already has an active assignment
  const { data: existingAssignment } = await supabase
    .from('resident_beds')
    .select('*')
    .eq('bed_id', bedId)
    .eq('is_active', true)
    .single()
  
  // If there's an existing assignment, deactivate it
  if (existingAssignment) {
    await supabase
      .from('resident_beds')
      .update({ is_active: false, released_at: new Date().toISOString() })
      .eq('id', existingAssignment.id)
  }
  
  // Create new assignment
  const { data, error } = await supabase
    .from('resident_beds')
    .insert({
      resident_id: residentId,
      bed_id: bedId,
      is_active: true
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function assignResidentToMultipleBeds(residentId: string, bedIds: string[]): Promise<ResidentBed[]> {
  const supabase = await createClient()
  
  // First, deactivate any existing assignments for these beds
  for (const bedId of bedIds) {
    await supabase
      .from('resident_beds')
      .update({ is_active: false, released_at: new Date().toISOString() })
      .eq('bed_id', bedId)
      .eq('is_active', true)
  }
  
  // Create new assignments
  const assignments = bedIds.map(bedId => ({
    resident_id: residentId,
    bed_id: bedId,
    is_active: true
  }))
  
  const { data, error } = await supabase
    .from('resident_beds')
    .insert(assignments)
    .select()
  
  if (error) throw error
  return data || []
}

export async function unassignBed(bedId: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('resident_beds')
    .update({ is_active: false, released_at: new Date().toISOString() })
    .eq('bed_id', bedId)
    .eq('is_active', true)
  
  if (error) throw error
}

export async function getResidentBeds(residentId: string): Promise<ResidentBed[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('resident_beds')
    .select(`
      *,
      bed:beds (
        *,
        room:rooms (*)
      )
    `)
    .eq('resident_id', residentId)
    .eq('is_active', true)
  
  if (error) throw error
  return data || []
}

// Get all residents for assignment dropdown
export async function getActiveResidents(): Promise<Resident[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('residents')
    .select('*')
    .in('status', ['checked_in', 'staying', 'upcoming'])
    .order('name', { ascending: true })
  
  if (error) throw error
  return data || []
}
