'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { 
  Calendar, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Edit,
  Users,
  Sun,
  Moon,
  RefreshCw,
  ChefHat
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WeeklyMealPlan, WeeklyMenuTemplate, Recipe } from '@/lib/types'
import { 
  createWeeklyMealPlanAction, 
  deleteWeeklyMealPlanAction, 
  refreshHeadcountsAction 
} from './actions'

interface WeeklyCalendarClientProps {
  initialPlans: WeeklyMealPlan[]
  templates: WeeklyMenuTemplate[]
  recipes: Recipe[]
}

// Helper to get Monday of a week
function getMondayOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

// Format date as YYYY-MM-DD
function formatDateString(date: Date): string {
  return date.toISOString().split('T')[0]
}

// Format date range for display
function formatWeekRange(startDate: string): string {
  const start = new Date(startDate + 'T00:00:00')
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  
  const startMonth = start.toLocaleDateString('en-US', { month: 'short' })
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' })
  
  if (startMonth === endMonth) {
    return `${startMonth} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`
  }
  return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}, ${start.getFullYear()}`
}

export function WeeklyCalendarClient({ initialPlans, templates, recipes }: WeeklyCalendarClientProps) {
  const [plans, setPlans] = useState(initialPlans)
  const [isPending, startTransition] = useTransition()
  const [currentDate, setCurrentDate] = useState(getMondayOfWeek(new Date()))
  
  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('none')
  const [planToDelete, setPlanToDelete] = useState<WeeklyMealPlan | null>(null)
  const [refreshingPlanId, setRefreshingPlanId] = useState<string | null>(null)

  // Get weeks to display (current week + 4 weeks ahead + 2 weeks back)
  const getWeeksToDisplay = () => {
    const weeks: Date[] = []
    const startWeek = new Date(currentDate)
    startWeek.setDate(startWeek.getDate() - 14) // 2 weeks back
    
    for (let i = 0; i < 7; i++) {
      const week = new Date(startWeek)
      week.setDate(week.getDate() + (i * 7))
      weeks.push(week)
    }
    return weeks
  }

  const weeks = getWeeksToDisplay()

  // Check if a plan exists for a given week
  const getPlanForWeek = (weekStart: Date): WeeklyMealPlan | undefined => {
    const weekStr = formatDateString(weekStart)
    return plans.find(p => p.week_start_date === weekStr)
  }

  // Check if week is current week
  const isCurrentWeek = (weekStart: Date): boolean => {
    const today = getMondayOfWeek(new Date())
    return formatDateString(weekStart) === formatDateString(today)
  }

  // Check if week is in the past
  const isPastWeek = (weekStart: Date): boolean => {
    const today = getMondayOfWeek(new Date())
    return weekStart < today
  }

  // Navigate weeks
  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() - 28)
    setCurrentDate(getMondayOfWeek(newDate))
  }

  const goToNextMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + 28)
    setCurrentDate(getMondayOfWeek(newDate))
  }

  const goToToday = () => {
    setCurrentDate(getMondayOfWeek(new Date()))
  }

  // Create a new plan
  const handleCreatePlan = (weekStart: Date) => {
    setCurrentDate(weekStart)
    setSelectedTemplateId('none')
    setShowCreateDialog(true)
  }

  const confirmCreatePlan = () => {
    const weekStr = formatDateString(currentDate)
    
    startTransition(async () => {
      const result = await createWeeklyMealPlanAction(
        weekStr, 
        selectedTemplateId && selectedTemplateId !== 'none' ? selectedTemplateId : null
      )
      
      if (result.success && result.plan) {
        setPlans(prev => [...prev, result.plan!].sort(
          (a, b) => new Date(b.week_start_date).getTime() - new Date(a.week_start_date).getTime()
        ))
      }
      
      setShowCreateDialog(false)
    })
  }

  // Delete a plan
  const handleDeletePlan = (plan: WeeklyMealPlan) => {
    setPlanToDelete(plan)
  }

  const confirmDeletePlan = () => {
    if (!planToDelete) return
    
    startTransition(async () => {
      const result = await deleteWeeklyMealPlanAction(planToDelete.id)
      
      if (result.success) {
        setPlans(prev => prev.filter(p => p.id !== planToDelete.id))
      }
      
      setPlanToDelete(null)
    })
  }

  // Refresh headcounts
  const handleRefreshHeadcounts = (plan: WeeklyMealPlan) => {
    setRefreshingPlanId(plan.id)
    
    startTransition(async () => {
      const result = await refreshHeadcountsAction(plan.id)
      
      if (result.success && result.plan) {
        setPlans(prev => prev.map(p => p.id === plan.id ? result.plan! : p))
      }
      
      setRefreshingPlanId(null)
    })
  }

  // Calculate total headcount for a plan
  const getTotalHeadcount = (plan: WeeklyMealPlan): { total: number; eatsAll: number; veg: number; vegan: number } => {
    if (!plan.meals || plan.meals.length === 0) {
      return { total: 0, eatsAll: 0, veg: 0, vegan: 0 }
    }
    
    // Just use the first meal's headcount as representative
    const firstMeal = plan.meals[0]
    return {
      total: firstMeal.headcount_eats_all + firstMeal.headcount_vegetarian + firstMeal.headcount_vegan,
      eatsAll: firstMeal.headcount_eats_all,
      veg: firstMeal.headcount_vegetarian,
      vegan: firstMeal.headcount_vegan
    }
  }

  // Count recipes in a plan
  const getRecipeCount = (plan: WeeklyMealPlan): number => {
    if (!plan.meals) return 0
    return plan.meals.reduce((acc, meal) => acc + (meal.recipes?.length || 0), 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Weekly Calendar</h1>
          <p className="text-muted-foreground">Plan meals and track headcounts for each week</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Weeks Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {weeks.map((weekStart) => {
          const plan = getPlanForWeek(weekStart)
          const isCurrent = isCurrentWeek(weekStart)
          const isPast = isPastWeek(weekStart)
          const weekStr = formatDateString(weekStart)
          
          return (
            <Card 
              key={weekStr}
              className={cn(
                "relative overflow-hidden transition-all",
                isCurrent && "ring-2 ring-primary",
                isPast && !plan && "opacity-50"
              )}
            >
              {isCurrent && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
              )}
              
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {formatWeekRange(weekStr)}
                  </CardTitle>
                  {isCurrent && (
                    <Badge variant="default" className="text-xs">Current</Badge>
                  )}
                </div>
                {plan && plan.template && (
                  <CardDescription className="text-xs">
                    Template: {plan.template.name}
                  </CardDescription>
                )}
              </CardHeader>
              
              <CardContent>
                {plan ? (
                  <div className="space-y-3">
                    {/* Headcount Summary */}
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{getTotalHeadcount(plan).total} people</span>
                      <div className="flex gap-1 ml-auto">
                        {getTotalHeadcount(plan).eatsAll > 0 && (
                          <Badge variant="outline" className="text-xs px-1.5 py-0">
                            {getTotalHeadcount(plan).eatsAll}
                          </Badge>
                        )}
                        {getTotalHeadcount(plan).veg > 0 && (
                          <Badge variant="outline" className="text-xs px-1.5 py-0 bg-yellow-50 text-yellow-700 border-yellow-200">
                            {getTotalHeadcount(plan).veg}
                          </Badge>
                        )}
                        {getTotalHeadcount(plan).vegan > 0 && (
                          <Badge variant="outline" className="text-xs px-1.5 py-0 bg-emerald-50 text-emerald-700 border-emerald-200">
                            {getTotalHeadcount(plan).vegan}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* Recipe Count */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ChefHat className="h-4 w-4" />
                      <span>{getRecipeCount(plan)} recipes assigned</span>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Link href={`/weekly-calendar/${plan.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Edit className="mr-1.5 h-3.5 w-3.5" />
                          Edit
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleRefreshHeadcounts(plan)}
                        disabled={refreshingPlanId === plan.id}
                      >
                        <RefreshCw className={cn(
                          "h-3.5 w-3.5",
                          refreshingPlanId === plan.id && "animate-spin"
                        )} />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleDeletePlan(plan)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">No plan created</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleCreatePlan(weekStart)}
                      disabled={isPending}
                    >
                      <Plus className="mr-1.5 h-3.5 w-3.5" />
                      Create Plan
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Create Plan Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Weekly Plan</DialogTitle>
            <DialogDescription>
              Create a meal plan for {formatWeekRange(formatDateString(currentDate))}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Start from Template (optional)</Label>
              <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                <SelectTrigger>
                  <SelectValue placeholder="No template - start empty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No template - start empty</SelectItem>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Headcounts will be auto-populated from current residents
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmCreatePlan} disabled={isPending}>
              {isPending ? 'Creating...' : 'Create Plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!planToDelete} onOpenChange={() => setPlanToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Weekly Plan?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the meal plan for{' '}
              {planToDelete && formatWeekRange(planToDelete.week_start_date)}.
              All assigned recipes and headcount data will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePlan}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
