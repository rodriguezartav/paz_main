import { Badge } from '@/components/ui/badge'
import type { PaymentStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

const paymentStatusConfig: Record<PaymentStatus, { label: string; className: string }> = {
  unpaid: {
    label: 'Unpaid',
    className: 'bg-red-100 text-red-700 border-red-300'
  },
  deposit_paid: {
    label: 'Deposit Paid',
    className: 'bg-paz-lavender/20 text-paz-lavender border-paz-lavender'
  },
  partially_paid: {
    label: 'Partially Paid',
    className: 'bg-amber-100 text-amber-700 border-amber-300'
  },
  paid: {
    label: 'Paid',
    className: 'bg-paz-green/20 text-paz-green border-paz-green'
  },
  refunded: {
    label: 'Refunded',
    className: 'bg-paz-taupe/20 text-paz-muted border-paz-taupe'
  }
}

interface PaymentStatusBadgeProps {
  status: PaymentStatus
  className?: string
}

export function PaymentStatusBadge({ status, className }: PaymentStatusBadgeProps) {
  const config = paymentStatusConfig[status]
  
  return (
    <Badge 
      variant="outline" 
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  )
}
