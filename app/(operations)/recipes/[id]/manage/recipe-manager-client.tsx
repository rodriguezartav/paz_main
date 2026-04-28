'use client'

import { useState, useMemo, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Recipe, Ingredient, RecipeIngredient, Measurement } from '@/lib/types'
import { ArrowLeft, Search, Plus, Minus, X, ChefHat, Check, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { updateRecipeIngredientsAction } from './actions'

interface RecipeManagerClientProps {
  recipe: Recipe
  allIngredients: Ingredient[]
  allRecipes: Recipe[]
}

// Helper to get ingredient type colors
function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    staple: 'bg-amber-100 text-amber-800 border-amber-200',
    protein: 'bg-red-100 text-red-800 border-red-200',
    vegetable: 'bg-green-100 text-green-800 border-green-200',
    fruit: 'bg-purple-100 text-purple-800 border-purple-200',
    condiment: 'bg-orange-100 text-orange-800 border-orange-200',
    dairy: 'bg-blue-100 text-blue-800 border-blue-200',
    cleaning: 'bg-slate-100 text-slate-800 border-slate-200',
    other: 'bg-gray-100 text-gray-800 border-gray-200',
  }
  return colors[type] || colors.other
}

// Helper to format measurement
function formatMeasurement(amount: number, measurement: string): string {
  const labels: Record<string, string> = {
    kg: 'kg',
    unit: amount === 1 ? 'unit' : 'units',
    ml: 'ml',
    tbsp: 'tbsp',
  }
  return `${amount} ${labels[measurement] || measurement}`
}

interface SelectedIngredient {
  ingredient_id: string
  amount: number
  measurement: Measurement
  ingredient: Ingredient
}

export function RecipeManagerClient({ recipe, allIngredients, allRecipes }: RecipeManagerClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [searchQuery, setSearchQuery] = useState('')
  const [hasChanges, setHasChanges] = useState(false)
  
  // Find current recipe index and adjacent recipes
  const currentIndex = allRecipes.findIndex(r => r.id === recipe.id)
  const prevRecipe = currentIndex > 0 ? allRecipes[currentIndex - 1] : null
  const nextRecipe = currentIndex < allRecipes.length - 1 ? allRecipes[currentIndex + 1] : null
  
  // Initialize selected ingredients from recipe
  const [selectedIngredients, setSelectedIngredients] = useState<SelectedIngredient[]>(() => {
    return (recipe.recipe_ingredients || []).map(ri => ({
      ingredient_id: ri.ingredient_id,
      amount: ri.amount,
      measurement: ri.measurement,
      ingredient: ri.ingredient!
    }))
  })

  // Get IDs of selected ingredients for quick lookup
  const selectedIds = useMemo(() => 
    new Set(selectedIngredients.map(si => si.ingredient_id)),
    [selectedIngredients]
  )

  // Filter available ingredients based on search
  const filteredIngredients = useMemo(() => {
    if (!searchQuery.trim()) return allIngredients
    const query = searchQuery.toLowerCase()
    return allIngredients.filter(ing => 
      ing.name.toLowerCase().includes(query) ||
      ing.type.toLowerCase().includes(query)
    )
  }, [allIngredients, searchQuery])

  // Group filtered ingredients by type
  const groupedIngredients = useMemo(() => {
    const groups: Record<string, Ingredient[]> = {}
    filteredIngredients.forEach(ing => {
      if (!groups[ing.type]) {
        groups[ing.type] = []
      }
      groups[ing.type].push(ing)
    })
    return groups
  }, [filteredIngredients])

  // Add ingredient to recipe
  const addIngredient = (ingredient: Ingredient) => {
    if (selectedIds.has(ingredient.id)) return
    setSelectedIngredients(prev => [...prev, {
      ingredient_id: ingredient.id,
      amount: 1,
      measurement: ingredient.measurement,
      ingredient
    }])
    setHasChanges(true)
  }

  // Remove ingredient from recipe
  const removeIngredient = (ingredientId: string) => {
    setSelectedIngredients(prev => prev.filter(si => si.ingredient_id !== ingredientId))
    setHasChanges(true)
  }

  // Update ingredient amount
  const updateAmount = (ingredientId: string, delta: number) => {
    setSelectedIngredients(prev => prev.map(si => {
      if (si.ingredient_id !== ingredientId) return si
      const newAmount = Math.max(0.5, si.amount + delta)
      return { ...si, amount: newAmount }
    }))
    setHasChanges(true)
  }

  // Set specific amount
  const setAmount = (ingredientId: string, amount: number) => {
    setSelectedIngredients(prev => prev.map(si => {
      if (si.ingredient_id !== ingredientId) return si
      return { ...si, amount: Math.max(0.5, amount) }
    }))
    setHasChanges(true)
  }

  // Save changes
  const handleSave = () => {
    startTransition(async () => {
      try {
        await updateRecipeIngredientsAction(
          recipe.id,
          selectedIngredients.map(si => ({
            ingredient_id: si.ingredient_id,
            amount: si.amount,
            measurement: si.measurement
          }))
        )
        setHasChanges(false)
        router.refresh()
      } catch (error) {
        console.error('Failed to save:', error)
      }
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/recipes">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-primary" />
              <div>
                <h1 className="text-lg font-semibold text-foreground">{recipe.name}</h1>
                <p className="text-xs text-muted-foreground">Recipe Manager</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleSave} 
              disabled={!hasChanges || isPending}
              size="sm"
            >
              {isPending ? 'Saving...' : (
                <>
                  <Check className="mr-1.5 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
            
            {/* Navigation Buttons */}
            <div className="flex items-center gap-1 ml-2 border-l border-border pl-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!prevRecipe || hasChanges}
                onClick={() => prevRecipe && router.push(`/recipes/${prevRecipe.id}/manage`)}
                title={prevRecipe ? `Previous: ${prevRecipe.name}` : 'No previous recipe'}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Prev
              </Button>
              <span className="text-xs text-muted-foreground px-2">
                {currentIndex + 1} / {allRecipes.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={!nextRecipe || hasChanges}
                onClick={() => nextRecipe && router.push(`/recipes/${nextRecipe.id}/manage`)}
                title={nextRecipe ? `Next: ${nextRecipe.name}` : 'No next recipe'}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Left Panel - Selected Ingredients */}
        <div className="lg:w-1/2 border-b lg:border-b-0 lg:border-r border-border">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">
                Recipe Ingredients ({selectedIngredients.length})
              </h2>
              {hasChanges && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  Unsaved changes
                </Badge>
              )}
            </div>

            {selectedIngredients.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No ingredients added yet.</p>
                <p className="text-sm mt-1">Search and tap ingredients to add them.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedIngredients.map(si => (
                  <Card key={si.ingredient_id} className="border-border">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Badge 
                            variant="outline" 
                            className={`shrink-0 text-xs ${getTypeColor(si.ingredient.type)}`}
                          >
                            {si.ingredient.type}
                          </Badge>
                          <span className="font-medium text-foreground truncate">
                            {si.ingredient.name}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => updateAmount(si.ingredient_id, -0.5)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input
                            type="number"
                            value={si.amount}
                            onChange={(e) => setAmount(si.ingredient_id, parseFloat(e.target.value) || 0.5)}
                            className="w-16 h-8 text-center px-1"
                            step="0.1"
                            min="0.01"
                          />
                          <span className="text-sm text-muted-foreground w-10">
                            {si.measurement}
                          </span>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => updateAmount(si.ingredient_id, 0.5)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => removeIngredient(si.ingredient_id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - All Ingredients */}
        <div className="lg:w-1/2">
          <div className="p-4">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Ingredients List */}
            <div className="space-y-6">
              {Object.entries(groupedIngredients).map(([type, ingredients]) => (
                <div key={type}>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 capitalize">
                    {type} ({ingredients.length})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {ingredients.map(ing => {
                      const isSelected = selectedIds.has(ing.id)
                      return (
                        <button
                          key={ing.id}
                          onClick={() => isSelected ? removeIngredient(ing.id) : addIngredient(ing)}
                          className={`
                            flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all
                            ${isSelected 
                              ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                              : 'border-border hover:border-primary/50 hover:bg-muted/50'
                            }
                          `}
                        >
                          {isSelected && (
                            <Check className="h-4 w-4 text-primary shrink-0" />
                          )}
                          <span className={`text-sm truncate ${isSelected ? 'text-primary font-medium' : 'text-foreground'}`}>
                            {ing.name}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}

              {Object.keys(groupedIngredients).length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No ingredients found.</p>
                  <p className="text-sm mt-1">Try a different search term.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
