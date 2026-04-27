import type { Resident, Payment, Ingredient, Recipe, RecipeIngredient } from './types'

// Sample Residents
export const residents: Resident[] = [
  {
    id: '1',
    name: 'Sofia Martinez',
    email: 'sofia@email.com',
    whatsapp: '+506 8888-1111',
    emergencyContact: 'Maria Martinez +506 8888-2222',
    nationality: 'Costa Rica',
    gender: 'female',
    age: 28,
    diet: 'vegetarian',
    arrivalDate: '2026-04-20',
    departureDate: '2026-04-30',
    room: 'Ceiba',
    bed: 'A',
    status: 'staying',
    checkInCompleted: true,
    releaseAccepted: true,
    healthInsuranceConfirmed: true,
    mediaReleaseAccepted: true,
    orientationCompleted: true,
    notes: 'Yoga teacher, early riser'
  },
  {
    id: '2',
    name: 'Marcus Thompson',
    email: 'marcus@email.com',
    whatsapp: '+1 555-0123',
    emergencyContact: 'Jane Thompson +1 555-0124',
    nationality: 'United States',
    gender: 'male',
    age: 35,
    diet: 'eats_all',
    arrivalDate: '2026-04-25',
    departureDate: '2026-05-05',
    room: 'Almendro',
    bed: 'B',
    status: 'checked_in',
    checkInCompleted: true,
    releaseAccepted: true,
    healthInsuranceConfirmed: true,
    mediaReleaseAccepted: true,
    orientationCompleted: false,
    notes: 'Photographer, interested in wildlife'
  },
  {
    id: '3',
    name: 'Emma Lindqvist',
    email: 'emma@email.com',
    whatsapp: '+46 70-123-4567',
    emergencyContact: 'Lars Lindqvist +46 70-987-6543',
    nationality: 'Sweden',
    gender: 'female',
    age: 42,
    diet: 'vegan',
    arrivalDate: '2026-04-28',
    departureDate: '2026-05-10',
    room: 'Guapinol',
    bed: 'A',
    status: 'upcoming',
    checkInCompleted: false,
    releaseAccepted: false,
    healthInsuranceConfirmed: false,
    mediaReleaseAccepted: false,
    orientationCompleted: false,
    notes: 'Arriving by boat from Drake Bay'
  },
  {
    id: '4',
    name: 'Carlos Mendoza',
    email: 'carlos@email.com',
    whatsapp: '+52 55-1234-5678',
    emergencyContact: 'Ana Mendoza +52 55-8765-4321',
    nationality: 'Mexico',
    gender: 'male',
    age: 31,
    diet: 'eats_all',
    arrivalDate: '2026-04-15',
    departureDate: '2026-04-27',
    room: 'Ceiba',
    bed: 'B',
    status: 'checking_out_today',
    checkInCompleted: true,
    releaseAccepted: true,
    healthInsuranceConfirmed: true,
    mediaReleaseAccepted: true,
    orientationCompleted: true,
    notes: 'Marine biologist, helped with reef survey'
  },
  {
    id: '5',
    name: 'Yuki Tanaka',
    email: 'yuki@email.com',
    whatsapp: '+81 90-1234-5678',
    emergencyContact: 'Kenji Tanaka +81 90-8765-4321',
    nationality: 'Japan',
    gender: 'female',
    age: 26,
    diet: 'vegetarian',
    arrivalDate: '2026-05-01',
    departureDate: '2026-05-15',
    room: 'Almendro',
    bed: 'A',
    status: 'upcoming',
    checkInCompleted: false,
    releaseAccepted: false,
    healthInsuranceConfirmed: false,
    mediaReleaseAccepted: false,
    orientationCompleted: false,
    notes: 'Artist, wants quiet space for painting'
  },
  {
    id: '6',
    name: 'Hans Mueller',
    email: 'hans@email.com',
    whatsapp: '+49 170-1234567',
    emergencyContact: 'Greta Mueller +49 170-7654321',
    nationality: 'Germany',
    gender: 'male',
    age: 55,
    diet: 'eats_all',
    arrivalDate: '2026-04-10',
    departureDate: '2026-04-20',
    room: 'Guapinol',
    bed: 'B',
    status: 'checked_out',
    checkInCompleted: true,
    releaseAccepted: true,
    healthInsuranceConfirmed: true,
    mediaReleaseAccepted: true,
    orientationCompleted: true,
    notes: 'Returned guest, third visit'
  }
]

// Sample Payments
export const payments: Payment[] = [
  {
    id: '1',
    residentId: '1',
    totalAmount: 500,
    pricePerNight: 50,
    depositAmount: 150,
    amountPaid: 500,
    balanceDue: 0,
    currency: 'USD',
    status: 'paid',
    method: 'paypal',
    paymentDate: '2026-04-18',
    proofUrl: null,
    notes: 'Full payment received before arrival'
  },
  {
    id: '2',
    residentId: '2',
    totalAmount: 550,
    pricePerNight: 50,
    depositAmount: 150,
    amountPaid: 150,
    balanceDue: 400,
    currency: 'USD',
    status: 'deposit_paid',
    method: 'stripe',
    paymentDate: '2026-04-20',
    proofUrl: null,
    notes: 'Will pay remainder in cash on site'
  },
  {
    id: '3',
    residentId: '3',
    totalAmount: 600,
    pricePerNight: 50,
    depositAmount: 180,
    amountPaid: 0,
    balanceDue: 600,
    currency: 'USD',
    status: 'unpaid',
    method: 'bank_transfer',
    paymentDate: '',
    proofUrl: null,
    notes: 'Awaiting bank transfer confirmation'
  },
  {
    id: '4',
    residentId: '4',
    totalAmount: 295000,
    pricePerNight: 25000,
    depositAmount: 75000,
    amountPaid: 295000,
    balanceDue: 0,
    currency: 'CRC',
    status: 'paid',
    method: 'sinpe',
    paymentDate: '2026-04-14',
    proofUrl: null,
    notes: 'Paid in colones via SINPE'
  },
  {
    id: '5',
    residentId: '5',
    totalAmount: 700,
    pricePerNight: 50,
    depositAmount: 210,
    amountPaid: 350,
    balanceDue: 350,
    currency: 'USD',
    status: 'partially_paid',
    method: 'paypal',
    paymentDate: '2026-04-25',
    proofUrl: null,
    notes: 'Half paid, rest on arrival'
  },
  {
    id: '6',
    residentId: '6',
    totalAmount: 500,
    pricePerNight: 50,
    depositAmount: 150,
    amountPaid: 500,
    balanceDue: 0,
    currency: 'USD',
    status: 'paid',
    method: 'cash',
    paymentDate: '2026-04-10',
    proofUrl: null,
    notes: 'Returning guest discount applied'
  }
]

// Sample Ingredients
export const ingredients: Ingredient[] = [
  { id: '1', name: 'Rice', type: 'staple', measurement: 'kg' },
  { id: '2', name: 'Beans', type: 'staple', measurement: 'kg' },
  { id: '3', name: 'Lentils', type: 'staple', measurement: 'kg' },
  { id: '4', name: 'Eggs', type: 'protein', measurement: 'unit' },
  { id: '5', name: 'Chicken', type: 'protein', measurement: 'kg' },
  { id: '6', name: 'Fish', type: 'protein', measurement: 'kg' },
  { id: '7', name: 'Cabbage', type: 'vegetable', measurement: 'unit' },
  { id: '8', name: 'Carrots', type: 'vegetable', measurement: 'kg' },
  { id: '9', name: 'Tomato', type: 'vegetable', measurement: 'kg' },
  { id: '10', name: 'Onion', type: 'vegetable', measurement: 'unit' },
  { id: '11', name: 'Cucumber', type: 'vegetable', measurement: 'unit' },
  { id: '12', name: 'Plantain', type: 'fruit', measurement: 'unit' },
  { id: '13', name: 'Yucca', type: 'staple', measurement: 'kg' },
  { id: '14', name: 'Papaya', type: 'fruit', measurement: 'unit' },
  { id: '15', name: 'Banana', type: 'fruit', measurement: 'unit' },
  { id: '16', name: 'Coffee', type: 'staple', measurement: 'kg' },
  { id: '17', name: 'Oil', type: 'condiment', measurement: 'ml' },
  { id: '18', name: 'Salt', type: 'condiment', measurement: 'kg' },
  { id: '19', name: 'Garlic', type: 'condiment', measurement: 'tbsp' },
  { id: '20', name: 'Garbage bags', type: 'cleaning', measurement: 'unit' },
  { id: '21', name: 'Dish soap', type: 'cleaning', measurement: 'ml' }
]

// Sample Recipes
export const recipes: Recipe[] = [
  {
    id: '1',
    name: 'Rice and Beans',
    description: 'Classic Costa Rican gallo pinto style rice and beans',
    notes: 'Cook beans the night before for best results',
    ingredients: [
      { id: '1-1', recipeId: '1', ingredientId: '1', amount: 1, measurement: 'kg' },
      { id: '1-2', recipeId: '1', ingredientId: '2', amount: 0.7, measurement: 'kg' },
      { id: '1-3', recipeId: '1', ingredientId: '10', amount: 2, measurement: 'unit' },
      { id: '1-4', recipeId: '1', ingredientId: '19', amount: 2, measurement: 'tbsp' },
      { id: '1-5', recipeId: '1', ingredientId: '17', amount: 100, measurement: 'ml' },
      { id: '1-6', recipeId: '1', ingredientId: '18', amount: 2, measurement: 'tbsp' }
    ]
  },
  {
    id: '2',
    name: 'Chicken with Vegetables',
    description: 'Hearty chicken stew with garden vegetables',
    notes: 'Can substitute tofu for vegetarian option',
    ingredients: [
      { id: '2-1', recipeId: '2', ingredientId: '5', amount: 2, measurement: 'kg' },
      { id: '2-2', recipeId: '2', ingredientId: '8', amount: 1, measurement: 'kg' },
      { id: '2-3', recipeId: '2', ingredientId: '10', amount: 2, measurement: 'unit' },
      { id: '2-4', recipeId: '2', ingredientId: '9', amount: 1, measurement: 'kg' },
      { id: '2-5', recipeId: '2', ingredientId: '19', amount: 2, measurement: 'tbsp' },
      { id: '2-6', recipeId: '2', ingredientId: '17', amount: 100, measurement: 'ml' },
      { id: '2-7', recipeId: '2', ingredientId: '18', amount: 2, measurement: 'tbsp' }
    ]
  },
  {
    id: '3',
    name: 'Lentil Stew',
    description: 'Nutritious vegan lentil stew',
    notes: 'Great protein source for vegan residents',
    ingredients: [
      { id: '3-1', recipeId: '3', ingredientId: '3', amount: 1, measurement: 'kg' },
      { id: '3-2', recipeId: '3', ingredientId: '8', amount: 1, measurement: 'kg' },
      { id: '3-3', recipeId: '3', ingredientId: '10', amount: 2, measurement: 'unit' },
      { id: '3-4', recipeId: '3', ingredientId: '19', amount: 2, measurement: 'tbsp' },
      { id: '3-5', recipeId: '3', ingredientId: '9', amount: 1, measurement: 'kg' },
      { id: '3-6', recipeId: '3', ingredientId: '17', amount: 80, measurement: 'ml' },
      { id: '3-7', recipeId: '3', ingredientId: '18', amount: 2, measurement: 'tbsp' }
    ]
  },
  {
    id: '4',
    name: 'Cabbage Cucumber Salad',
    description: 'Fresh and crunchy garden salad',
    notes: 'Add lime juice for extra freshness',
    ingredients: [
      { id: '4-1', recipeId: '4', ingredientId: '7', amount: 1, measurement: 'unit' },
      { id: '4-2', recipeId: '4', ingredientId: '11', amount: 2, measurement: 'unit' },
      { id: '4-3', recipeId: '4', ingredientId: '18', amount: 1, measurement: 'tbsp' },
      { id: '4-4', recipeId: '4', ingredientId: '17', amount: 50, measurement: 'ml' }
    ]
  },
  {
    id: '5',
    name: 'Vegetable Soup',
    description: 'Warm and comforting root vegetable soup',
    notes: 'Serve with fresh bread if available',
    ingredients: [
      { id: '5-1', recipeId: '5', ingredientId: '13', amount: 1, measurement: 'kg' },
      { id: '5-2', recipeId: '5', ingredientId: '8', amount: 1, measurement: 'kg' },
      { id: '5-3', recipeId: '5', ingredientId: '10', amount: 2, measurement: 'unit' },
      { id: '5-4', recipeId: '5', ingredientId: '19', amount: 1, measurement: 'tbsp' },
      { id: '5-5', recipeId: '5', ingredientId: '18', amount: 2, measurement: 'tbsp' }
    ]
  },
  {
    id: '6',
    name: 'Eggs and Plantains',
    description: 'Traditional breakfast with fried plantains and eggs',
    notes: 'Use ripe plantains for sweeter flavor',
    ingredients: [
      { id: '6-1', recipeId: '6', ingredientId: '4', amount: 12, measurement: 'unit' },
      { id: '6-2', recipeId: '6', ingredientId: '12', amount: 8, measurement: 'unit' },
      { id: '6-3', recipeId: '6', ingredientId: '17', amount: 50, measurement: 'ml' },
      { id: '6-4', recipeId: '6', ingredientId: '18', amount: 1, measurement: 'tbsp' }
    ]
  },
  {
    id: '7',
    name: 'Fruit Plate',
    description: 'Fresh tropical fruit selection',
    notes: 'Best served at breakfast',
    ingredients: [
      { id: '7-1', recipeId: '7', ingredientId: '14', amount: 2, measurement: 'unit' },
      { id: '7-2', recipeId: '7', ingredientId: '15', amount: 12, measurement: 'unit' }
    ]
  },
  {
    id: '8',
    name: 'Fish with Rice',
    description: 'Fresh catch served over seasoned rice',
    notes: 'Depends on daily catch availability',
    ingredients: [
      { id: '8-1', recipeId: '8', ingredientId: '6', amount: 2, measurement: 'kg' },
      { id: '8-2', recipeId: '8', ingredientId: '1', amount: 1, measurement: 'kg' },
      { id: '8-3', recipeId: '8', ingredientId: '19', amount: 2, measurement: 'tbsp' },
      { id: '8-4', recipeId: '8', ingredientId: '17', amount: 80, measurement: 'ml' },
      { id: '8-5', recipeId: '8', ingredientId: '18', amount: 2, measurement: 'tbsp' }
    ]
  }
]

// Helper function to get resident with payment
export function getResidentWithPayment(residentId: string) {
  const resident = residents.find(r => r.id === residentId)
  const payment = payments.find(p => p.residentId === residentId)
  return { resident, payment }
}

// Helper function to get ingredient by ID
export function getIngredientById(ingredientId: string) {
  return ingredients.find(i => i.id === ingredientId)
}

// Helper function to calculate nights
export function calculateNights(arrivalDate: string, departureDate: string): number {
  const arrival = new Date(arrivalDate)
  const departure = new Date(departureDate)
  const diffTime = Math.abs(departure.getTime() - arrival.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}
