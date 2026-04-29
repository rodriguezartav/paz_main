import { getPublicActivitiesForNextDays } from '@/lib/db/queries'
import { PublicActivitySection } from '@/components/activities/public-activity-section'
import { ScheduledActivity } from '@/lib/types'

export const metadata = {
  title: 'Upcoming Activities at Paz',
  description: 'A simple view of what is happening in the next few days at Paz Corcovado.',
}

function groupActivitiesByPeriod(activities: ScheduledActivity[]) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const dayAfterTomorrow = new Date(today)
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)
  
  const todayStr = today.toISOString().split('T')[0]
  const tomorrowStr = tomorrow.toISOString().split('T')[0]
  
  const todayActivities: ScheduledActivity[] = []
  const tomorrowActivities: ScheduledActivity[] = []
  const laterActivities: ScheduledActivity[] = []
  
  for (const activity of activities) {
    if (activity.date === todayStr) {
      todayActivities.push(activity)
    } else if (activity.date === tomorrowStr) {
      tomorrowActivities.push(activity)
    } else {
      laterActivities.push(activity)
    }
  }
  
  return { todayActivities, tomorrowActivities, laterActivities }
}

export default async function PublicActivitiesPage() {
  const activities = await getPublicActivitiesForNextDays(7)
  const { todayActivities, tomorrowActivities, laterActivities } = groupActivitiesByPeriod(activities)
  
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-10 md:py-16">
        {/* Header */}
        <header className="mb-10 text-center">
          <h1 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">
            Upcoming Activities at Paz
          </h1>
          <p className="mb-4 text-lg text-muted-foreground">
            A simple view of what is happening in the next few days.
          </p>
          <p className="mx-auto max-w-md text-sm italic text-muted-foreground/80">
            Activities may shift with weather, tides, group energy, and the rhythm of the land.
          </p>
        </header>
        
        {/* Activity Sections */}
        <PublicActivitySection 
          title="Today" 
          activities={todayActivities} 
          emptyPeriod="today" 
        />
        
        <PublicActivitySection 
          title="Tomorrow" 
          activities={tomorrowActivities} 
          emptyPeriod="tomorrow" 
        />
        
        <PublicActivitySection 
          title="Later This Week" 
          activities={laterActivities} 
          emptyPeriod="later" 
        />
        
        {/* Footer Note */}
        <footer className="mt-12 border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Please ask the Paz team if you want to join an activity or if you have questions.
          </p>
        </footer>
      </div>
    </div>
  )
}
