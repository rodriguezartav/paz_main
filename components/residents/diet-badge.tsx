import { Badge } from '@/components/ui/badge'
import type { Diet } from '@/lib/types'
import { cn } from '@/lib/utils'

const dietConfig: Record<Diet, { label: string; className: string }> = {
  eats_all: {
    label: 'Eats All',
    className: 'bg-paz-taupe/20 text-paz-text border-paz-taupe'
  },
  vegetarian: {
    label: 'Vegetarian',
    className: 'bg-paz-green/20 text-paz-green border-paz-green'
  },
  vegan: {
    label: 'Vegan',
    className: 'bg-secondary/20 text-secondary border-secondary'
  }
}

interface DietBadgeProps {
  diet: Diet
  className?: string
}

export function DietBadge({ diet, className }: DietBadgeProps) {
  const config = dietConfig[diet]
  
  return (
    <Badge 
      variant="outline" 
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  )
}
