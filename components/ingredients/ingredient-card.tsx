'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { IngredientTypeBadge } from './ingredient-type-badge'
import { MeasurementBadge } from './measurement-badge'
import type { Ingredient } from '@/lib/types'
import { Edit2 } from 'lucide-react'

interface IngredientCardProps {
  ingredient: Ingredient
  onEdit?: (ingredient: Ingredient) => void
}

export function IngredientCard({ ingredient, onEdit }: IngredientCardProps) {
  return (
    <Card className="border-border bg-card transition-shadow hover:shadow-md">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <div>
            <h3 className="font-medium text-card-foreground">{ingredient.name}</h3>
            <div className="mt-2 flex items-center gap-2">
              <IngredientTypeBadge type={ingredient.type} />
              <MeasurementBadge measurement={ingredient.measurement} />
            </div>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => onEdit?.(ingredient)}
        >
          <Edit2 className="h-4 w-4" />
          <span className="sr-only">Edit {ingredient.name}</span>
        </Button>
      </CardContent>
    </Card>
  )
}
