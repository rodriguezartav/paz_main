'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { RecipeIngredientRow } from './recipe-ingredient-row'
import type { Recipe, Ingredient, Measurement, RecipeType, MealType } from '@/lib/types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus } from 'lucide-react'

interface RecipeFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  recipe?: Recipe | null
  ingredients: Ingredient[]
  onSave: (recipe: { 
    name: string
    english_name: string | null
    type: RecipeType | null
    meal_type: MealType | null
    description: string | null
    notes: string | null
    is_breakfast: boolean
    id?: string
    recipe_ingredients: { ingredient_id: string; amount: number; measurement: string }[]
  }) => void
  isLoading?: boolean
}

interface RecipeIngredientInput {
  tempId: string
  ingredient_id: string
  amount: number
  measurement: Measurement
}

export function RecipeForm({ open, onOpenChange, recipe, ingredients, onSave, isLoading }: RecipeFormProps) {
  const [name, setName] = useState('')
  const [englishName, setEnglishName] = useState('')
  const [recipeType, setRecipeType] = useState<RecipeType | null>(null)
  const [mealType, setMealType] = useState<MealType | null>(null)
  const [description, setDescription] = useState('')
  const [notes, setNotes] = useState('')
  const [isBreakfast, setIsBreakfast] = useState(false)
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredientInput[]>([])

  const isEditing = !!recipe

  useEffect(() => {
    if (recipe) {
      setName(recipe.name)
      setEnglishName(recipe.english_name || '')
      setRecipeType(recipe.type || null)
      setMealType(recipe.meal_type || null)
      setDescription(recipe.description || '')
      setNotes(recipe.notes || '')
      setIsBreakfast(recipe.is_breakfast || false)
      setRecipeIngredients(
        (recipe.recipe_ingredients || []).map(ri => ({
          tempId: ri.id,
          ingredient_id: ri.ingredient_id,
          amount: ri.amount,
          measurement: ri.measurement
        }))
      )
    } else {
      setName('')
      setEnglishName('')
      setRecipeType(null)
      setMealType(null)
      setDescription('')
      setNotes('')
      setIsBreakfast(false)
      setRecipeIngredients([])
    }
  }, [recipe])

  const handleAddIngredient = () => {
    setRecipeIngredients(prev => [
      ...prev,
      {
        tempId: String(Date.now()),
        ingredient_id: '',
        amount: 1,
        measurement: 'kg' as Measurement
      }
    ])
  }

  const handleUpdateIngredient = (tempId: string, updates: Partial<RecipeIngredientInput>) => {
    setRecipeIngredients(prev =>
      prev.map(ri => ri.tempId === tempId ? { ...ri, ...updates } : ri)
    )
  }

  const handleRemoveIngredient = (tempId: string) => {
    setRecipeIngredients(prev => prev.filter(ri => ri.tempId !== tempId))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const ingredientData = recipeIngredients
      .filter(ri => ri.ingredient_id)
      .map(ri => ({
        ingredient_id: ri.ingredient_id,
        amount: ri.amount,
        measurement: ri.measurement
      }))

    onSave({
      id: recipe?.id,
      name,
      english_name: englishName || null,
      type: recipeType,
      meal_type: mealType,
      description: description || null,
      notes: notes || null,
      is_breakfast: isBreakfast,
      recipe_ingredients: ingredientData
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {isEditing ? 'Edit Recipe' : 'Add Recipe'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Recipe Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Gallo Pinto"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="english_name">English Name</Label>
              <Input
                id="english_name"
                value={englishName}
                onChange={(e) => setEnglishName(e.target.value)}
                placeholder="e.g., Rice and Beans"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select 
                value={recipeType || ''} 
                onValueChange={(value) => setRecipeType(value as RecipeType || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">Main</SelectItem>
                  <SelectItem value="side">Side</SelectItem>
                  <SelectItem value="salad">Salad</SelectItem>
                  <SelectItem value="soup">Soup</SelectItem>
                  <SelectItem value="sauce">Sauce</SelectItem>
                  <SelectItem value="dessert">Dessert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="meal_type">Meal Type</Label>
              <Select 
                value={mealType || ''} 
                onValueChange={(value) => setMealType(value as MealType || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select meal type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brunch">Brunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A brief description of the recipe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Cooking tips, variations, etc."
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_breakfast"
                checked={isBreakfast}
                onCheckedChange={(checked) => setIsBreakfast(checked === true)}
              />
              <Label htmlFor="is_breakfast" className="text-sm font-normal cursor-pointer">
                Breakfast recipe (include in shopping list)
              </Label>
            </div>
          </div>

          {/* Ingredients */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Ingredients</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddIngredient}>
                <Plus className="mr-1.5 h-4 w-4" />
                Add Ingredient
              </Button>
            </div>
            
            {recipeIngredients.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-4 rounded-lg bg-muted/50">
                No ingredients added yet. Click &quot;Add Ingredient&quot; to start.
              </p>
            ) : (
              <div className="space-y-3">
                {recipeIngredients.map((ri) => (
                  <RecipeIngredientRow
                    key={ri.tempId}
                    ingredients={ingredients}
                    selectedIngredientId={ri.ingredient_id}
                    amount={ri.amount}
                    measurement={ri.measurement}
                    onIngredientChange={(ingredientId) => 
                      handleUpdateIngredient(ri.tempId, { ingredient_id: ingredientId })
                    }
                    onAmountChange={(amount) => 
                      handleUpdateIngredient(ri.tempId, { amount })
                    }
                    onMeasurementChange={(measurement) => 
                      handleUpdateIngredient(ri.tempId, { measurement })
                    }
                    onRemove={() => handleRemoveIngredient(ri.tempId)}
                  />
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Recipe'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
