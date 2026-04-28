'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import type { Recipe } from '@/lib/types'
import { ChefHat, FileText, ListChecks } from 'lucide-react'

interface RecipeDetailPanelProps {
  recipe: Recipe | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RecipeDetailPanel({ recipe, open, onOpenChange }: RecipeDetailPanelProps) {
  if (!recipe) return null

  const recipeIngredients = recipe.recipe_ingredients || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <ChefHat className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl text-foreground">{recipe.name}</DialogTitle>
              {recipe.english_name && (
                <p className="text-sm text-muted-foreground">{recipe.english_name}</p>
              )}
              {recipe.description && (
                <p className="mt-1 text-sm text-muted-foreground">{recipe.description}</p>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Ingredients List */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <ListChecks className="h-4 w-4 text-muted-foreground" />
              <span>Ingredients ({recipeIngredients.length})</span>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <ul className="space-y-2">
                {recipeIngredients.map((ri) => {
                  const ingredient = ri.ingredient
                  if (!ingredient) return null
                  
                  return (
                    <li key={ri.id} className="flex items-center justify-between text-sm">
                      <span className="text-card-foreground">{ingredient.name}</span>
                      <Badge variant="outline" className="bg-card text-muted-foreground">
                        {ri.amount} {ri.measurement}
                      </Badge>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>

          {/* Notes */}
          {recipe.notes && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>Notes</span>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">{recipe.notes}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
