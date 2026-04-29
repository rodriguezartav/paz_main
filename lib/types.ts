// Resident Types
export type Gender = 'female' | 'male'
export type Diet = 'eats_all' | 'vegetarian' | 'vegan'
export type ResidentStatus = 'upcoming' | 'checked_in' | 'staying' | 'checking_out_today' | 'checked_out' | 'cancelled'
export type PaymentStatus = 'unpaid' | 'deposit_paid' | 'partially_paid' | 'paid' | 'refunded'
export type PaymentMethod = 'cash' | 'sinpe' | 'bank_transfer' | 'paypal' | 'stripe' | 'other'

export interface Resident {
  id: string
  name: string
  email: string
  whatsapp: string | null
  emergency_contact: string | null
  nationality: string | null
  gender: Gender
  age: number | null
  diet: Diet
  arrival_date: string
  departure_date: string
  room: string | null
  bed: string | null
  status: ResidentStatus
  check_in_completed: boolean
  release_accepted: boolean
  health_insurance_confirmed: boolean
  media_release_accepted: boolean
  orientation_completed: boolean
  notes: string | null
  application_id: string | null
  created_at: string
  updated_at: string
  application?: Application
  current_bed?: {
    id: string
    bed: {
      id: string
      name: string
      room: {
        id: string
        name: string
        building: {
          id: string
          name: string
        } | null
      }
    }
  }[]
}

export interface Payment {
  id: string
  resident_id: string
  total_amount: number
  price_per_night: number
  deposit_amount: number
  amount_paid: number
  balance_due: number
  currency: string
  status: PaymentStatus
  method: PaymentMethod | null
  payment_date: string | null
  proof_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

// Ingredient Types
export type IngredientType = 'staple' | 'protein' | 'vegetable' | 'fruit' | 'condiment' | 'dairy' | 'cleaning' | 'roots' | 'other'
export type Measurement = 'kg' | 'g' | 'l' | 'ml' | 'unit' | 'tbsp'

export interface Ingredient {
  id: string
  name: string
  type: IngredientType
  measurement: Measurement
  created_at: string
  updated_at: string
}

// Recipe Types
export type MealType = 'brunch' | 'dinner'
export type RecipeType = 'salad' | 'sauce' | 'soup' | 'main' | 'side' | 'dessert'

export interface RecipeIngredient {
  id: string
  recipe_id: string
  ingredient_id: string
  amount: number
  measurement: Measurement
  created_at: string
  ingredient?: Ingredient
}

export interface Recipe {
  id: string
  name: string
  english_name: string | null
  description: string | null
  notes: string | null
  meal_type: MealType
  type: RecipeType | null
  suitable_for_vegetarian?: boolean
  suitable_for_vegan?: boolean
  created_at: string
  updated_at: string
  recipe_ingredients?: RecipeIngredient[]
}

// Helper type for resident with payment
export interface ResidentWithPayment {
  resident: Resident
  payment: Payment | null
}

// Building Types
export interface Building {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
  rooms?: Room[]
}

// Room and Bed Types
export type RoomType = 'private' | 'double' | 'triple' | 'quad'

export interface Room {
  id: string
  building_id: string | null
  name: string
  description: string | null
  is_private: boolean
  room_type: RoomType
  created_at: string
  updated_at: string
  beds?: Bed[]
  building?: Building
}

export interface Bed {
  id: string
  room_id: string
  name: string
  created_at: string
  updated_at: string
  room?: Room
  current_assignment?: ResidentBed | null
}

export interface ResidentBed {
  id: string
  resident_id: string
  bed_id: string
  assigned_at: string
  released_at: string | null
  is_active: boolean
  created_at: string
  resident?: Resident
  bed?: Bed
}

// Application Types
export type QuestionType = 'short_text' | 'long_text' | 'single_choice' | 'multiple_choice' | 'date' | 'number' | 'email' | 'phone' | 'checkbox' | 'agreement'
export type ApplicationStatus = 'pending' | 'reviewing' | 'accepted' | 'rejected' | 'waitlist' | 'needs_more_info'

export interface ApplicationQuestion {
  id: string
  section_key: string
  section_title: string
  section_intro: string | null
  question_text: string
  question_description: string | null
  question_type: QuestionType
  options: string[]
  required: boolean
  order_index: number
  active: boolean
  created_at: string
  updated_at: string
}

export interface Application {
  id: string
  applicant_name: string | null
  applicant_email: string | null
  applicant_phone: string | null
  status: ApplicationStatus
  submitted_at: string | null
  reviewed_at: string | null
  reviewer_notes: string | null
  internal_score: number | null
  created_at: string
  updated_at: string
  answers?: ApplicationAnswer[]
}

export interface ApplicationAnswer {
  id: string
  application_id: string
  question_id: string
  answer_value: string | string[] | number | boolean
  question_text_snapshot: string
  section_title_snapshot: string
  question_type_snapshot: string
  created_at: string
  updated_at: string
  question?: ApplicationQuestion
}

export interface ApplicationSection {
  key: string
  title: string
  intro: string | null
  questions: ApplicationQuestion[]
}

// Meal Planner Types
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
export type RecipeRole = 'main' | 'side' | 'salad' | 'sauce' | 'protein' | 'base' | 'vegetarian_alternative' | 'vegan_alternative' | 'extra'
export type ServingTarget = 'everyone' | 'eats_all' | 'vegetarian' | 'vegan' | 'vegetarian_and_vegan' | 'custom'

export interface WeeklyMenuTemplate {
  id: string
  name: string
  description: string | null
  active: boolean
  created_at: string
  updated_at: string
  meals?: WeeklyMenuTemplateMeal[]
}

export interface WeeklyMenuTemplateMeal {
  id: string
  weekly_menu_template_id: string
  day_of_week: DayOfWeek
  meal_type: MealType
  prep_day_offset: number
  order_index: number
  notes: string | null
  created_at: string
  updated_at: string
  recipes?: WeeklyMenuTemplateMealRecipe[]
}

export interface WeeklyMenuTemplateMealRecipe {
  id: string
  template_meal_id: string
  recipe_id: string
  recipe_role: RecipeRole
  serving_target: ServingTarget
  order_index: number
  notes: string | null
  created_at: string
  updated_at: string
  recipe?: Recipe
}

// Weekly Meal Plan Types (actual calendar weeks)
export interface WeeklyMealPlan {
  id: string
  week_start_date: string
  template_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
  template?: WeeklyMenuTemplate
  meals?: WeeklyMealPlanMeal[]
}

export interface WeeklyMealPlanMeal {
  id: string
  weekly_meal_plan_id: string
  day_of_week: DayOfWeek
  meal_type: MealType
  headcount_eats_all: number
  headcount_vegetarian: number
  headcount_vegan: number
  prep_day_offset: number
  notes: string | null
  created_at: string
  updated_at: string
  recipes?: WeeklyMealPlanRecipe[]
}

export interface WeeklyMealPlanRecipe {
  id: string
  meal_plan_meal_id: string
  recipe_id: string
  recipe_role: RecipeRole
  serving_target: ServingTarget
  order_index: number
  notes: string | null
  created_at: string
  updated_at: string
  recipe?: Recipe
}

export interface DietHeadcount {
  eats_all: number
  vegetarian: number
  vegan: number
  total: number
}
