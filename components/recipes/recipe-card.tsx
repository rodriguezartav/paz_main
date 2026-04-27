'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Recipe } from '@/lib/types'
import { ChefHat, Eye, Edit, Settings2 } from 'lucide-react'

interface RecipeCardProps {
  recipe: Recipe
  onView?: (recipe: Recipe) => void
  onEdit?: (recipe: Recipe) => void
}

export function RecipeCard({ recipe, onView, onEdit }: RecipeCardProps) {
  const recipeIngredients = recipe.recipe_ingredients || []
  
  // Get first 4 ingredients for preview
  const previewIngredients = recipeIngredients.slice(0, 4).map(ri => {
    return ri.ingredient?.name || 'Unknown'
  })

  const remainingCount = recipeIngredients.length - previewIngredients.length

  return (
    <Card className="border-border bg-card transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <ChefHat className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg text-card-foreground">{recipe.name}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{recipe.description}</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Ingredient Count */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-muted/50 text-muted-foreground">
            {recipeIngredients.length} ingredients
          </Badge>
        </div>

        {/* Ingredient Preview */}
        <div className="flex flex-wrap gap-1.5">
          {previewIngredients.map((name, index) => (
            <span 
              key={index}
              className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
            >
              {name}
            </span>
          ))}
          {remainingCount > 0 && (
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
              +{remainingCount} more
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Link href={`/recipes/${recipe.id}/manage`} className="w-full">
            <Button 
              variant="default" 
              size="sm" 
              className="w-full"
            >
              <Settings2 className="mr-1.5 h-4 w-4" />
              Recipe Manager
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => onView?.(recipe)}
            >
              <Eye className="mr-1.5 h-4 w-4" />
              View
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => onEdit?.(recipe)}
            >
              <Edit className="mr-1.5 h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
