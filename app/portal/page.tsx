import { getPublicActivitiesForNextDays, getMealsWithPrepDateInRange } from '@/lib/db/queries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UtensilsCrossed, CalendarCheck, Sun, Leaf, Users } from 'lucide-react'
import Link from 'next/link'

// Costa Rica timezone (GMT-6)
const TIMEZONE = 'America/Costa_Rica'

function getTodayInTimezone(): Date {
  // Get current date string in Costa Rica timezone
  const dateStr = new Date().toLocaleDateString('en-CA', { timeZone: TIMEZONE })
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function formatDateYMD(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDayLabel(dateStr: string, isToday: boolean, todayStr: string): string {
  if (isToday) return 'Today'
  const today = getTodayInTimezone()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  if (dateStr === formatDateYMD(tomorrow)) return 'Tomorrow'
  // Parse the date string to display
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export default async function PortalPage() {
  const today = getTodayInTimezone()
  const todayStr = formatDateYMD(today)
  const startDate = todayStr
  const endDateObj = new Date(today)
  endDateObj.setDate(today.getDate() + 2) // Next 3 days (today + 2)
  const endDate = formatDateYMD(endDateObj)
  
  const [activities, meals] = await Promise.all([
    getPublicActivitiesForNextDays(3),
    getMealsWithPrepDateInRange(startDate, endDate, 0), // 0 offset since we want served dates, not prep dates
  ])

  // Group meals by date
  const mealsByDate = new Map<string, { brunch?: typeof meals[0], dinner?: typeof meals[0] }>()
  for (const meal of meals) {
    if (!meal.meal_date) continue
    if (!mealsByDate.has(meal.meal_date)) {
      mealsByDate.set(meal.meal_date, {})
    }
    const entry = mealsByDate.get(meal.meal_date)!
    if (meal.meal_type === 'brunch') entry.brunch = meal
    if (meal.meal_type === 'dinner') entry.dinner = meal
  }

  // Generate next 3 days
  const next3Days: { date: string; isToday: boolean }[] = []
  for (let i = 0; i < 3; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    next3Days.push({
      date: formatDateYMD(d),
      isToday: i === 0
    })
  }

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

      {/* Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Next 3 Days Menu */}
        <Card className="md:col-span-2 lg:col-span-2 border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <UtensilsCrossed className="h-5 w-5 text-primary" />
                Menu
              </CardTitle>
              <Link href="/portal/menu" className="text-xs text-primary hover:underline">
                View full week &rarr;
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {next3Days.map(({ date, isToday }) => {
                const dayMeals = mealsByDate.get(date)
                const hasMeals = dayMeals?.brunch || dayMeals?.dinner
                
                // Get headcount from brunch or dinner (they should be the same per day)
                const meal = dayMeals?.brunch || dayMeals?.dinner
                const eatsAll = meal?.headcount_eats_all || 0
                const vegetarian = meal?.headcount_vegetarian || 0
                const vegan = meal?.headcount_vegan || 0
                const total = eatsAll + vegetarian + vegan
                
                return (
                  <div 
                    key={date} 
                    className={`rounded-lg p-3 ${isToday ? 'bg-primary/10 ring-1 ring-primary/20' : 'bg-muted/30'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className={`text-sm font-medium ${isToday ? 'text-primary' : 'text-foreground'}`}>
                        {formatDayLabel(date, isToday, todayStr)}
                      </p>
                      {total > 0 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          <span>{total}</span>
                          <span className="text-muted-foreground/60">
                            ({eatsAll} all{vegetarian > 0 && `, ${vegetarian} veg`}{vegan > 0 && `, ${vegan} vegan`})
                          </span>
                        </div>
                      )}
                    </div>
                    {hasMeals ? (
                      <div className="grid gap-2 md:grid-cols-2">
                        {/* Brunch */}
                        <div className="border-l-2 border-primary/30 pl-3">
                          <p className="text-xs font-medium text-muted-foreground uppercase">Brunch</p>
                          <p className="text-sm text-foreground">
                            {dayMeals?.brunch?.recipes?.map(r => r.recipe?.name).filter(Boolean).join(', ') || 'Not planned'}
                          </p>
                        </div>
                        {/* Dinner */}
                        <div className="border-l-2 border-primary/30 pl-3">
                          <p className="text-xs font-medium text-muted-foreground uppercase">Dinner</p>
                          <p className="text-sm text-foreground">
                            {dayMeals?.dinner?.recipes?.map(r => r.recipe?.name).filter(Boolean).join(', ') || 'Not planned'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        Menu not yet planned
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

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
                    const isActivityToday = activity.date === todayStr
                    const [year, month, day] = activity.date.split('-').map(Number)
                    const activityDate = new Date(year, month - 1, day)
                    
                    return (
                      <div key={activity.id} className="border-l-2 border-primary/30 pl-3">
                        <p className="text-sm font-medium text-foreground">
                          {activity.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {isActivityToday ? 'Today' : activityDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
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
