'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { IngredientCard } from '@/components/ingredients/ingredient-card'
import { IngredientForm } from '@/components/ingredients/ingredient-form'
import { ingredients as initialIngredients } from '@/lib/data'
import type { Ingredient } from '@/lib/types'
import { Plus } from 'lucide-react'

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialIngredients)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null)

  const handleEdit = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient)
    setIsFormOpen(true)
  }

  const handleAddNew = () => {
    setEditingIngredient(null)
    setIsFormOpen(true)
  }

  const handleSave = (data: Omit<Ingredient, 'id'> & { id?: string }) => {
    if (data.id) {
      // Update existing
      setIngredients(prev => 
        prev.map(i => i.id === data.id ? { ...i, ...data } as Ingredient : i)
      )
    } else {
      // Add new
      const newIngredient: Ingredient = {
        ...data,
        id: String(Date.now())
      }
      setIngredients(prev => [...prev, newIngredient])
    }
    setEditingIngredient(null)
  }

  // Group ingredients by type
  const groupedIngredients = ingredients.reduce((acc, ingredient) => {
    if (!acc[ingredient.type]) {
      acc[ingredient.type] = []
    }
    acc[ingredient.type].push(ingredient)
    return acc
  }, {} as Record<string, Ingredient[]>)

  const typeOrder = ['staple', 'protein', 'vegetable', 'fruit', 'condiment', 'dairy', 'cleaning', 'other']
  const typeLabels: Record<string, string> = {
    staple: 'Staples',
    protein: 'Proteins',
    vegetable: 'Vegetables',
    fruit: 'Fruits',
    condiment: 'Condiments',
    dairy: 'Dairy',
    cleaning: 'Cleaning / Kitchen Supplies',
    other: 'Other'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Ingredients</h1>
          <p className="text-muted-foreground">Manage kitchen ingredients</p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Add Ingredient
        </Button>
      </div>

      <div className="space-y-8">
        {typeOrder.map(type => {
          const items = groupedIngredients[type]
          if (!items || items.length === 0) return null
          
          return (
            <div key={type} className="space-y-4">
              <h2 className="text-lg font-medium text-foreground">{typeLabels[type]}</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((ingredient) => (
                  <IngredientCard 
                    key={ingredient.id} 
                    ingredient={ingredient}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <IngredientForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        ingredient={editingIngredient}
        onSave={handleSave}
      />
    </div>
  )
}
