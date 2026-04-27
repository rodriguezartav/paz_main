import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface BalanceDueBadgeProps {
  balanceDue: number
  currency: string
  className?: string
}

function formatCurrency(amount: number, currency: string): string {
  if (currency === 'CRC') {
    return `₡${amount.toLocaleString()}`
  }
  return `$${amount.toLocaleString()}`
}

export function BalanceDueBadge({ balanceDue, currency, className }: BalanceDueBadgeProps) {
  const isPaid = balanceDue === 0
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        'font-semibold',
        isPaid 
          ? 'bg-paz-green/20 text-paz-green border-paz-green'
          : 'bg-paz-clay/20 text-paz-clay border-paz-clay',
        className
      )}
    >
      {isPaid ? 'Paid in full' : `Balance Due: ${formatCurrency(balanceDue, currency)}`}
    </Badge>
  )
}
