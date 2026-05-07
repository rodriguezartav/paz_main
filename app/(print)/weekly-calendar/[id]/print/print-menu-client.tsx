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
      <div className="max-w-[1000px] mx-auto px-8 py-10 print:px-4 print:py-4 print:max-w-none">
        {/* Header */}
        <header className="flex items-center justify-center gap-6 mb-8 pb-4 border-b-2 border-gray-300">
          {/* QR Code */}
          <img 
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/static-qr-code-c7f8eca5609b48965aa23516a65c4e1b-onkN7YKw1kRRQtzqkMogcKMa53n3DY.png"
            alt="QR Code"
            className="w-16 h-16 print:w-14 print:h-14"
          />
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight mb-1">Paz Kitchen Menu</h1>
            <p className="text-lg text-gray-600">
              {formatWeekRange(plan.week_start_date)}
            </p>
            {plan.template && (
              <p className="text-sm text-gray-500 mt-1">Template: {plan.template.name}</p>
            )}
          </div>
        </header>

        {/* Menu Days - 2 Column Grid */}
        <div className="grid grid-cols-2 gap-4">
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
                <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
                  <h2 className="text-sm font-bold">
                    {day.label}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {getDateForDay(plan.week_start_date, dayIndex).split(',').slice(1).join(',').trim()}
                  </p>
                </div>
                
                {/* Meals */}
                <div className="divide-y divide-gray-200">
                  {/* Brunch */}
                  {brunchRecipes.length > 0 && (
                    <div className="px-4 py-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Sun className="h-4 w-4 text-amber-500 print:text-gray-600" />
                        <h3 className="font-semibold text-sm">Brunch</h3>
                        {brunchMeal && (
                          <span className="text-xs text-gray-500 ml-auto">
                            {brunchMeal.headcount_eats_all + brunchMeal.headcount_vegetarian + brunchMeal.headcount_vegan}p
                            {(brunchMeal.headcount_vegetarian > 0 || brunchMeal.headcount_vegan > 0) && (
                              <span className="ml-1">
                                ({brunchMeal.headcount_vegetarian > 0 && `${brunchMeal.headcount_vegetarian}V`}
                                {brunchMeal.headcount_vegetarian > 0 && brunchMeal.headcount_vegan > 0 && ', '}
                                {brunchMeal.headcount_vegan > 0 && `${brunchMeal.headcount_vegan}VG`})
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                        {brunchRecipes.map((recipeAssignment) => (
                          <div 
                            key={recipeAssignment.id}
                            className="flex items-start gap-2"
                          >
                            {/* Checkbox */}
                            <div className="flex-shrink-0 mt-0.5">
                              <div className="w-4 h-4 border-2 border-gray-400 rounded" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm leading-tight">
                                {recipeAssignment.recipe?.name}
                              </p>
                              <div className="flex items-center gap-1 flex-wrap text-xs text-gray-500">
                                <span className="capitalize">{recipeAssignment.recipe_role.replace(/_/g, ' ')}</span>
                                {recipeAssignment.serving_target !== 'everyone' && (
                                  <Badge variant="outline" className="text-[10px] px-1 py-0 print:border-gray-400">
                                    {recipeAssignment.serving_target.replace(/_/g, ' ')}
                                  </Badge>
                                )}
                                {recipeAssignment.recipe?.suitable_for_vegan && (
                                  <Badge className="text-[10px] px-1 py-0 bg-emerald-100 text-emerald-700 print:bg-gray-100 print:text-gray-700">
                                    VG
                                  </Badge>
                                )}
                                {recipeAssignment.recipe?.suitable_for_vegetarian && !recipeAssignment.recipe?.suitable_for_vegan && (
                                  <Badge className="text-[10px] px-1 py-0 bg-yellow-100 text-yellow-700 print:bg-gray-100 print:text-gray-700">
                                    V
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
                    <div className="px-4 py-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Moon className="h-4 w-4 text-indigo-500 print:text-gray-600" />
                        <h3 className="font-semibold text-sm">Dinner</h3>
                        {dinnerMeal && (
                          <span className="text-xs text-gray-500 ml-auto">
                            {dinnerMeal.headcount_eats_all + dinnerMeal.headcount_vegetarian + dinnerMeal.headcount_vegan}p
                            {(dinnerMeal.headcount_vegetarian > 0 || dinnerMeal.headcount_vegan > 0) && (
                              <span className="ml-1">
                                ({dinnerMeal.headcount_vegetarian > 0 && `${dinnerMeal.headcount_vegetarian}V`}
                                {dinnerMeal.headcount_vegetarian > 0 && dinnerMeal.headcount_vegan > 0 && ', '}
                                {dinnerMeal.headcount_vegan > 0 && `${dinnerMeal.headcount_vegan}VG`})
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                        {dinnerRecipes.map((recipeAssignment) => (
                          <div 
                            key={recipeAssignment.id}
                            className="flex items-start gap-2"
                          >
                            {/* Checkbox */}
                            <div className="flex-shrink-0 mt-0.5">
                              <div className="w-4 h-4 border-2 border-gray-400 rounded" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm leading-tight">
                                {recipeAssignment.recipe?.name}
                              </p>
                              <div className="flex items-center gap-1 flex-wrap text-xs text-gray-500">
                                <span className="capitalize">{recipeAssignment.recipe_role.replace(/_/g, ' ')}</span>
                                {recipeAssignment.serving_target !== 'everyone' && (
                                  <Badge variant="outline" className="text-[10px] px-1 py-0 print:border-gray-400">
                                    {recipeAssignment.serving_target.replace(/_/g, ' ')}
                                  </Badge>
                                )}
                                {recipeAssignment.recipe?.suitable_for_vegan && (
                                  <Badge className="text-[10px] px-1 py-0 bg-emerald-100 text-emerald-700 print:bg-gray-100 print:text-gray-700">
                                    VG
                                  </Badge>
                                )}
                                {recipeAssignment.recipe?.suitable_for_vegetarian && !recipeAssignment.recipe?.suitable_for_vegan && (
                                  <Badge className="text-[10px] px-1 py-0 bg-yellow-100 text-yellow-700 print:bg-gray-100 print:text-gray-700">
                                    V
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
        <div className="col-span-2 mt-6 pt-4 border-t-2 border-gray-300">
          <h3 className="font-semibold text-sm mb-2">Notes</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg min-h-[80px] p-3">
            {/* Empty space for handwritten notes */}
          </div>
        </div>

        {/* Footer */}
        <footer className="col-span-2 mt-4 text-center text-xs text-gray-400">
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
