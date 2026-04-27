import { Badge } from '@/components/ui/badge'
import type { ResidentStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

const statusConfig: Record<ResidentStatus, { label: string; className: string }> = {
  upcoming: {
    label: 'Upcoming',
    className: 'bg-paz-lavender/20 text-paz-lavender border-paz-lavender'
  },
  checked_in: {
    label: 'Checked In',
    className: 'bg-paz-green/20 text-paz-green border-paz-green'
  },
  staying: {
    label: 'Staying',
    className: 'bg-paz-clay/20 text-paz-clay border-paz-clay'
  },
  checking_out_today: {
    label: 'Checking Out Today',
    className: 'bg-amber-100 text-amber-700 border-amber-300'
  },
  checked_out: {
    label: 'Checked Out',
    className: 'bg-paz-taupe/20 text-paz-muted border-paz-taupe'
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-red-100 text-red-700 border-red-300'
  }
}

interface StatusBadgeProps {
  status: ResidentStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  
  return (
    <Badge 
      variant="outline" 
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  )
}
