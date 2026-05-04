'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sun, Moon, Printer, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { WeeklyMealPlan, WeeklyMealPlanMeal, DayOfWeek, MealType } from '@/lib/types'

interface PrintMenuClientProps {
  plan: WeeklyMealPlan
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

function formatWeekRange(startDate: string): string {
  const start = new Date(startDate + 'T00:00:00')
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  
  const startMonth = start.toLocaleDateString('en-US', { month: 'long' })
  const endMonth = end.toLocaleDateString('en-US', { month: 'long' })
  
  if (startMonth === endMonth) {
    return `${startMonth} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`
  }
  return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}, ${start.getFullYear()}`
}

function getDateForDay(weekStart: string, dayIndex: number): string {
  const start = new Date(weekStart + 'T00:00:00')
  start.setDate(start.getDate() + dayIndex)
  return start.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

export function PrintMenuClient({ plan }: PrintMenuClientProps) {
  const getMeal = (dayOfWeek: DayOfWeek, mealType: MealType): WeeklyMealPlanMeal | undefined => {
    return plan.meals?.find(m => m.day_of_week === dayOfWeek && m.meal_type === mealType)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Print Controls - Hidden when printing */}
      <div className="print:hidden sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
        <Link href={`/weekly-calendar/${plan.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Editor
          </Button>
        </Link>
        <Button onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-2" />
          Print Menu
        </Button>
      </div>

      {/* Printable Content */}
      <div className="max-w-[800px] mx-auto px-8 py-10 print:px-0 print:py-0 print:max-w-none">
        {/* Header */}
        <header className="text-center mb-10 pb-6 border-b-2 border-gray-300">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Paz Kitchen Menu</h1>
          <p className="text-xl text-gray-600">
            {formatWeekRange(plan.week_start_date)}
          </p>
          {plan.template && (
            <p className="text-sm text-gray-500 mt-1">Template: {plan.template.name}</p>
          )}
        </header>

        {/* Menu Days */}
        <div className="space-y-8">
          {DAYS_OF_WEEK.map((day, dayIndex) => {
            const brunchMeal = getMeal(day.key, 'brunch')
            const dinnerMeal = getMeal(day.key, 'dinner')
            
            const brunchRecipes = brunchMeal?.recipes || []
            const dinnerRecipes = dinnerMeal?.recipes || []
            
            // Skip days with no recipes
            if (brunchRecipes.length === 0 && dinnerRecipes.length === 0) return null
            
            return (
              <div key={day.key} className="break-inside-avoid border border-gray-300 rounded-lg overflow-hidden">
                {/* Day Header */}
                <div className="bg-gray-100 px-6 py-3 border-b border-gray-300">
                  <h2 className="text-lg font-bold">
                    {getDateForDay(plan.week_start_date, dayIndex)}
                  </h2>
                </div>
                
                {/* Meals */}
                <div className="divide-y divide-gray-200">
                  {/* Brunch */}
                  {brunchRecipes.length > 0 && (
                    <div className="px-6 py-4">
                      <div className="flex items-center gap-3 mb-4">
                        <Sun className="h-5 w-5 text-amber-500 print:text-gray-600" />
                        <h3 className="font-semibold text-base">Brunch</h3>
                        {brunchMeal && (
                          <span className="text-sm text-gray-500 ml-auto">
                            {brunchMeal.headcount_eats_all + brunchMeal.headcount_vegetarian + brunchMeal.headcount_vegan} people
                            <span className="text-xs ml-2">
                              ({brunchMeal.headcount_eats_all} all, {brunchMeal.headcount_vegetarian} veg, {brunchMeal.headcount_vegan} vegan)
                            </span>
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-3 ml-8">
                        {brunchRecipes.map((recipeAssignment) => (
                          <div 
                            key={recipeAssignment.id}
                            className="flex items-start gap-4"
                          >
                            {/* Checkbox */}
                            <div className="flex-shrink-0 mt-1">
                              <div className="w-5 h-5 border-2 border-gray-400 rounded" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-base">
                                {recipeAssignment.recipe?.name}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                                <span className="capitalize">{recipeAssignment.recipe_role.replace(/_/g, ' ')}</span>
                                {recipeAssignment.serving_target !== 'everyone' && (
                                  <Badge variant="outline" className="text-xs print:border-gray-400">
                                    {recipeAssignment.serving_target.replace(/_/g, ' ')}
                                  </Badge>
                                )}
                                {recipeAssignment.recipe?.suitable_for_vegan && (
                                  <Badge className="text-xs bg-emerald-100 text-emerald-700 print:bg-gray-100 print:text-gray-700">
                                    Vegan
                                  </Badge>
                                )}
                                {recipeAssignment.recipe?.suitable_for_vegetarian && !recipeAssignment.recipe?.suitable_for_vegan && (
                                  <Badge className="text-xs bg-yellow-100 text-yellow-700 print:bg-gray-100 print:text-gray-700">
                                    Vegetarian
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Dinner */}
                  {dinnerRecipes.length > 0 && (
                    <div className="px-6 py-4">
                      <div className="flex items-center gap-3 mb-4">
                        <Moon className="h-5 w-5 text-indigo-500 print:text-gray-600" />
                        <h3 className="font-semibold text-base">Dinner</h3>
                        {dinnerMeal && (
                          <span className="text-sm text-gray-500 ml-auto">
                            {dinnerMeal.headcount_eats_all + dinnerMeal.headcount_vegetarian + dinnerMeal.headcount_vegan} people
                            <span className="text-xs ml-2">
                              ({dinnerMeal.headcount_eats_all} all, {dinnerMeal.headcount_vegetarian} veg, {dinnerMeal.headcount_vegan} vegan)
                            </span>
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-3 ml-8">
                        {dinnerRecipes.map((recipeAssignment) => (
                          <div 
                            key={recipeAssignment.id}
                            className="flex items-start gap-4"
                          >
                            {/* Checkbox */}
                            <div className="flex-shrink-0 mt-1">
                              <div className="w-5 h-5 border-2 border-gray-400 rounded" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-base">
                                {recipeAssignment.recipe?.name}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                                <span className="capitalize">{recipeAssignment.recipe_role.replace(/_/g, ' ')}</span>
                                {recipeAssignment.serving_target !== 'everyone' && (
                                  <Badge variant="outline" className="text-xs print:border-gray-400">
                                    {recipeAssignment.serving_target.replace(/_/g, ' ')}
                                  </Badge>
                                )}
                                {recipeAssignment.recipe?.suitable_for_vegan && (
                                  <Badge className="text-xs bg-emerald-100 text-emerald-700 print:bg-gray-100 print:text-gray-700">
                                    Vegan
                                  </Badge>
                                )}
                                {recipeAssignment.recipe?.suitable_for_vegetarian && !recipeAssignment.recipe?.suitable_for_vegan && (
                                  <Badge className="text-xs bg-yellow-100 text-yellow-700 print:bg-gray-100 print:text-gray-700">
                                    Vegetarian
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Notes Section */}
        <div className="mt-10 pt-6 border-t-2 border-gray-300">
          <h3 className="font-semibold mb-3">Notes</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg min-h-[120px] p-4">
            {/* Empty space for handwritten notes */}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-gray-400 print:mt-6">
          <p>Paz Kitchen - Printed Menu</p>
        </footer>
      </div>

      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 1.5cm;
          }
          
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .break-inside-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  )
}
