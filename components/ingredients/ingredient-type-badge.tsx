import { Badge } from '@/components/ui/badge'
import type { IngredientType } from '@/lib/types'
import { cn } from '@/lib/utils'

const typeConfig: Record<IngredientType, { label: string; className: string }> = {
  staple: {
    label: 'Staple',
    className: 'bg-paz-clay/20 text-paz-clay border-paz-clay'
  },
  protein: {
    label: 'Protein',
    className: 'bg-red-100 text-red-700 border-red-300'
  },
  vegetable: {
    label: 'Vegetable',
    className: 'bg-paz-green/20 text-paz-green border-paz-green'
  },
  fruit: {
    label: 'Fruit',
    className: 'bg-amber-100 text-amber-700 border-amber-300'
  },
  condiment: {
    label: 'Condiment',
    className: 'bg-paz-lavender/20 text-paz-lavender border-paz-lavender'
  },
  dairy: {
    label: 'Dairy',
    className: 'bg-blue-100 text-blue-700 border-blue-300'
  },
  cleaning: {
    label: 'Cleaning / Kitchen',
    className: 'bg-paz-taupe/20 text-paz-muted border-paz-taupe'
  },
  other: {
    label: 'Other',
    className: 'bg-gray-100 text-gray-700 border-gray-300'
  }
}

interface IngredientTypeBadgeProps {
  type: IngredientType
  className?: string
}

export function IngredientTypeBadge({ type, className }: IngredientTypeBadgeProps) {
  const config = typeConfig[type]
  
  return (
    <Badge 
      variant="outline" 
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  )
}
