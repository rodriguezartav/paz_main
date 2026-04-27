'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Ingredient, IngredientType, Measurement } from '@/lib/types'

interface IngredientFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ingredient?: Ingredient | null
  onSave: (ingredient: Omit<Ingredient, 'id'> & { id?: string }) => void
}

const ingredientTypes: { value: IngredientType; label: string }[] = [
  { value: 'staple', label: 'Staple' },
  { value: 'protein', label: 'Protein' },
  { value: 'vegetable', label: 'Vegetable' },
  { value: 'fruit', label: 'Fruit' },
  { value: 'condiment', label: 'Condiment' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'cleaning', label: 'Cleaning / Kitchen Supply' },
  { value: 'other', label: 'Other' }
]

const measurements: { value: Measurement; label: string }[] = [
  { value: 'kg', label: 'kg' },
  { value: 'unit', label: 'unit' },
  { value: 'ml', label: 'ml' },
  { value: 'tbsp', label: 'tbsp' }
]

export function IngredientForm({ open, onOpenChange, ingredient, onSave }: IngredientFormProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<IngredientType>('staple')
  const [measurement, setMeasurement] = useState<Measurement>('kg')

  const isEditing = !!ingredient

  useEffect(() => {
    if (ingredient) {
      setName(ingredient.name)
      setType(ingredient.type)
      setMeasurement(ingredient.measurement)
    } else {
      setName('')
      setType('staple')
      setMeasurement('kg')
    }
  }, [ingredient])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      id: ingredient?.id,
      name,
      type,
      measurement
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {isEditing ? 'Edit Ingredient' : 'Add Ingredient'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Ingredient Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Rice, Tomato, Chicken"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={(value: IngredientType) => setType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {ingredientTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="measurement">Measurement</Label>
            <Select value={measurement} onValueChange={(value: Measurement) => setMeasurement(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select measurement" />
              </SelectTrigger>
              <SelectContent>
                {measurements.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Save Changes' : 'Add Ingredient'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
