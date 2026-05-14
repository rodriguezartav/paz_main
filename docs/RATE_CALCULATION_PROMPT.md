# Rate Calculation System Prompt

Use this prompt to recreate the rate calculation logic in another v0.app project.

---

## Overview

This system calculates nightly rates for a residential/retreat center based on:
1. **Resident Type** - volunteer, resident, or retreat guest
2. **Length of Stay** - number of nights determines rate category
3. **Room Type** - quad, double, private, or any
4. **Price Modifiers** - adjustments based on stay duration (only for residents)

---

## Database Schema

### Table: `rate_rules`
Stores base nightly rates for each combination of application type and room type.

```sql
CREATE TABLE rate_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  application_type TEXT NOT NULL,  -- 'resident' | 'volunteer' | 'retreat'
  room_type TEXT NOT NULL,          -- 'quad' | 'double' | 'private' | 'any'
  base_nightly_rate DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Table: `resident_price_modifiers`
Stores price adjustments that apply based on length of stay (only for resident rates).

```sql
CREATE TABLE resident_price_modifiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  min_nights INTEGER NOT NULL,
  max_nights INTEGER,              -- NULL means no upper limit
  adjustment_type TEXT NOT NULL,   -- 'percentage' | 'fixed_amount'
  adjustment_value DECIMAL(10,2) NOT NULL,  -- negative = discount, positive = surcharge
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## TypeScript Types

```typescript
export type ResidentType = 'volunteer' | 'resident' | 'retreat'
export type RateApplicationType = 'resident' | 'volunteer' | 'retreat'
export type RateRoomType = 'quad' | 'double' | 'private' | 'any'
export type AdjustmentType = 'percentage' | 'fixed_amount'

export interface RateRule {
  id: string
  name: string
  application_type: RateApplicationType
  room_type: RateRoomType
  base_nightly_rate: number
  currency: string
  is_active: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export interface ResidentPriceModifier {
  id: string
  name: string
  min_nights: number
  max_nights: number | null
  adjustment_type: AdjustmentType
  adjustment_value: number
  is_active: boolean
  notes: string | null
  created_at: string
  updated_at: string
}
```

---

## Rate Calculation Logic

### Step 1: Determine Application Type

The application type is determined by the resident type AND length of stay:

```typescript
function determineApplicationType(
  residentType: ResidentType,
  nights: number
): RateApplicationType {
  // Volunteers ALWAYS use volunteer rates regardless of stay length
  if (residentType === 'volunteer') {
    return 'volunteer'
  }
  
  // For residents and retreat guests, determine based on stay length:
  // - Less than 8 nights = retreat rate
  // - 8 or more nights = resident rate
  if (nights < 8) {
    return 'retreat'
  }
  
  return 'resident'
}
```

**Key Rule**: The 8-night threshold determines whether someone pays retreat rates (short stay) or resident rates (longer stay).

### Step 2: Find Matching Rate Rule

Look up the base rate from the `rate_rules` table:

```typescript
function findMatchingRateRule(
  rates: RateRule[],
  applicationType: RateApplicationType,
  roomType: RateRoomType
): RateRule | null {
  // First, try exact match for both application type AND room type
  const exactMatch = rates.find(
    r => r.is_active && 
    r.application_type === applicationType && 
    r.room_type === roomType
  )
  
  if (exactMatch) return exactMatch
  
  // Fallback: find a rate with room_type = 'any' for this application type
  const anyRoomMatch = rates.find(
    r => r.is_active && 
    r.application_type === applicationType && 
    r.room_type === 'any'
  )
  
  return anyRoomMatch || null
}
```

### Step 3: Apply Price Modifier (Residents Only)

Price modifiers only apply to the `resident` application type:

```typescript
function findApplicableModifier(
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
    
    // Check if nights falls within this modifier's range
    if (nights >= minNights && (maxNights === null || nights <= maxNights)) {
      return modifier
    }
  }
  
  return null
}
```

### Step 4: Calculate Adjustment Amount

```typescript
function calculateAdjustment(
  baseRate: number,
  modifier: ResidentPriceModifier
): number {
  if (modifier.adjustment_type === 'percentage') {
    // Percentage: e.g., -10 means 10% discount
    return baseRate * (modifier.adjustment_value / 100)
  }
  // Fixed amount: directly add/subtract the value
  return modifier.adjustment_value
}
```

### Step 5: Calculate Final Rate

```typescript
const finalNightlyRate = baseRate + adjustmentAmount
const totalCost = finalNightlyRate * nights
```

---

## Complete Rate Calculator Function

```typescript
interface RateCalculationInput {
  nights: number
  roomType: RateRoomType
  residentType: ResidentType
}

interface RateCalculationResult {
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

function calculateRate(
  input: RateCalculationInput,
  rates: RateRule[],
  modifiers: ResidentPriceModifier[]
): RateCalculationResult | { error: true; message: string } {
  const { nights, roomType, residentType } = input
  
  // Validate input
  if (nights <= 0 || !roomType || !residentType) {
    return { error: true, message: 'Invalid input' }
  }
  
  // Step 1: Determine application type
  const applicationType = determineApplicationType(residentType, nights)
  
  // Step 2: Find matching rate rule
  const rateRule = findMatchingRateRule(rates, applicationType, roomType)
  
  if (!rateRule) {
    return { error: true, message: `No rate found for ${applicationType} - ${roomType}` }
  }
  
  const baseRate = rateRule.base_nightly_rate
  
  // Step 3: Find applicable modifier (only for residents)
  const modifier = findApplicableModifier(modifiers, nights, applicationType)
  
  // Step 4: Calculate adjustment
  let finalRate = baseRate
  let adjustmentAmount = 0
  let modifierDescription: string | null = null
  
  if (modifier) {
    adjustmentAmount = calculateAdjustment(baseRate, modifier)
    finalRate = baseRate + adjustmentAmount
    
    const adjustmentStr = modifier.adjustment_type === 'percentage'
      ? `${modifier.adjustment_value}%`
      : `$${Math.abs(modifier.adjustment_value).toFixed(2)}`
    
    modifierDescription = `${modifier.name}: ${adjustmentStr} ${
      modifier.adjustment_value < 0 ? 'discount' : 'surcharge'
    }`
  }
  
  // Step 5: Calculate total
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
```

---

## Using in an Application Form

To integrate rate calculation in an application form:

1. **Collect Required Inputs**:
   - Arrival date (date picker)
   - Departure date (date picker)
   - Room preference (select: quad/double/private)
   - Application type (select: volunteer/resident/retreat)

2. **Calculate Nights**:
```typescript
const arrival = new Date(arrivalDate)
const departure = new Date(departureDate)
const nights = Math.ceil((departure.getTime() - arrival.getTime()) / (1000 * 60 * 60 * 24))
```

3. **Map Form Values to Types**:
```typescript
// Map application type answer to ResidentType
let residentType: ResidentType = 'resident'
const typeStr = applicationType.toLowerCase()
if (typeStr.includes('volunteer')) {
  residentType = 'volunteer'
} else if (typeStr.includes('retreat')) {
  residentType = 'retreat'
}

// Map room preference to RateRoomType
let roomType: RateRoomType = 'double'
const roomStr = roomPreference.toLowerCase()
if (roomStr.includes('private')) {
  roomType = 'private'
} else if (roomStr.includes('quad')) {
  roomType = 'quad'
} else if (roomStr.includes('double')) {
  roomType = 'double'
}
```

4. **Display Rate Breakdown**:
```tsx
{rateCalculation && !isRateCalculationError(rateCalculation.result) && (
  <Card className="border-primary/30 bg-primary/5">
    <CardContent className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <DollarSign className="h-5 w-5 text-primary" />
        <span className="font-semibold">Estimated Cost</span>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Rate type:</span>
          <span className="font-medium capitalize">{result.applicationType}</span>
        </div>
        <div className="flex justify-between">
          <span>Base rate:</span>
          <span>${result.baseRate}/night</span>
        </div>
        {result.modifierDescription && (
          <div className="flex justify-between text-muted-foreground">
            <span>{result.modifierDescription}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Final rate:</span>
          <span>${result.finalRate}/night</span>
        </div>
        <div className="flex justify-between border-t pt-2 font-semibold">
          <span>Total ({nights} nights):</span>
          <span>${result.totalCost}</span>
        </div>
      </div>
    </CardContent>
  </Card>
)}
```

---

## Example Rate Configuration

### Rate Rules
| Application Type | Room Type | Base Rate |
|------------------|-----------|-----------|
| retreat | quad | $75/night |
| retreat | double | $95/night |
| retreat | private | $125/night |
| resident | quad | $45/night |
| resident | double | $55/night |
| resident | private | $75/night |
| volunteer | any | $0/night |

### Price Modifiers (Residents Only)
| Name | Min Nights | Max Nights | Adjustment |
|------|------------|------------|------------|
| Short stay | 8 | 13 | +$5 fixed |
| Standard | 14 | 29 | 0% |
| Monthly discount | 30 | 59 | -10% |
| Long-term discount | 60 | null | -15% |

---

## Key Business Rules Summary

1. **Volunteers** always pay volunteer rates (typically $0) regardless of stay length
2. **Stays < 8 nights** automatically get retreat rates (short-term, higher per-night)
3. **Stays >= 8 nights** get resident rates (long-term, lower per-night)
4. **Price modifiers** only apply to resident rates and can provide discounts for longer stays
5. **Room type fallback**: If no exact room type match, look for `any` room type rate
6. **Modifiers can be**: percentage-based or fixed amounts, positive (surcharge) or negative (discount)
