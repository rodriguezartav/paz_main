'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RecipeCard } from '@/components/recipes/recipe-card'
import { RecipeForm } from '@/components/recipes/recipe-form'
import { RecipeDetailPanel } from '@/components/recipes/recipe-detail-panel'
import { recipes as initialRecipes } from '@/lib/data'
import type { Recipe } from '@/lib/types'
import { Plus } from 'lucide-react'

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  const [viewingRecipe, setViewingRecipe] = useState<Recipe | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

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

  const handleSave = (data: Omit<Recipe, 'id'> & { id?: string }) => {
    if (data.id) {
      // Update existing
      setRecipes(prev => 
        prev.map(r => r.id === data.id ? { ...r, ...data } as Recipe : r)
      )
    } else {
      // Add new
      const newRecipe: Recipe = {
        ...data,
        id: String(Date.now()),
        ingredients: data.ingredients.map((ing, index) => ({
          ...ing,
          id: `${Date.now()}-${index}`,
          recipeId: String(Date.now())
        }))
      }
      setRecipes(prev => [...prev, newRecipe])
    }
    setEditingRecipe(null)
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
        {recipes.map((recipe) => (
          <RecipeCard 
            key={recipe.id} 
            recipe={recipe}
            onView={handleView}
            onEdit={handleEdit}
          />
        ))}
      </div>

      <RecipeForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        recipe={editingRecipe}
        onSave={handleSave}
      />

      <RecipeDetailPanel
        recipe={viewingRecipe}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  )
}
