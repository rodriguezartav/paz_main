import { ScheduledActivity } from '@/lib/types'
import { ActivityTypeBadge } from './activity-type-badge'
import { PublicActivityStatusBadge } from './public-activity-status-badge'
import { Clock, MapPin, User, Users, Backpack, AlertTriangle } from 'lucide-react'

interface PublicActivityCardProps {
  activity: ScheduledActivity
}

function formatTime(time: string | null): string {
  if (!time) return ''
  const [hours, minutes] = time.split(':')
  const h = parseInt(hours, 10)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}

export function PublicActivityCard({ activity }: PublicActivityCardProps) {
  const spotsLeft = activity.capacity ? activity.capacity - 0 : null // Would calculate from signups
  
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <ActivityTypeBadge type={activity.activity_type} />
          <PublicActivityStatusBadge status={activity.status} />
        </div>
      </div>
      
      {/* Title */}
      <h3 className="mb-2 text-lg font-semibold text-foreground">{activity.title}</h3>
      
      {/* Description */}
      {activity.guest_description && (
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
          {activity.guest_description}
        </p>
      )}
      
      {/* Details Grid */}
      <div className="mb-4 grid gap-2 text-sm">
        {/* Time */}
        {activity.start_time && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span>
              {formatTime(activity.start_time)}
              {activity.end_time && ` - ${formatTime(activity.end_time)}`}
            </span>
          </div>
        )}
        
        {/* Location */}
        {activity.location && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span>{activity.location}</span>
          </div>
        )}
        
        {/* Facilitator */}
        {activity.facilitator_name && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4 flex-shrink-0" />
            <span>Led by {activity.facilitator_name}</span>
          </div>
        )}
        
        {/* Capacity */}
        {activity.capacity && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4 flex-shrink-0" />
            <span>
              {spotsLeft !== null ? `${spotsLeft} spots left` : `${activity.capacity} spots`}
            </span>
          </div>
        )}
      </div>
      
      {/* What to Bring */}
      {activity.what_to_bring && (
        <div className="mb-3 flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-sm">
          <Backpack className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
          <div>
            <span className="font-medium text-foreground">Bring: </span>
            <span className="text-muted-foreground">{activity.what_to_bring}</span>
          </div>
        </div>
      )}
      
      {/* Safety Note */}
      {activity.safety_note && (
        <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
          <div>
            <span className="font-medium text-amber-800">Note: </span>
            <span className="text-amber-700">{activity.safety_note}</span>
          </div>
        </div>
      )}
    </div>
  )
}
