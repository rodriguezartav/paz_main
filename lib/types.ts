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
  created_at: string
  updated_at: string
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
export type IngredientType = 'staple' | 'protein' | 'vegetable' | 'fruit' | 'condiment' | 'dairy' | 'cleaning' | 'other'
export type Measurement = 'kg' | 'unit' | 'ml' | 'tbsp'

export interface Ingredient {
  id: string
  name: string
  type: IngredientType
  measurement: Measurement
  created_at: string
  updated_at: string
}

// Recipe Types
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
  description: string | null
  notes: string | null
  created_at: string
  updated_at: string
  recipe_ingredients?: RecipeIngredient[]
}

// Helper type for resident with payment
export interface ResidentWithPayment {
  resident: Resident
  payment: Payment | null
}
