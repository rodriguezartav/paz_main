import { ScheduledActivity } from '@/lib/types'
import { PublicActivityCard } from './public-activity-card'
import { EmptyActivitiesState } from './empty-activities-state'

interface PublicActivitySectionProps {
  title: string
  activities: ScheduledActivity[]
  emptyPeriod: 'today' | 'tomorrow' | 'later'
}

export function PublicActivitySection({ title, activities, emptyPeriod }: PublicActivitySectionProps) {
  return (
    <section className="mb-10">
      <h2 className="mb-4 text-xl font-semibold text-foreground">{title}</h2>
      {activities.length === 0 ? (
        <EmptyActivitiesState period={emptyPeriod} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {activities.map((activity) => (
            <PublicActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </section>
  )
}
