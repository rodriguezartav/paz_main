import { ActivityStatus } from '@/lib/types'

const statusConfig: Record<ActivityStatus, { label: string; className: string }> = {
  planned: { label: 'Planned', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  confirmed: { label: 'Confirmed', className: 'bg-green-50 text-green-700 border-green-200' },
  cancelled: { label: 'Cancelled', className: 'bg-red-50 text-red-700 border-red-200' },
  completed: { label: 'Completed', className: 'bg-gray-50 text-gray-600 border-gray-200' },
}

interface PublicActivityStatusBadgeProps {
  status: ActivityStatus
}

export function PublicActivityStatusBadge({ status }: PublicActivityStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.planned
  
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}
