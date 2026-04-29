import type { RateRule, ResidentPriceModifier, RateApplicationType, RateRoomType, ResidentType } from '@/lib/types'

export interface RateCalculationInput {
  nights: number
  roomType: RateRoomType
  residentType: ResidentType  // 'resident' | 'volunteer' | 'retreat'
}

export interface RateCalculationResult {
  applicationType: RateApplicationType
  roomType: RateRoomType
  baseRate: number
  finalRate: number
  totalCost: number
  nights: number
  modifier: ResidentPriceModifier | null
  modifierDescription: string | null
  rateName: string
  rateRule: RateRule | null
  breakdown: {
    baseNightlyRate: number
    adjustmentType: 'percentage' | 'fixed_amount' | null
    adjustmentValue: number | null
    adjustmentAmount: number
    finalNightlyRate: number
    nights: number
    totalCost: number
  }
}

export interface RateCalculationError {
  error: true
  message: string
  code: 'NO_RATE_FOUND' | 'INVALID_INPUT'
}

/**
 * Determines the application type based on resident type and length of stay
 * - Volunteers always use volunteer rates
 * - Stays < 8 nights use retreat rates
 * - Stays >= 8 nights use resident rates
 */
export function determineApplicationType(
  residentType: ResidentType,
  nights: number
): RateApplicationType {
  // Volunteers always use volunteer rates regardless of stay length
  if (residentType === 'volunteer') {
    return 'volunteer'
  }
  
  // For residents and retreat guests, determine based on stay length
  // Less than 8 nights = retreat rate
  // 8+ nights = resident rate
  if (nights < 8) {
    return 'retreat'
  }
  
  return 'resident'
}

/**
 * Finds the matching rate rule based on application type and room type
 */
export function findMatchingRateRule(
  rates: RateRule[],
  applicationType: RateApplicationType,
  roomType: RateRoomType
): RateRule | null {
  // First try to find an exact match for both application type and room type
  const exactMatch = rates.find(
    r => r.is_active && 
    r.application_type === applicationType && 
    r.room_type === roomType
  )
  
  if (exactMatch) return exactMatch
  
  // Try to find a rate with 'any' room type for this application type
  const anyRoomMatch = rates.find(
    r => r.is_active && 
    r.application_type === applicationType && 
    r.room_type === 'any'
  )
  
  return anyRoomMatch || null
}

/**
 * Finds the applicable price modifier based on number of nights
 * Only applies to resident application type
 */
export function findApplicableModifier(
  modifiers: ResidentPriceModifier[],
  nights: number,
  applicationType: RateApplicationType
): ResidentPriceModifier | null {
  // Modifiers only apply to resident rates (8+ nights)
  if (applicationType !== 'resident') {
    return null
  }
  
  // Find an active modifier that covers this number of nights
  const activeModifiers = modifiers.filter(m => m.is_active)
  
  for (const modifier of activeModifiers) {
    const minNights = modifier.min_nights
    const maxNights = modifier.max_nights
    
    if (nights >= minNights && (maxNights === null || nights <= maxNights)) {
      return modifier
    }
  }
  
  return null
}

/**
 * Calculates the adjustment amount based on modifier settings
 */
export function calculateAdjustment(
  baseRate: number,
  modifier: ResidentPriceModifier
): number {
  if (modifier.adjustment_type === 'percentage') {
    return baseRate * (modifier.adjustment_value / 100)
  }
  return modifier.adjustment_value
}

/**
 * Main rate calculation function
 * Returns complete rate breakdown including base rate, modifiers, and totals
 */
export function calculateRate(
  input: RateCalculationInput,
  rates: RateRule[],
  modifiers: ResidentPriceModifier[]
): RateCalculationResult | RateCalculationError {
  const { nights, roomType, residentType } = input
  
  // Validate input
  if (nights <= 0 || !roomType || !residentType) {
    return {
      error: true,
      message: 'Invalid input: nights must be positive, and room/resident type must be specified',
      code: 'INVALID_INPUT'
    }
  }
  
  // Determine application type based on resident type and stay length
  const applicationType = determineApplicationType(residentType, nights)
  
  // Find matching rate rule
  const rateRule = findMatchingRateRule(rates, applicationType, roomType)
  
  if (!rateRule) {
    return {
      error: true,
      message: `No active rate found for ${applicationType} - ${roomType} room`,
      code: 'NO_RATE_FOUND'
    }
  }
  
  const baseRate = rateRule.base_nightly_rate
  
  // Find applicable modifier (only for resident rates)
  const modifier = findApplicableModifier(modifiers, nights, applicationType)
  
  let finalRate = baseRate
  let adjustmentAmount = 0
  let modifierDescription: string | null = null
  
  if (modifier) {
    adjustmentAmount = calculateAdjustment(baseRate, modifier)
    finalRate = baseRate + adjustmentAmount
    
    const adjustmentStr = modifier.adjustment_type === 'percentage'
      ? `${modifier.adjustment_value}%`
      : `$${Math.abs(modifier.adjustment_value).toFixed(2)}`
    
    modifierDescription = `${modifier.name}: ${adjustmentStr} ${modifier.adjustment_value < 0 ? 'discount' : 'surcharge'}`
  }
  
  const totalCost = finalRate * nights
  
  return {
    applicationType,
    roomType,
    baseRate,
    finalRate,
    totalCost,
    nights,
    modifier,
    modifierDescription,
    rateName: rateRule.name,
    rateRule,
    breakdown: {
      baseNightlyRate: baseRate,
      adjustmentType: modifier?.adjustment_type || null,
      adjustmentValue: modifier?.adjustment_value || null,
      adjustmentAmount,
      finalNightlyRate: finalRate,
      nights,
      totalCost
    }
  }
}

/**
 * Helper to check if a calculation result is an error
 */
export function isRateCalculationError(
  result: RateCalculationResult | RateCalculationError
): result is RateCalculationError {
  return 'error' in result && result.error === true
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount)
}
