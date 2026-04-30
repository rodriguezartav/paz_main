import { getPublicActivitiesForNextDays } from '@/lib/db/queries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarCheck, MapPin, User, Clock, AlertTriangle, Backpack } from 'lucide-react'
import { ActivityTypeBadge } from '@/components/activities/activity-type-badge'
import type { ScheduledActivity } from '@/lib/types'

// Costa Rica timezone (GMT-6)
const TIMEZONE = 'America/Costa_Rica'

function getTodayStr(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: TIMEZONE })
}

function getTomorrowStr(): string {
  const todayStr = getTodayStr()
  const [year, month, day] = todayStr.split('-').map(Number)
  const today = new Date(year, month - 1, day)
  today.setDate(today.getDate() + 1)
  const y = today.getFullYear()
  const m = String(today.getMonth() + 1).padStart(2, '0')
  const d = String(today.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function groupActivitiesByDate(activities: ScheduledActivity[]) {
  const todayStr = getTodayStr()
  const tomorrowStr = getTomorrowStr()

  const groups: { label: string; activities: ScheduledActivity[] }[] = []
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

  if (todayActivities.length > 0) {
    groups.push({ label: 'Today', activities: todayActivities })
  }
  if (tomorrowActivities.length > 0) {
    groups.push({ label: 'Tomorrow', activities: tomorrowActivities })
  }
  if (laterActivities.length > 0) {
    groups.push({ label: 'Coming Up', activities: laterActivities })
  }

  return groups
}

export default async function PortalActivitiesPage() {
  const activities = await getPublicActivitiesForNextDays(7)
  const groupedActivities = groupActivitiesByDate(activities)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display text-paz-green mb-2">
          Activities
        </h1>
        <p className="text-muted-foreground">
          Scheduled activities for the next 7 days
        </p>
      </div>

      {/* Activities List */}
      {activities.length === 0 ? (
        <Card className="border-border">
          <CardContent className="py-12 text-center">
            <CalendarCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No activities scheduled for the coming days.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Enjoy the natural rhythm of Paz.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {groupedActivities.map((group) => (
            <div key={group.label}>
              <h2 className="text-lg font-semibold text-foreground mb-4">
                {group.label}
              </h2>
              <div className="space-y-4">
                {group.activities.map((activity) => {
                  const activityDate = new Date(activity.date + 'T00:00:00')
                  
                  return (
                    <Card key={activity.id} className="border-border">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <CardTitle className="text-lg text-foreground">
                              {activity.title}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <ActivityTypeBadge type={activity.activity_type} />
                              {activity.status === 'confirmed' && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                  Confirmed
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            <p>
                              {activityDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </p>
                            {activity.start_time && (
                              <p className="flex items-center justify-end gap-1 mt-1">
                                <Clock className="h-3 w-3" />
                                {activity.start_time.slice(0, 5)}
                                {activity.end_time && ` - ${activity.end_time.slice(0, 5)}`}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {/* Description */}
                        {activity.guest_description && (
                          <p className="text-sm text-muted-foreground">
                            {activity.guest_description}
                          </p>
                        )}

                        {/* Details Grid */}
                        <div className="grid gap-2 md:grid-cols-2 text-sm">
                          {activity.location && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="h-4 w-4 text-primary" />
                              {activity.location}
                            </div>
                          )}
                          {activity.facilitator_name && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <User className="h-4 w-4 text-primary" />
                              Led by {activity.facilitator_name}
                            </div>
                          )}
                          {activity.capacity && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <CalendarCheck className="h-4 w-4 text-primary" />
                              {activity.capacity} spots available
                            </div>
                          )}
                        </div>

                        {/* What to Bring */}
                        {activity.what_to_bring && (
                          <div className="flex items-start gap-2 text-sm bg-muted/50 rounded-lg p-3">
                            <Backpack className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="font-medium text-foreground">What to bring: </span>
                              <span className="text-muted-foreground">{activity.what_to_bring}</span>
                            </div>
                          </div>
                        )}

                        {/* Safety Note */}
                        {activity.safety_note && (
                          <div className="flex items-start gap-2 text-sm bg-secondary/10 rounded-lg p-3">
                            <AlertTriangle className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="font-medium text-foreground">Note: </span>
                              <span className="text-muted-foreground">{activity.safety_note}</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
