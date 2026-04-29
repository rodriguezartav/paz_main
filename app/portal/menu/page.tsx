import { getWeeklyMealPlanByDate } from '@/lib/db/queries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UtensilsCrossed, ChefHat } from 'lucide-react'
import type { DayOfWeek, MealType } from '@/lib/types'

function getWeekStartDate(): string {
  const today = new Date()
  const day = today.getDay()
  const diff = today.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(today.setDate(diff))
  return monday.toISOString().split('T')[0]
}

const dayOrder: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const dayLabels: Record<DayOfWeek, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
}

const mealTypeLabels: Record<MealType, string> = {
  brunch: 'Brunch',
  dinner: 'Dinner',
}

export default async function PortalMenuPage() {
  const weekStart = getWeekStartDate()
  const mealPlan = await getWeeklyMealPlanByDate(weekStart)

  const today = new Date()
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const todayName = dayNames[today.getDay()] as DayOfWeek

  // Define meal type for type safety
  type MealEntry = NonNullable<typeof mealPlan>['meals'][0]
  
  // Group meals by day
  const mealsByDay: Record<DayOfWeek, { brunch?: MealEntry, dinner?: MealEntry }> = {
    monday: {},
    tuesday: {},
    wednesday: {},
    thursday: {},
    friday: {},
    saturday: {},
    sunday: {},
  }

  if (mealPlan?.meals) {
    for (const meal of mealPlan.meals) {
      const day = meal.day_of_week as DayOfWeek
      const type = meal.meal_type as MealType
      if (mealsByDay[day]) {
        mealsByDay[day][type] = meal
      }
    }
  }

  // Calculate which day index today is in the week
  const todayIndex = dayOrder.indexOf(todayName)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display text-paz-green mb-2">
          This Week&apos;s Menu
        </h1>
        <p className="text-muted-foreground">
          Week of {new Date(weekStart + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Menu Grid */}
      {!mealPlan ? (
        <Card className="border-border">
          <CardContent className="py-12 text-center">
            <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No menu has been planned for this week yet.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Check back soon!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {dayOrder.map((day, index) => {
            const isToday = day === todayName
            const isPast = index < todayIndex
            const meals = mealsByDay[day]
            const hasMeals = meals.brunch || meals.dinner

            return (
              <Card 
                key={day} 
                className={`border-border transition-all ${
                  isToday ? 'ring-2 ring-primary shadow-md' : ''
                } ${isPast ? 'opacity-60' : ''}`}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between">
                    <span className={`text-base ${isToday ? 'text-primary' : 'text-foreground'}`}>
                      {dayLabels[day]}
                      {isToday && (
                        <span className="ml-2 text-xs font-normal bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                          Today
                        </span>
                      )}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!hasMeals ? (
                    <p className="text-sm text-muted-foreground italic">
                      Menu not yet planned
                    </p>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Brunch */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <UtensilsCrossed className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium text-foreground">Brunch</span>
                          <span className="text-xs text-muted-foreground">10:00 AM</span>
                        </div>
                        {meals.brunch?.recipes?.length ? (
                          <ul className="space-y-1 pl-6">
                            {meals.brunch.recipes.map((r) => (
                              <li key={r.id} className="text-sm text-muted-foreground">
                                {r.recipe?.name || 'Unnamed dish'}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground italic pl-6">
                            Not planned
                          </p>
                        )}
                      </div>

                      {/* Dinner */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <UtensilsCrossed className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium text-foreground">Dinner</span>
                          <span className="text-xs text-muted-foreground">6:00 PM</span>
                        </div>
                        {meals.dinner?.recipes?.length ? (
                          <ul className="space-y-1 pl-6">
                            {meals.dinner.recipes.map((r) => (
                              <li key={r.id} className="text-sm text-muted-foreground">
                                {r.recipe?.name || 'Unnamed dish'}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground italic pl-6">
                            Not planned
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
