import { getPublicActivitiesForNextDays } from '@/lib/db/queries'
import { PublicActivitySection } from '@/components/activities/public-activity-section'
import { ScheduledActivity } from '@/lib/types'

export const metadata = {
  title: 'Upcoming Activities at Paz',
  description: 'A simple view of what is happening in the next few days at Paz Corcovado.',
}

// Costa Rica timezone (GMT-6)
const TIMEZONE = 'America/Costa_Rica'

function getTodayStr(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: TIMEZONE })
}

function formatDateYMD(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function groupActivitiesByPeriod(activities: ScheduledActivity[]) {
  const todayStr = getTodayStr()
  const [year, month, day] = todayStr.split('-').map(Number)
  const today = new Date(year, month - 1, day)
  
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  const tomorrowStr = formatDateYMD(tomorrow)
  
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
