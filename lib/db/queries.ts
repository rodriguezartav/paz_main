import { createClient } from '@/lib/supabase/server'
import type { Resident, Payment, Ingredient, Recipe, RecipeIngredient, Building, Room, Bed, ResidentBed, ApplicationQuestion, Application, ApplicationAnswer, ApplicationSection, WeeklyMenuTemplate, WeeklyMenuTemplateMeal, WeeklyMenuTemplateMealRecipe, DayOfWeek, MealType, WeeklyMealPlan, WeeklyMealPlanMeal, WeeklyMealPlanRecipe, DietHeadcount, RateRule, ResidentPriceModifier, ResidentBill, ScheduledActivity } from '@/lib/types'

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
    .select(`
      *,
      current_bed:resident_beds (
        id,
        bed:beds (
          id,
          name,
          room:rooms (
            id,
            name,
            building:buildings (
              id,
              name
            )
          )
        )
      )
    `)
    .eq('id', id)
    .single()
  
  if (error) return null
  return data
}

export async function createResidentFromApplication(data: {
  name: string
  email: string
  whatsapp?: string | null
  nationality?: string | null
  gender: 'female' | 'male'
  age?: number | null
  diet: 'eats_all' | 'vegetarian' | 'vegan'
  resident_type?: 'volunteer' | 'resident' | 'retreat'
  arrival_date: string
  departure_date: string
  nightly_rate?: number
  application_id: string
  notes?: string | null
}): Promise<Resident> {
  const supabase = await createClient()
  
  // Set resident_since to today's date in Costa Rica timezone when creating from application
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Costa_Rica' })
  
  const { data: resident, error } = await supabase
    .from('residents')
    .insert({
      ...data,
      resident_since: today,
      status: 'upcoming',
      check_in_completed: false,
      release_accepted: false,
      health_insurance_confirmed: false,
      media_release_accepted: false,
      orientation_completed: false,
    })
    .select()
    .single()
  
  if (error) throw error
  return resident
}

export async function deleteResident(id: string): Promise<void> {
  const supabase = await createClient()
  
  // Delete related payments first (cascade)
  const { error: paymentsError } = await supabase
    .from('payments')
    .delete()
    .eq('resident_id', id)
  
  if (paymentsError) throw paymentsError
  
  // Delete related resident_beds (cascade)
  const { error: bedsError } = await supabase
    .from('resident_beds')
    .delete()
    .eq('resident_id', id)
  
  if (bedsError) throw bedsError
  
  // Delete the resident
  const { error: residentError } = await supabase
    .from('residents')
    .delete()
    .eq('id', id)
  
  if (residentError) throw residentError
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
  
  let updatedRecipe: Recipe
  
  // Only update recipe fields if there are fields to update
  const hasRecipeFields = Object.keys(recipe).length > 0
  
  if (hasRecipeFields) {
    const { data, error: recipeError } = await supabase
      .from('recipes')
      .update(recipe)
      .eq('id', id)
      .select()
      .single()
    
    if (recipeError) throw recipeError
    updatedRecipe = data
  } else {
    // Just fetch the current recipe if no fields to update
    const { data, error: fetchError } = await supabase
      .from('recipes')
      .select()
      .eq('id', id)
      .single()
    
    if (fetchError) throw fetchError
    updatedRecipe = data
  }
  
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

// Dashboard queries
export async function getDashboardResidents(startDate: string, endDate: string): Promise<Resident[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('residents')
    .select('*')
    .or(`arrival_date.lte.${endDate},departure_date.gte.${startDate}`)
    .order('arrival_date', { ascending: true })
  
  if (error) throw error
  return data || []
}

export async function getPendingApplicationsCount(): Promise<number> {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')
    .not('submitted_at', 'is', null)
  
  if (error) throw error
  return count || 0
}

export async function getRoomOccupancyForDateRange(startDate: string, endDate: string): Promise<{
  rooms: Room[];
  residents: Resident[];
}> {
  const supabase = await createClient()
  
  // Get all rooms with beds and building
  const { data: rooms, error: roomsError } = await supabase
    .from('rooms')
    .select(`
      *,
      building:buildings (*),
      beds (
        *,
        current_assignment:resident_beds (
          *,
          resident:residents (*)
        )
      )
    `)
    .order('name', { ascending: true })
  
  if (roomsError) throw roomsError
  
  // Get residents staying during the date range
  const { data: residents, error: residentsError } = await supabase
    .from('residents')
    .select('*')
    .lte('arrival_date', endDate)
    .gte('departure_date', startDate)
    .in('status', ['checked_in', 'staying', 'upcoming'])
  
  if (residentsError) throw residentsError
  
  // Process rooms to filter active assignments
  const processedRooms = (rooms || []).map(room => ({
    ...room,
    beds: room.beds?.map((bed: any) => ({
      ...bed,
      current_assignment: bed.current_assignment?.find((a: any) => a.is_active) || null
    }))
  }))
  
  return {
    rooms: processedRooms,
    residents: residents || []
  }
}

// Building queries
export async function getBuildings(): Promise<Building[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('buildings')
    .select(`
      *,
      rooms (
        *,
        beds (
          *,
          current_assignment:resident_beds (
            *,
            resident:residents (*)
          )
        )
      )
    `)
    .order('name', { ascending: true })
  
  if (error) throw error
  
  // Filter to only active assignments in beds
  return (data || []).map(building => ({
    ...building,
    rooms: building.rooms?.map((room: any) => ({
      ...room,
      beds: room.beds?.map((bed: any) => ({
        ...bed,
        current_assignment: bed.current_assignment?.find((a: any) => a.is_active) || null
      }))
    }))
  }))
}

export async function getBuildingById(id: string): Promise<Building | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('buildings')
    .select(`
      *,
      rooms (
        *,
        beds (
          *,
          current_assignment:resident_beds (
            *,
            resident:residents (*)
          )
        )
      )
    `)
    .eq('id', id)
    .single()
  
  if (error) return null
  
  return {
    ...data,
    rooms: data.rooms?.map((room: any) => ({
      ...room,
      beds: room.beds?.map((bed: any) => ({
        ...bed,
        current_assignment: bed.current_assignment?.find((a: any) => a.is_active) || null
      }))
    }))
  }
}

export async function createBuilding(building: Omit<Building, 'id' | 'created_at' | 'updated_at' | 'rooms'>): Promise<Building> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('buildings')
    .insert(building)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateBuilding(id: string, building: Partial<Omit<Building, 'id' | 'created_at' | 'updated_at' | 'rooms'>>): Promise<Building> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('buildings')
    .update(building)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteBuilding(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('buildings')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Room queries
export async function getRooms(): Promise<Room[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('rooms')
    .select(`
      *,
      building:buildings (*),
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

export async function createRoom(room: Omit<Room, 'id' | 'created_at' | 'updated_at' | 'beds' | 'building'>): Promise<Room> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('rooms')
    .insert(room)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateRoom(id: string, room: Partial<Omit<Room, 'id' | 'created_at' | 'updated_at' | 'beds' | 'building'>>): Promise<Room> {
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

// Application Question queries
export async function getApplicationQuestions(activeOnly = true): Promise<ApplicationQuestion[]> {
  const supabase = await createClient()
  let query = supabase
    .from('application_questions')
    .select('*')
    .order('section_key', { ascending: true })
    .order('order_index', { ascending: true })
  
  if (activeOnly) {
    query = query.eq('active', true)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data || []
}

export async function getApplicationSections(activeOnly = true): Promise<ApplicationSection[]> {
  const questions = await getApplicationQuestions(activeOnly)
  
  const sectionMap = new Map<string, ApplicationSection>()
  const sectionOrder = [
    'basic_info', 'reason_coming', 'essentials', 'digital_detox', 
    'emotional_maturity', 'community_life', 'nature_risk', 
    'activities', 'work_wifi', 'expectations', 'final_note'
  ]
  
  for (const question of questions) {
    if (!sectionMap.has(question.section_key)) {
      sectionMap.set(question.section_key, {
        key: question.section_key,
        title: question.section_title,
        intro: question.section_intro,
        questions: []
      })
    }
    sectionMap.get(question.section_key)!.questions.push(question)
  }
  
  // Sort sections according to predefined order
  const sections: ApplicationSection[] = []
  for (const key of sectionOrder) {
    if (sectionMap.has(key)) {
      sections.push(sectionMap.get(key)!)
    }
  }
  
  // Add any sections not in the predefined order at the end
  for (const [key, section] of sectionMap) {
    if (!sectionOrder.includes(key)) {
      sections.push(section)
    }
  }
  
  return sections
}

export async function getApplicationQuestionById(id: string): Promise<ApplicationQuestion | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('application_questions')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) return null
  return data
}

export async function createApplicationQuestion(question: Omit<ApplicationQuestion, 'id' | 'created_at' | 'updated_at'>): Promise<ApplicationQuestion> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('application_questions')
    .insert(question)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateApplicationQuestion(id: string, question: Partial<Omit<ApplicationQuestion, 'id' | 'created_at' | 'updated_at'>>): Promise<ApplicationQuestion> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('application_questions')
    .update(question)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteApplicationQuestion(id: string): Promise<void> {
  const supabase = await createClient()
  
  // First delete any answers referencing this question (cascade)
  const { error: answersError } = await supabase
    .from('application_answers')
    .delete()
    .eq('question_id', id)
  
  if (answersError) throw answersError
  
  // Then delete the question
  const { error } = await supabase
    .from('application_questions')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Application queries
export async function getApplications(): Promise<Application[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      answers:application_answers (
        *,
        question:application_questions (*)
      )
    `)
    .order('submitted_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function getApplicationById(id: string): Promise<Application | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      answers:application_answers (
        *,
        question:application_questions (*)
      )
    `)
    .eq('id', id)
    .single()
  
  if (error) return null
  return data
}

export async function createApplication(answers: { question_id: string; answer_value: any; question_text_snapshot: string; section_title_snapshot: string; question_type_snapshot: string }[]): Promise<Application> {
  const supabase = await createClient()
  
  // Extract name, email, phone from answers
  let applicantName: string | null = null
  let applicantEmail: string | null = null
  let applicantPhone: string | null = null
  
  for (const answer of answers) {
    const text = answer.question_text_snapshot.toLowerCase()
    if (text.includes('full name')) {
      applicantName = String(answer.answer_value)
    } else if (text === 'email') {
      applicantEmail = String(answer.answer_value)
    } else if (text.includes('whatsapp')) {
      applicantPhone = String(answer.answer_value)
    }
  }
  
  // Create application
  const { data: application, error: appError } = await supabase
    .from('applications')
    .insert({
      applicant_name: applicantName,
      applicant_email: applicantEmail,
      applicant_phone: applicantPhone,
      status: 'pending',
      submitted_at: new Date().toISOString()
    })
    .select()
    .single()
  
  if (appError) throw appError
  
  // Create answers
  const answersToInsert = answers.map(a => ({
    application_id: application.id,
    question_id: a.question_id,
    answer_value: JSON.stringify(a.answer_value),
    question_text_snapshot: a.question_text_snapshot,
    section_title_snapshot: a.section_title_snapshot,
    question_type_snapshot: a.question_type_snapshot
  }))
  
  const { error: answersError } = await supabase
    .from('application_answers')
    .insert(answersToInsert)
  
  if (answersError) throw answersError
  
  return application
}

export async function updateApplication(id: string, updates: Partial<Omit<Application, 'id' | 'created_at' | 'updated_at' | 'answers'>>): Promise<Application> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('applications')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteApplication(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('applications')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Draft application support - saves progress at each section
export async function createOrUpdateDraftApplication(
  applicationId: string | null,
  answers: { question_id: string; answer_value: any; question_text_snapshot: string; section_title_snapshot: string; question_type_snapshot: string }[]
): Promise<Application> {
  const supabase = await createClient()
  
  // Extract name, email, phone from answers
  let applicantName: string | null = null
  let applicantEmail: string | null = null
  let applicantPhone: string | null = null
  
  for (const answer of answers) {
    const text = answer.question_text_snapshot.toLowerCase()
    if (text.includes('full name') && answer.answer_value) {
      applicantName = String(answer.answer_value)
    } else if (text === 'email' && answer.answer_value) {
      applicantEmail = String(answer.answer_value)
    } else if (text.includes('whatsapp') && answer.answer_value) {
      applicantPhone = String(answer.answer_value)
    }
  }
  
  let application: Application
  
  if (applicationId) {
    // Update existing application
    const { data, error } = await supabase
      .from('applications')
      .update({
        applicant_name: applicantName,
        applicant_email: applicantEmail,
        applicant_phone: applicantPhone
      })
      .eq('id', applicationId)
      .select()
      .single()
    
    if (error) throw error
    application = data
    
    // Delete existing answers and re-insert (simpler than upsert for JSONB)
    await supabase
      .from('application_answers')
      .delete()
      .eq('application_id', applicationId)
  } else {
    // Create new draft application (no submitted_at means it's a draft)
    const { data, error } = await supabase
      .from('applications')
      .insert({
        applicant_name: applicantName,
        applicant_email: applicantEmail,
        applicant_phone: applicantPhone,
        status: 'pending',
        submitted_at: null
      })
      .select()
      .single()
    
    if (error) throw error
    application = data
  }
  
  // Insert answers (only those with values)
  const answersToInsert = answers
    .filter(a => a.answer_value !== undefined && a.answer_value !== null && a.answer_value !== '')
    .map(a => ({
      application_id: application.id,
      question_id: a.question_id,
      answer_value: JSON.stringify(a.answer_value),
      question_text_snapshot: a.question_text_snapshot,
      section_title_snapshot: a.section_title_snapshot,
      question_type_snapshot: a.question_type_snapshot
    }))
  
  if (answersToInsert.length > 0) {
    const { error: answersError } = await supabase
      .from('application_answers')
      .insert(answersToInsert)
    
    if (answersError) throw answersError
  }
  
  return application
}

export async function submitDraftApplication(applicationId: string): Promise<Application> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('applications')
    .update({
      submitted_at: new Date().toISOString()
    })
    .eq('id', applicationId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Weekly Menu Template queries
const DAYS_OF_WEEK: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const MEAL_TYPES: MealType[] = ['brunch', 'dinner']

export async function getWeeklyMenuTemplates(): Promise<WeeklyMenuTemplate[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('weekly_menu_templates')
    .select(`
      *,
      meals:weekly_menu_template_meals (
        *,
        recipes:weekly_menu_template_meal_recipes (
          *,
          recipe:recipes (*)
        )
      )
    `)
    .order('name', { ascending: true })
  
  if (error) throw error
  return data || []
}

export async function getWeeklyMenuTemplateById(id: string): Promise<WeeklyMenuTemplate | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('weekly_menu_templates')
    .select(`
      *,
      meals:weekly_menu_template_meals (
        *,
        recipes:weekly_menu_template_meal_recipes (
          *,
          recipe:recipes (*)
        )
      )
    `)
    .eq('id', id)
    .single()
  
  if (error) return null
  return data
}

export async function createWeeklyMenuTemplate(template: { name: string; description: string | null }): Promise<WeeklyMenuTemplate> {
  const supabase = await createClient()
  
  // Create the template
  const { data: templateData, error: templateError } = await supabase
    .from('weekly_menu_templates')
    .insert({
      name: template.name,
      description: template.description,
      active: true
    })
    .select()
    .single()
  
  if (templateError) throw templateError
  
  // Create all 14 meal slots
  const meals: { weekly_menu_template_id: string; day_of_week: DayOfWeek; meal_type: MealType; prep_day_offset: number; order_index: number }[] = []
  let orderIndex = 0
  
  for (const day of DAYS_OF_WEEK) {
    for (const mealType of MEAL_TYPES) {
      // Default prep_day_offset:
      // - Monday brunch: -2 (prepped 2 days before, on Saturday)
      // - Wednesday and Sunday: -1 (prepped day before)
      // - All others: 0 (same day)
      let prepDayOffset = 0
      if (day === 'monday' && mealType === 'brunch') {
        prepDayOffset = -2
      } else if (day === 'wednesday' || day === 'sunday') {
        prepDayOffset = -1
      }
      
      meals.push({
        weekly_menu_template_id: templateData.id,
        day_of_week: day,
        meal_type: mealType,
        prep_day_offset: prepDayOffset,
        order_index: orderIndex++
      })
    }
  }
  
  const { error: mealsError } = await supabase
    .from('weekly_menu_template_meals')
    .insert(meals)
  
  if (mealsError) throw mealsError
  
  // Return the template with meals
  return getWeeklyMenuTemplateById(templateData.id) as Promise<WeeklyMenuTemplate>
}

export async function updateWeeklyMenuTemplate(id: string, updates: Partial<{ name: string; description: string | null; active: boolean }>): Promise<WeeklyMenuTemplate> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('weekly_menu_templates')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteWeeklyMenuTemplate(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('weekly_menu_templates')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export async function duplicateWeeklyMenuTemplate(id: string, newName: string): Promise<WeeklyMenuTemplate> {
  const supabase = await createClient()
  
  // Get the original template with all meals and recipes
  const original = await getWeeklyMenuTemplateById(id)
  if (!original) throw new Error('Template not found')
  
  // Create the new template
  const { data: newTemplate, error: templateError } = await supabase
    .from('weekly_menu_templates')
    .insert({
      name: newName,
      description: original.description,
      active: false // Start as inactive
    })
    .select()
    .single()
  
  if (templateError) throw templateError
  
  // Duplicate all meals
  if (original.meals) {
    for (const meal of original.meals) {
      const { data: newMeal, error: mealError } = await supabase
        .from('weekly_menu_template_meals')
        .insert({
          weekly_menu_template_id: newTemplate.id,
          day_of_week: meal.day_of_week,
          meal_type: meal.meal_type,
          prep_day_offset: meal.prep_day_offset,
          order_index: meal.order_index,
          notes: meal.notes
        })
        .select()
        .single()
      
      if (mealError) throw mealError
      
      // Duplicate meal recipes
      if (meal.recipes && meal.recipes.length > 0) {
        const recipesToInsert = meal.recipes.map(r => ({
          template_meal_id: newMeal.id,
          recipe_id: r.recipe_id,
          recipe_role: r.recipe_role,
          serving_target: r.serving_target,
          order_index: r.order_index,
          notes: r.notes
        }))
        
        const { error: recipesError } = await supabase
          .from('weekly_menu_template_meal_recipes')
          .insert(recipesToInsert)
        
        if (recipesError) throw recipesError
      }
    }
  }
  
  return getWeeklyMenuTemplateById(newTemplate.id) as Promise<WeeklyMenuTemplate>
}

// Template Meal queries
export async function updateTemplateMeal(id: string, updates: Partial<{ prep_day_offset: number; notes: string | null }>): Promise<WeeklyMenuTemplateMeal> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('weekly_menu_template_meals')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Template Meal Recipe queries
export async function addRecipeToTemplateMeal(
  templateMealId: string,
  recipeId: string,
  recipeRole: string,
  servingTarget: string,
  notes?: string
): Promise<WeeklyMenuTemplateMealRecipe> {
  const supabase = await createClient()
  
  // Get current max order_index
  const { data: existing } = await supabase
    .from('weekly_menu_template_meal_recipes')
    .select('order_index')
    .eq('template_meal_id', templateMealId)
    .order('order_index', { ascending: false })
    .limit(1)
  
  const orderIndex = existing && existing.length > 0 ? existing[0].order_index + 1 : 0
  
  const { data, error } = await supabase
    .from('weekly_menu_template_meal_recipes')
    .insert({
      template_meal_id: templateMealId,
      recipe_id: recipeId,
      recipe_role: recipeRole,
      serving_target: servingTarget,
      order_index: orderIndex,
      notes: notes || null
    })
    .select(`
      *,
      recipe:recipes (*)
    `)
    .single()
  
  if (error) throw error
  return data
}

export async function updateTemplateMealRecipe(
  id: string,
  updates: Partial<{ recipe_role: string; serving_target: string; order_index: number; notes: string | null }>
): Promise<WeeklyMenuTemplateMealRecipe> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('weekly_menu_template_meal_recipes')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function removeRecipeFromTemplateMeal(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('weekly_menu_template_meal_recipes')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export async function reorderTemplateMealRecipes(templateMealId: string, recipeIds: string[]): Promise<void> {
  const supabase = await createClient()
  
  for (let i = 0; i < recipeIds.length; i++) {
    const { error } = await supabase
      .from('weekly_menu_template_meal_recipes')
      .update({ order_index: i })
      .eq('id', recipeIds[i])
    
    if (error) throw error
  }
}

// Weekly Meal Plan queries (actual calendar weeks)

// Get meal plans that cover a date range (for dashboard)
export async function getMealPlansForDateRange(startDate: string, endDate: string): Promise<WeeklyMealPlan[]> {
  const supabase = await createClient()
  
  // Get all meal plans where the week might overlap with our date range
  // A week starting up to 6 days before endDate could still overlap
  // Parse date directly to avoid timezone issues
  const [year, month, day] = startDate.split('-').map(Number)
  const earliestWeekStart = new Date(year, month - 1, day)
  earliestWeekStart.setDate(earliestWeekStart.getDate() - 6)
  const earliestWeekStartStr = `${earliestWeekStart.getFullYear()}-${String(earliestWeekStart.getMonth() + 1).padStart(2, '0')}-${String(earliestWeekStart.getDate()).padStart(2, '0')}`
  
  const { data, error } = await supabase
    .from('weekly_meal_plans')
    .select(`
      *,
      template:weekly_menu_templates (*),
      meals:weekly_meal_plan_meals (
        *,
        recipes:weekly_meal_plan_recipes (
          *,
          recipe:recipes (*)
        )
      )
    `)
    .gte('week_start_date', earliestWeekStartStr)
    .lte('week_start_date', endDate)
    .order('week_start_date', { ascending: true })
  
  if (error) throw error
  return data || []
}

export async function getWeeklyMealPlans(): Promise<WeeklyMealPlan[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('weekly_meal_plans')
    .select(`
      *,
      template:weekly_menu_templates (*),
      meals:weekly_meal_plan_meals (
        *,
        recipes:weekly_meal_plan_recipes (
          *,
          recipe:recipes (*)
        )
      )
    `)
    .order('week_start_date', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function getWeeklyMealPlanByDate(weekStartDate: string): Promise<WeeklyMealPlan | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('weekly_meal_plans')
    .select(`
      *,
      template:weekly_menu_templates (*),
      meals:weekly_meal_plan_meals (
        *,
        recipes:weekly_meal_plan_recipes (
          *,
          recipe:recipes (*)
        )
      )
    `)
    .eq('week_start_date', weekStartDate)
    .single()
  
  if (error) return null
  return data
}

export async function getWeeklyMealPlanById(id: string): Promise<WeeklyMealPlan | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('weekly_meal_plans')
    .select(`
      *,
      template:weekly_menu_templates (*),
      meals:weekly_meal_plan_meals (
        *,
        recipes:weekly_meal_plan_recipes (
          *,
          recipe:recipes (*)
        )
      )
    `)
    .eq('id', id)
    .single()
  
  if (error) return null
  return data
}

// Get diet headcount for residents on a specific date
export async function getDietHeadcountForDate(date: string): Promise<DietHeadcount> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('residents')
    .select('diet')
    .lte('arrival_date', date)
    .gte('departure_date', date)
    .in('status', ['checked_in', 'staying', 'upcoming'])
  
  if (error) throw error
  
  const residents = data || []
  return {
    eats_all: residents.filter(r => r.diet === 'eats_all').length,
    vegetarian: residents.filter(r => r.diet === 'vegetarian').length,
    vegan: residents.filter(r => r.diet === 'vegan').length,
    total: residents.length
  }
}

// Get diet headcounts for a week (returns map of date -> headcount)
export async function getDietHeadcountsForWeek(weekStartDate: string): Promise<Map<string, DietHeadcount>> {
  const result = new Map<string, DietHeadcount>()
  // Parse date directly to avoid timezone issues
  const [year, month, day] = weekStartDate.split('-').map(Number)
  const startDate = new Date(year, month - 1, day)
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    const headcount = await getDietHeadcountForDate(dateStr)
    result.set(dateStr, headcount)
  }
  
  return result
}

export async function createWeeklyMealPlan(
  weekStartDate: string, 
  templateId: string | null,
  defaultHeadcounts: Map<string, DietHeadcount>
): Promise<WeeklyMealPlan> {
  const supabase = await createClient()
  
  // Create the plan
  const { data: plan, error: planError } = await supabase
    .from('weekly_meal_plans')
    .insert({
      week_start_date: weekStartDate,
      template_id: templateId
    })
    .select()
    .single()
  
  if (planError) throw planError
  
  // Create all 14 meal slots with headcounts
  const days: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const mealTypes: MealType[] = ['brunch', 'dinner']
  const meals: any[] = []
  
  // Parse date directly to avoid timezone issues
  const [year, month, day] = weekStartDate.split('-').map(Number)
  const startDate = new Date(year, month - 1, day)
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    // Format as YYYY-MM-DD without timezone conversion
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    const dateStr = `${y}-${m}-${d}`
    const headcount = defaultHeadcounts.get(dateStr) || { eats_all: 0, vegetarian: 0, vegan: 0, total: 0 }
    
    for (const mealType of mealTypes) {
      // Monday brunch should be prepped 2 days before (Saturday)
      const prepDayOffset = (days[i] === 'monday' && mealType === 'brunch') ? 2 : 0
      
      meals.push({
        weekly_meal_plan_id: plan.id,
        day_of_week: days[i],
        meal_type: mealType,
        meal_date: dateStr,
        headcount_eats_all: headcount.eats_all,
        headcount_vegetarian: headcount.vegetarian,
        headcount_vegan: headcount.vegan,
        prep_day_offset: prepDayOffset
      })
    }
  }
  
  const { error: mealsError } = await supabase
    .from('weekly_meal_plan_meals')
    .insert(meals)
  
  if (mealsError) throw mealsError
  
  // If template provided, copy recipes from template
  if (templateId) {
    const template = await getWeeklyMenuTemplateById(templateId)
    if (template && template.meals) {
      // Get all newly created meals
      const { data: createdMeals } = await supabase
        .from('weekly_meal_plan_meals')
        .select('*')
        .eq('weekly_meal_plan_id', plan.id)
      
      if (createdMeals) {
        for (const templateMeal of template.meals) {
          const matchingMeal = createdMeals.find(
            m => m.day_of_week === templateMeal.day_of_week && m.meal_type === templateMeal.meal_type
          )
          
          if (matchingMeal && templateMeal.recipes && templateMeal.recipes.length > 0) {
            const recipesToInsert = templateMeal.recipes.map(r => ({
              meal_plan_meal_id: matchingMeal.id,
              recipe_id: r.recipe_id,
              recipe_role: r.recipe_role,
              serving_target: r.serving_target,
              order_index: r.order_index,
              notes: r.notes
            }))
            
            await supabase.from('weekly_meal_plan_recipes').insert(recipesToInsert)
          }
        }
      }
    }
  }
  
  return getWeeklyMealPlanById(plan.id) as Promise<WeeklyMealPlan>
}

export async function updateWeeklyMealPlan(id: string, updates: Partial<{ notes: string | null }>): Promise<WeeklyMealPlan> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('weekly_meal_plans')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteWeeklyMealPlan(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('weekly_meal_plans')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Update meal headcounts
export async function updateMealPlanMealHeadcounts(
  mealId: string, 
  headcounts: { headcount_eats_all: number; headcount_vegetarian: number; headcount_vegan: number }
): Promise<WeeklyMealPlanMeal> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('weekly_meal_plan_meals')
    .update(headcounts)
    .eq('id', mealId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Add recipe to meal plan meal
export async function addRecipeToMealPlanMeal(
  mealId: string,
  recipeId: string,
  recipeRole: string,
  servingTarget: string
): Promise<WeeklyMealPlanRecipe> {
  const supabase = await createClient()
  
  // Get max order index
  const { data: existing } = await supabase
    .from('weekly_meal_plan_recipes')
    .select('order_index')
    .eq('meal_plan_meal_id', mealId)
    .order('order_index', { ascending: false })
    .limit(1)
  
  const orderIndex = existing && existing.length > 0 ? existing[0].order_index + 1 : 0
  
  const { data, error } = await supabase
    .from('weekly_meal_plan_recipes')
    .insert({
      meal_plan_meal_id: mealId,
      recipe_id: recipeId,
      recipe_role: recipeRole,
      serving_target: servingTarget,
      order_index: orderIndex
    })
    .select(`*, recipe:recipes (*)`)
    .single()
  
  if (error) throw error
  return data
}

export async function removeRecipeFromMealPlanMeal(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('weekly_meal_plan_recipes')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Refresh headcounts from current residents
export async function refreshMealPlanHeadcounts(planId: string): Promise<void> {
  const supabase = await createClient()
  
  // Get the plan
  const plan = await getWeeklyMealPlanById(planId)
  if (!plan) throw new Error('Plan not found')
  
  // Get headcounts for the week
  const headcounts = await getDietHeadcountsForWeek(plan.week_start_date)
  
  // Update each meal
  const days: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  // Parse date directly to avoid timezone issues
  const [year, month, day] = plan.week_start_date.split('-').map(Number)
  const startDate = new Date(year, month - 1, day)
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    const headcount = headcounts.get(dateStr) || { eats_all: 0, vegetarian: 0, vegan: 0, total: 0 }
    
    // Update both brunch and dinner for this day
    await supabase
      .from('weekly_meal_plan_meals')
      .update({
        headcount_eats_all: headcount.eats_all,
        headcount_vegetarian: headcount.vegetarian,
        headcount_vegan: headcount.vegan
      })
      .eq('weekly_meal_plan_id', planId)
      .eq('day_of_week', days[i])
  }
}

// Rate Rule queries
export async function getRateRules(): Promise<RateRule[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('rate_rules')
    .select('*')
    .order('application_type', { ascending: true })
    .order('room_type', { ascending: true })
  
  if (error) throw error
  return data || []
}

export async function getRateRuleById(id: string): Promise<RateRule | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('rate_rules')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) return null
  return data
}

export async function createRateRule(
  rule: Omit<RateRule, 'id' | 'created_at' | 'updated_at'>
): Promise<RateRule> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('rate_rules')
    .insert(rule)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateRateRule(
  id: string,
  updates: Partial<Omit<RateRule, 'id' | 'created_at' | 'updated_at'>>
): Promise<RateRule> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('rate_rules')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function toggleRateRuleActive(id: string, isActive: boolean): Promise<RateRule> {
  return updateRateRule(id, { is_active: isActive })
}

// Resident Price Modifier queries
export async function getResidentPriceModifiers(): Promise<ResidentPriceModifier[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('resident_price_modifiers')
    .select('*')
    .order('min_nights', { ascending: true })
  
  if (error) throw error
  return data || []
}

export async function getResidentPriceModifierById(id: string): Promise<ResidentPriceModifier | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('resident_price_modifiers')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) return null
  return data
}

export async function createResidentPriceModifier(
  modifier: Omit<ResidentPriceModifier, 'id' | 'created_at' | 'updated_at'>
): Promise<ResidentPriceModifier> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('resident_price_modifiers')
    .insert(modifier)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateResidentPriceModifier(
  id: string,
  updates: Partial<Omit<ResidentPriceModifier, 'id' | 'created_at' | 'updated_at'>>
): Promise<ResidentPriceModifier> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('resident_price_modifiers')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function toggleResidentPriceModifierActive(id: string, isActive: boolean): Promise<ResidentPriceModifier> {
  return updateResidentPriceModifier(id, { is_active: isActive })
}

export async function getActiveResidentPriceModifierForNights(nights: number): Promise<ResidentPriceModifier | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
  .from('resident_price_modifiers')
  .select('*')
  .eq('is_active', true)
  .lte('min_nights', nights)
  .or(`max_nights.gte.${nights},max_nights.is.null`)
  .single()
  
  if (error) return null
  return data
}

// Resident Bill queries
export async function getResidentBills(): Promise<ResidentBill[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('resident_bills')
    .select(`
      *,
      resident:residents(id, name, email)
    `)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function getResidentBillsByResidentId(residentId: string): Promise<ResidentBill[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('resident_bills')
    .select('*')
    .eq('resident_id', residentId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function getResidentBillById(id: string): Promise<ResidentBill | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('resident_bills')
    .select(`
      *,
      resident:residents(id, name, email)
    `)
    .eq('id', id)
    .single()
  
  if (error) return null
  return data
}

export async function createResidentBill(
  bill: Omit<ResidentBill, 'id' | 'created_at' | 'updated_at' | 'resident'>
): Promise<ResidentBill> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('resident_bills')
    .insert(bill)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateResidentBill(
  id: string,
  updates: Partial<Omit<ResidentBill, 'id' | 'created_at' | 'updated_at' | 'resident'>>
): Promise<ResidentBill> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('resident_bills')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteResidentBill(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('resident_bills')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Scheduled Activity queries
export async function getScheduledActivities(): Promise<ScheduledActivity[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('scheduled_activities')
    .select('*')
    .order('date', { ascending: true })
    .order('start_time', { ascending: true })
  
  if (error) throw error
  return data || []
}

export async function getPublicActivitiesForNextDays(days: number = 7): Promise<ScheduledActivity[]> {
  const supabase = await createClient()
  // Use Costa Rica timezone for date calculations
  const TIMEZONE = 'America/Costa_Rica'
  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: TIMEZONE })
  const [year, month, day] = todayStr.split('-').map(Number)
  const todayDate = new Date(year, month - 1, day)
  const endDate = new Date(todayDate)
  endDate.setDate(todayDate.getDate() + days)
  const endDateStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`
  
  const { data, error } = await supabase
    .from('scheduled_activities')
    .select('*')
    .eq('is_public', true)
    .in('status', ['planned', 'confirmed'])
    .gte('date', todayStr)
    .lte('date', endDateStr)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true })
  
  if (error) throw error
  return data || []
}

export async function getScheduledActivityById(id: string): Promise<ScheduledActivity | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('scheduled_activities')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) return null
  return data
}

export async function createScheduledActivity(
  activity: Omit<ScheduledActivity, 'id' | 'created_at' | 'updated_at'>
): Promise<ScheduledActivity> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('scheduled_activities')
    .insert(activity)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateScheduledActivity(
  id: string,
  updates: Partial<Omit<ScheduledActivity, 'id' | 'created_at' | 'updated_at'>>
): Promise<ScheduledActivity> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('scheduled_activities')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteScheduledActivity(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('scheduled_activities')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Shopping List Queries
export async function getWeeklyMealPlansForShoppingList(): Promise<WeeklyMealPlan[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('weekly_meal_plans')
    .select('*')
    .order('week_start_date', { ascending: false })
    .limit(12)
  
  if (error) throw error
  return data || []
}

export async function getWeeklyMealPlanWithMealsForShoppingList(weeklyMealPlanId: string): Promise<WeeklyMealPlan | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('weekly_meal_plans')
    .select(`
      *,
      meals:weekly_meal_plan_meals(
        *,
        recipes:weekly_meal_plan_recipes(
          *,
          recipe:recipes(
            *,
            recipe_ingredients(
              *,
              ingredient:ingredients(*)
            )
          )
        )
      )
    `)
    .eq('id', weeklyMealPlanId)
    .single()
  
  if (error) return null
  return data
}

export async function getIngredientsForInventory(): Promise<Ingredient[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('ingredients')
    .select('*')
    .order('type')
    .order('name')
  
  if (error) throw error
  return data || []
}

export async function getShoppingRelevantIngredients(): Promise<Ingredient[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('ingredients')
    .select('*')
    .or('add_to_shopping_list_per_person.gt.0,add_to_shopping_list_per_week.gt.0')
    .order('type')
    .order('name')
  
  if (error) throw error
  return data || []
}

export async function updateIngredientStock(id: string, itemsInStock: number): Promise<Ingredient> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('ingredients')
    .update({ items_in_stock: itemsInStock, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function bulkUpdateIngredientStock(updates: { id: string; items_in_stock: number }[]): Promise<void> {
  const supabase = await createClient()
  
  for (const update of updates) {
    const { error } = await supabase
      .from('ingredients')
      .update({ items_in_stock: update.items_in_stock, updated_at: new Date().toISOString() })
      .eq('id', update.id)
    
    if (error) throw error
  }
}

export async function getActiveResidentsForDateRange(startDate: string, endDate: string): Promise<number> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('residents')
    .select('id')
    .in('status', ['checked_in', 'staying'])
    .lte('arrival_date', endDate)
    .gte('departure_date', startDate)
  
  if (error) throw error
  return data?.length || 0
}

// Get meals where prep_date (meal_date - prep_day_offset) falls within date range
// This requires fetching meals that might be served after endDate but prepped within range
export async function getMealsWithPrepDateInRange(
  startDate: string, 
  endDate: string,
  maxPrepDayOffset: number = 7
): Promise<WeeklyMealPlanMeal[]> {
  const supabase = await createClient()
  
  // Calculate the extended end date to capture meals with prep_day_offset
  // If endDate is May 10 and max offset is 7, we need meals up to May 17
  const [ey, em, ed] = endDate.split('-').map(Number)
  const extendedEnd = new Date(ey, em - 1, ed)
  extendedEnd.setDate(extendedEnd.getDate() + maxPrepDayOffset)
  const extendedEndStr = `${extendedEnd.getFullYear()}-${String(extendedEnd.getMonth() + 1).padStart(2, '0')}-${String(extendedEnd.getDate()).padStart(2, '0')}`
  
  const { data, error } = await supabase
    .from('weekly_meal_plan_meals')
    .select(`
      *,
      recipes:weekly_meal_plan_recipes(
        *,
        recipe:recipes(
          *,
          recipe_ingredients(
            *,
            ingredient:ingredients(*)
          )
        )
      )
    `)
    .gte('meal_date', startDate)
    .lte('meal_date', extendedEndStr)
    .order('meal_date')
  
  if (error) throw error
  return data || []
}
