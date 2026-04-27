import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getWeeklyMenuTemplateById } from '@/lib/db/queries'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, Sun, Moon, Clock, ChefHat } from 'lucide-react'
import type { DayOfWeek, WeeklyMenuTemplateMeal, RecipeRole, ServingTarget } from '@/lib/types'
import { cn } from '@/lib/utils'

export const metadata = {
  title: 'Preview Template - Meal Planner',
  description: 'Preview weekly menu template'
}

interface PageProps {
  params: Promise<{ id: string }>
}

const DAYS_OF_WEEK: { key: DayOfWeek; label: string }[] = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
]

function getPrepTimingLabel(offset: number) {
  if (offset === 0) return null
  if (offset === -1) return 'Prep 1 day before'
  if (offset === -2) return 'Prep 2 days before'
  return `Prep ${Math.abs(offset)} days before`
}

function getRoleLabel(role: RecipeRole) {
  return role.replace(/_/g, ' ')
}

function getTargetLabel(target: ServingTarget) {
  return target.replace(/_/g, ' ')
}

export default async function TemplatePreviewPage({ params }: PageProps) {
  const { id } = await params
  const template = await getWeeklyMenuTemplateById(id)
  
  if (!template) {
    notFound()
  }

  // Group meals by day
  const mealsByDay: Record<DayOfWeek, { brunch?: WeeklyMenuTemplateMeal; dinner?: WeeklyMenuTemplateMeal }> = {
    monday: {}, tuesday: {}, wednesday: {}, thursday: {}, friday: {}, saturday: {}, sunday: {}
  }
  
  for (const meal of template.meals || []) {
    mealsByDay[meal.day_of_week][meal.meal_type] = meal
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/meal-planner">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{template.name}</h1>
            <p className="text-muted-foreground">Weekly Menu Preview</p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/meal-planner/${template.id}`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Template
          </Link>
        </Button>
      </div>

      {/* Description */}
      {template.description && (
        <p className="text-muted-foreground">{template.description}</p>
      )}

      {/* Weekly Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-4 font-semibold text-sm">Day</th>
                <th className="text-left p-4 font-semibold text-sm">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4 text-amber-500" />
                    Brunch
                  </div>
                </th>
                <th className="text-left p-4 font-semibold text-sm">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4 text-indigo-500" />
                    Dinner
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {DAYS_OF_WEEK.map((day, index) => {
                const dayMeals = mealsByDay[day.key]
                return (
                  <tr key={day.key} className={cn(
                    'border-b last:border-b-0',
                    index % 2 === 0 ? 'bg-background' : 'bg-muted/30'
                  )}>
                    <td className="p-4 font-medium align-top">
                      {day.label}
                    </td>
                    <td className="p-4 align-top">
                      <MealPreviewCell meal={dayMeals.brunch} />
                    </td>
                    <td className="p-4 align-top">
                      <MealPreviewCell meal={dayMeals.dinner} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="rounded-lg border bg-card p-4">
        <h3 className="font-semibold mb-3">Legend</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Recipe Roles</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">main</Badge>
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">base</Badge>
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">protein</Badge>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">side</Badge>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">salad</Badge>
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">sauce</Badge>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">veg alt</Badge>
              <Badge variant="outline" className="bg-lime-50 text-lime-700 border-lime-200">vegan alt</Badge>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Serving Targets</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">everyone</Badge>
              <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">eats all</Badge>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">vegetarian</Badge>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">vegan</Badge>
              <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">veg & vegan</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MealPreviewCell({ meal }: { meal?: WeeklyMenuTemplateMeal }) {
  if (!meal) {
    return <span className="text-muted-foreground text-sm">-</span>
  }

  const prepTiming = getPrepTimingLabel(meal.prep_day_offset)
  const recipes = meal.recipes?.sort((a, b) => a.order_index - b.order_index) || []

  if (recipes.length === 0) {
    return (
      <div className="space-y-1">
        <span className="text-muted-foreground text-sm italic">No recipes assigned</span>
        {prepTiming && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {prepTiming}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {recipes.map((recipe) => (
        <div key={recipe.id} className="space-y-1">
          <div className="flex items-start gap-2">
            <ChefHat className="h-3.5 w-3.5 mt-0.5 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">{recipe.recipe?.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-xs text-muted-foreground">
                  {getRoleLabel(recipe.recipe_role)}
                </span>
                <span className="text-xs text-muted-foreground">/</span>
                <span className="text-xs text-muted-foreground">
                  {getTargetLabel(recipe.serving_target)}
                </span>
              </div>
              {recipe.notes && (
                <p className="text-xs text-muted-foreground mt-0.5 italic">{recipe.notes}</p>
              )}
            </div>
          </div>
        </div>
      ))}
      
      {prepTiming && (
        <div className="flex items-center gap-1 text-xs text-amber-600 mt-2 pt-2 border-t">
          <Clock className="h-3 w-3" />
          {prepTiming}
        </div>
      )}
      
      {meal.notes && (
        <p className="text-xs text-muted-foreground italic pt-1 border-t">
          {meal.notes}
        </p>
      )}
    </div>
  )
}
