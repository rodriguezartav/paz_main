import { getPublicActivitiesForNextDays, getWeeklyMealPlanByDate } from '@/lib/db/queries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UtensilsCrossed, CalendarCheck, Sun, Leaf } from 'lucide-react'
import Link from 'next/link'

function getWeekStartDate(): string {
  const today = new Date()
  const day = today.getDay()
  const diff = today.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(today.setDate(diff))
  return monday.toISOString().split('T')[0]
}

export default async function PortalPage() {
  const weekStart = getWeekStartDate()
  const [activities, mealPlan] = await Promise.all([
    getPublicActivitiesForNextDays(3),
    getWeeklyMealPlanByDate(weekStart),
  ])

  const today = new Date()
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const todayName = dayNames[today.getDay()]
  
  const todayMeals = mealPlan?.meals?.filter(m => m.day_of_week === todayName) || []
  const upcomingActivities = activities.slice(0, 3)

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Leaf className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-display text-paz-green mb-2">
          Welcome to Paz
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Your home between the rainforest and the ocean. Here you will find everything you need for your stay.
        </p>
      </div>

      {/* Quick Links Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Today's Menu Preview */}
        <Link href="/portal/menu">
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer border-border">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <UtensilsCrossed className="h-5 w-5 text-primary" />
                Today&apos;s Menu
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayMeals.length > 0 ? (
                <div className="space-y-3">
                  {todayMeals.map((meal) => (
                    <div key={meal.id} className="border-l-2 border-primary/30 pl-3">
                      <p className="text-sm font-medium capitalize text-foreground">
                        {meal.meal_type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {meal.recipes?.map(r => r.recipe?.name).filter(Boolean).join(', ') || 'Menu coming soon'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No menu planned for today. Check back soon!
                </p>
              )}
              <p className="text-xs text-primary mt-4">
                View full week &rarr;
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Upcoming Activities Preview */}
        <Link href="/portal/activities">
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer border-border">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CalendarCheck className="h-5 w-5 text-primary" />
                Upcoming Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingActivities.length > 0 ? (
                <div className="space-y-3">
                  {upcomingActivities.map((activity) => {
                    const activityDate = new Date(activity.date + 'T00:00:00')
                    const isToday = activityDate.toDateString() === new Date().toDateString()
                    
                    return (
                      <div key={activity.id} className="border-l-2 border-primary/30 pl-3">
                        <p className="text-sm font-medium text-foreground">
                          {activity.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {isToday ? 'Today' : activityDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          {activity.start_time && ` at ${activity.start_time.slice(0, 5)}`}
                        </p>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No activities scheduled. Enjoy the tranquility!
                </p>
              )}
              <p className="text-xs text-primary mt-4">
                View all activities &rarr;
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Daily Reminder */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Sun className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                Daily Rhythm
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Brunch is served at <strong>10:00 AM</strong></li>
                <li>Dinner is served at <strong>6:00 PM</strong></li>
                <li>Quiet hours begin at <strong>9:00 PM</strong></li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
