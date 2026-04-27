import { createClient } from '@/lib/supabase/server'
import type { Resident, Payment, Ingredient, Recipe, RecipeIngredient, Building, Room, Bed, ResidentBed, ApplicationQuestion, Application, ApplicationAnswer, ApplicationSection, WeeklyMenuTemplate, WeeklyMenuTemplateMeal, WeeklyMenuTemplateMealRecipe, DayOfWeek, MealType } from '@/lib/types'

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
  
  // Get all rooms with beds
  const { data: rooms, error: roomsError } = await supabase
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
      // Default prep_day_offset: -1 for Wednesday and Sunday (prepped day before)
      const prepDayOffset = (day === 'wednesday' || day === 'sunday') ? -1 : 0
      
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
