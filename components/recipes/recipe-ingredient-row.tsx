'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Ingredient, Measurement } from '@/lib/types'
import { X } from 'lucide-react'

interface RecipeIngredientRowProps {
  ingredients: Ingredient[]
  selectedIngredientId: string
  amount: number
  measurement: Measurement
  onIngredientChange: (ingredientId: string) => void
  onAmountChange: (amount: number) => void
  onMeasurementChange: (measurement: Measurement) => void
  onRemove: () => void
}

const measurements: { value: Measurement; label: string }[] = [
  { value: 'kg', label: 'kg' },
  { value: 'unit', label: 'unit' },
  { value: 'ml', label: 'ml' },
  { value: 'tbsp', label: 'tbsp' }
]

export function RecipeIngredientRow({
  ingredients,
  selectedIngredientId,
  amount,
  measurement,
  onIngredientChange,
  onAmountChange,
  onMeasurementChange,
  onRemove
}: RecipeIngredientRowProps) {
  return (
    <div className="flex items-center gap-2">
      <Select value={selectedIngredientId} onValueChange={onIngredientChange}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="Select ingredient" />
        </SelectTrigger>
        <SelectContent>
          {ingredients.map((ingredient) => (
            <SelectItem key={ingredient.id} value={ingredient.id}>
              {ingredient.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="number"
        step="0.1"
        min="0"
        value={amount}
        onChange={(e) => onAmountChange(parseFloat(e.target.value) || 0)}
        className="w-20"
        placeholder="0"
      />
      <Select value={measurement} onValueChange={onMeasurementChange}>
        <SelectTrigger className="w-24">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {measurements.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="ghost" size="icon" onClick={onRemove}>
        <X className="h-4 w-4" />
        <span className="sr-only">Remove ingredient</span>
      </Button>
    </div>
  )
}
