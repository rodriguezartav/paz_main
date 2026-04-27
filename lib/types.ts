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
  whatsapp: string
  emergencyContact: string
  nationality: string
  gender: Gender
  age: number
  diet: Diet
  arrivalDate: string
  departureDate: string
  room: string
  bed: string
  status: ResidentStatus
  checkInCompleted: boolean
  releaseAccepted: boolean
  healthInsuranceConfirmed: boolean
  mediaReleaseAccepted: boolean
  orientationCompleted: boolean
  notes: string
}

export interface Payment {
  id: string
  residentId: string
  totalAmount: number
  pricePerNight: number
  depositAmount: number
  amountPaid: number
  balanceDue: number
  currency: string
  status: PaymentStatus
  method: PaymentMethod
  paymentDate: string
  proofUrl: string | null
  notes: string
}

// Ingredient Types
export type IngredientType = 'staple' | 'protein' | 'vegetable' | 'fruit' | 'condiment' | 'dairy' | 'cleaning' | 'other'
export type Measurement = 'kg' | 'unit' | 'ml' | 'tbsp'

export interface Ingredient {
  id: string
  name: string
  type: IngredientType
  measurement: Measurement
}

// Recipe Types
export interface RecipeIngredient {
  id: string
  recipeId: string
  ingredientId: string
  amount: number
  measurement: Measurement
}

export interface Recipe {
  id: string
  name: string
  description: string
  notes: string
  ingredients: RecipeIngredient[]
}
