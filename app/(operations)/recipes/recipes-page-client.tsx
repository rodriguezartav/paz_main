'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { RecipeCard } from '@/components/recipes/recipe-card'
import { RecipeForm } from '@/components/recipes/recipe-form'
import { RecipeDetailPanel } from '@/components/recipes/recipe-detail-panel'
import type { Recipe, Ingredient, RecipeType, MealType } from '@/lib/types'
import { Plus } from 'lucide-react'
import { createRecipeAction, updateRecipeAction } from './actions'

interface RecipesPageClientProps {
  initialRecipes: Recipe[]
  ingredients: Ingredient[]
}

export function RecipesPageClient({ initialRecipes, ingredients }: RecipesPageClientProps) {
  const router = useRouter()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  const [viewingRecipe, setViewingRecipe] = useState<Recipe | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formKey, setFormKey] = useState(0) // Key to force form reset

  const handleView = (recipe: Recipe) => {
    setViewingRecipe(recipe)
    setIsDetailOpen(true)
  }

  const handleEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe)
    setIsFormOpen(true)
  }

  const handleAddNew = () => {
    setEditingRecipe(null)
    setIsFormOpen(true)
  }

  const handleSave = async (data: { 
    name: string
    english_name: string | null
    type: RecipeType | null
    meal_type: MealType | null
    description: string | null
    notes: string | null
    id?: string
    recipe_ingredients: { ingredient_id: string; amount: number; measurement: string }[]
  }) => {
    setIsLoading(true)
    try {
      if (data.id) {
        await updateRecipeAction(
          data.id,
          { name: data.name, english_name: data.english_name, type: data.type, meal_type: data.meal_type ?? 'lunch', description: data.description, notes: data.notes },
          data.recipe_ingredients
        )
      } else {
        await createRecipeAction(
          { name: data.name, english_name: data.english_name, type: data.type, meal_type: data.meal_type ?? 'lunch', description: data.description, notes: data.notes },
          data.recipe_ingredients
        )
      }
      setEditingRecipe(null)
      setIsFormOpen(false)
      setFormKey(prev => prev + 1) // Force form to reset
      router.refresh()
    } catch (error) {
      console.error('Failed to save recipe:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Recipes</h1>
          <p className="text-muted-foreground">Manage kitchen recipes</p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Add Recipe
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {initialRecipes.map((recipe) => (
          <RecipeCard 
            key={recipe.id} 
            recipe={recipe}
            onView={handleView}
            onEdit={handleEdit}
          />
        ))}
      </div>

      <RecipeForm
        key={formKey}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        recipe={editingRecipe}
        ingredients={ingredients}
        onSave={handleSave}
        isLoading={isLoading}
      />

      <RecipeDetailPanel
        recipe={viewingRecipe}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  )
}
