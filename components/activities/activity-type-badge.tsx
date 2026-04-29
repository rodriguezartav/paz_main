import { ActivityType } from '@/lib/types'
import { Waves, Flame, TreePine, Users, Music, Wrench, Heart, CircleDot } from 'lucide-react'

const activityConfig: Record<ActivityType, { label: string; icon: React.ElementType; className: string }> = {
  surf: { label: 'Surf', icon: Waves, className: 'bg-blue-100 text-blue-800 border-blue-200' },
  sauna: { label: 'Sauna', icon: Flame, className: 'bg-orange-100 text-orange-800 border-orange-200' },
  nature_walk: { label: 'Nature Walk', icon: TreePine, className: 'bg-green-100 text-green-800 border-green-200' },
  community: { label: 'Community', icon: Users, className: 'bg-amber-100 text-amber-800 border-amber-200' },
  music: { label: 'Music', icon: Music, className: 'bg-purple-100 text-purple-800 border-purple-200' },
  workshop: { label: 'Workshop', icon: Wrench, className: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
  service: { label: 'Service', icon: Heart, className: 'bg-pink-100 text-pink-800 border-pink-200' },
  other: { label: 'Other', icon: CircleDot, className: 'bg-gray-100 text-gray-800 border-gray-200' },
}

interface ActivityTypeBadgeProps {
  type: ActivityType
  size?: 'sm' | 'md'
}

export function ActivityTypeBadge({ type, size = 'sm' }: ActivityTypeBadgeProps) {
  const config = activityConfig[type] || activityConfig.other
  const Icon = config.icon
  
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-medium ${config.className} ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
      {config.label}
    </span>
  )
}
