import { Badge } from '@/components/ui/badge'
import type { Measurement } from '@/lib/types'
import { cn } from '@/lib/utils'

const measurementConfig: Record<Measurement, { label: string }> = {
  kg: { label: 'kg' },
  unit: { label: 'unit' },
  ml: { label: 'ml' },
  tbsp: { label: 'tbsp' }
}

interface MeasurementBadgeProps {
  measurement: Measurement
  className?: string
}

export function MeasurementBadge({ measurement, className }: MeasurementBadgeProps) {
  const config = measurementConfig[measurement]
  
  return (
    <Badge 
      variant="outline" 
      className={cn('bg-muted/50 text-muted-foreground border-border', className)}
    >
      {config.label}
    </Badge>
  )
}
