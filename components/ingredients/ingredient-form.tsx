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
  onSave: (ingredient: Omit<Ingredient, 'id' | 'created_at' | 'updated_at'> & { id?: string }) => void
  isLoading?: boolean
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

export function IngredientForm({ open, onOpenChange, ingredient, onSave, isLoading }: IngredientFormProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<IngredientType>('staple')
  const [measurement, setMeasurement] = useState<Measurement>('kg')
  const [perPerson, setPerPerson] = useState<string>('')
  const [perWeek, setPerWeek] = useState<string>('')
  const [inStock, setInStock] = useState<string>('')

  const isEditing = !!ingredient

  useEffect(() => {
    if (ingredient) {
      setName(ingredient.name)
      setType(ingredient.type)
      setMeasurement(ingredient.measurement)
      setPerPerson(ingredient.add_to_shopping_list_per_person?.toString() || '')
      setPerWeek(ingredient.add_to_shopping_list_per_week?.toString() || '')
      setInStock(ingredient.items_in_stock?.toString() || '')
    } else {
      setName('')
      setType('staple')
      setMeasurement('kg')
      setPerPerson('')
      setPerWeek('')
      setInStock('')
    }
  }, [ingredient])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      id: ingredient?.id,
      name,
      type,
      measurement,
      add_to_shopping_list_per_person: perPerson ? parseFloat(perPerson) : null,
      add_to_shopping_list_per_week: perWeek ? parseFloat(perWeek) : null,
      items_in_stock: inStock ? parseFloat(inStock) : null
    })
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
          
          <div className="border-t pt-4 mt-4">
            <p className="text-sm font-medium text-foreground mb-3">Shopping List Settings</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="perPerson">Per Person/Day</Label>
                <Input
                  id="perPerson"
                  type="number"
                  step="0.001"
                  min="0"
                  value={perPerson}
                  onChange={(e) => setPerPerson(e.target.value)}
                  placeholder="0.00"
                />
                <p className="text-xs text-muted-foreground">Amount needed per person per day</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="perWeek">Per Week (fixed)</Label>
                <Input
                  id="perWeek"
                  type="number"
                  step="0.001"
                  min="0"
                  value={perWeek}
                  onChange={(e) => setPerWeek(e.target.value)}
                  placeholder="0.00"
                />
                <p className="text-xs text-muted-foreground">Fixed weekly amount</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="inStock">Items in Stock</Label>
            <Input
              id="inStock"
              type="number"
              step="0.001"
              min="0"
              value={inStock}
              onChange={(e) => setInStock(e.target.value)}
              placeholder="0.00"
            />
            <p className="text-xs text-muted-foreground">Current inventory count</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Ingredient'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
