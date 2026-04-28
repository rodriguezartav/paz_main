'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  ArrowLeft, 
  Sun, 
  Moon, 
  Users, 
  Plus, 
  X,
  RefreshCw,
  ChefHat,
  Leaf,
  Drumstick
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WeeklyMealPlan, WeeklyMealPlanMeal, Recipe, DayOfWeek, MealType, RecipeRole, ServingTarget, RecipeType } from '@/lib/types'
import { 
  updateMealHeadcountsAction, 
  addRecipeToMealAction, 
  removeRecipeFromMealAction,
  refreshHeadcountsAction 
} from '../actions'

interface WeekEditorClientProps {
  plan: WeeklyMealPlan
  recipes: Recipe[]
}

const DAYS_OF_WEEK: { key: DayOfWeek; label: string; short: string }[] = [
  { key: 'monday', label: 'Monday', short: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'thursday', label: 'Thursday', short: 'Thu' },
  { key: 'friday', label: 'Friday', short: 'Fri' },
  { key: 'saturday', label: 'Saturday', short: 'Sat' },
  { key: 'sunday', label: 'Sunday', short: 'Sun' },
]

const RECIPE_ROLES: { value: RecipeRole; label: string }[] = [
  { value: 'main', label: 'Main Dish' },
  { value: 'base', label: 'Base (rice, pasta)' },
  { value: 'protein', label: 'Protein' },
  { value: 'side', label: 'Side Dish' },
  { value: 'salad', label: 'Salad' },
  { value: 'sauce', label: 'Sauce/Dressing' },
  { value: 'vegetarian_alternative', label: 'Vegetarian Alternative' },
  { value: 'vegan_alternative', label: 'Vegan Alternative' },
  { value: 'extra', label: 'Extra' },
]

const SERVING_TARGETS: { value: ServingTarget; label: string }[] = [
  { value: 'everyone', label: 'Everyone' },
  { value: 'eats_all', label: 'Eats All Only' },
  { value: 'vegetarian', label: 'Vegetarian Only' },
  { value: 'vegan', label: 'Vegan Only' },
  { value: 'vegetarian_and_vegan', label: 'Vegetarian + Vegan' },
]

const RECIPE_TYPES: { value: RecipeType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'main', label: 'Main' },
  { value: 'side', label: 'Side' },
  { value: 'salad', label: 'Salad' },
  { value: 'soup', label: 'Soup' },
  { value: 'sauce', label: 'Sauce' },
  { value: 'dessert', label: 'Dessert' },
]

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

// Get date for a specific day of the week
function getDateForDay(weekStart: string, dayIndex: number): string {
  const start = new Date(weekStart + 'T00:00:00')
  start.setDate(start.getDate() + dayIndex)
  return start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function WeekEditorClient({ plan: initialPlan, recipes }: WeekEditorClientProps) {
  const [plan, setPlan] = useState(initialPlan)
  const [isPending, startTransition] = useTransition()
  
  // Dialog states
  const [editingMeal, setEditingMeal] = useState<WeeklyMealPlanMeal | null>(null)
  const [addingRecipeToMeal, setAddingRecipeToMeal] = useState<WeeklyMealPlanMeal | null>(null)
  const [selectedRecipeId, setSelectedRecipeId] = useState('')
  const [selectedRole, setSelectedRole] = useState<RecipeRole>('main')
  const [selectedTarget, setSelectedTarget] = useState<ServingTarget>('everyone')
  const [recipeTypeFilter, setRecipeTypeFilter] = useState<RecipeType | 'all'>('all')
  
  // Headcount editing
  const [headcountEatsAll, setHeadcountEatsAll] = useState(0)
  const [headcountVegetarian, setHeadcountVegetarian] = useState(0)
  const [headcountVegan, setHeadcountVegan] = useState(0)

  // Get meal for a specific day and type
  const getMeal = (dayOfWeek: DayOfWeek, mealType: MealType): WeeklyMealPlanMeal | undefined => {
    return plan.meals?.find(m => m.day_of_week === dayOfWeek && m.meal_type === mealType)
  }

  // Open headcount editor
  const openHeadcountEditor = (meal: WeeklyMealPlanMeal) => {
    setHeadcountEatsAll(meal.headcount_eats_all)
    setHeadcountVegetarian(meal.headcount_vegetarian)
    setHeadcountVegan(meal.headcount_vegan)
    setEditingMeal(meal)
  }

  // Save headcount changes
  const saveHeadcounts = () => {
    if (!editingMeal) return
    
    startTransition(async () => {
      const result = await updateMealHeadcountsAction(editingMeal.id, {
        headcount_eats_all: headcountEatsAll,
        headcount_vegetarian: headcountVegetarian,
        headcount_vegan: headcountVegan
      })
      
      if (result.success && result.meal) {
        setPlan(prev => ({
          ...prev,
          meals: prev.meals?.map(m => m.id === editingMeal.id ? result.meal! : m)
        }))
      }
      
      setEditingMeal(null)
    })
  }

  // Add recipe to meal
  const openAddRecipe = (meal: WeeklyMealPlanMeal) => {
    setSelectedRecipeId('')
    setSelectedRole('main')
    setSelectedTarget('everyone')
    setRecipeTypeFilter('all')
    setAddingRecipeToMeal(meal)
  }

  const confirmAddRecipe = () => {
    if (!addingRecipeToMeal || !selectedRecipeId) return
    
    startTransition(async () => {
      const result = await addRecipeToMealAction(
        addingRecipeToMeal.id,
        selectedRecipeId,
        selectedRole,
        selectedTarget
      )
      
      if (result.success && result.recipe) {
        setPlan(prev => ({
          ...prev,
          meals: prev.meals?.map(m => {
            if (m.id === addingRecipeToMeal.id) {
              return {
                ...m,
                recipes: [...(m.recipes || []), result.recipe!]
              }
            }
            return m
          })
        }))
      }
      
      setAddingRecipeToMeal(null)
    })
  }

  // Remove recipe from meal
  const removeRecipe = (mealId: string, recipeAssignmentId: string) => {
    startTransition(async () => {
      const result = await removeRecipeFromMealAction(recipeAssignmentId)
      
      if (result.success) {
        setPlan(prev => ({
          ...prev,
          meals: prev.meals?.map(m => {
            if (m.id === mealId) {
              return {
                ...m,
                recipes: m.recipes?.filter(r => r.id !== recipeAssignmentId)
              }
            }
            return m
          })
        }))
      }
    })
  }

  // Refresh all headcounts
  const refreshAllHeadcounts = () => {
    startTransition(async () => {
      const result = await refreshHeadcountsAction(plan.id)
      
      if (result.success && result.plan) {
        setPlan(result.plan)
      }
    })
  }

  // Filter recipes by recipe type only
  const getFilteredRecipes = (): Recipe[] => {
    if (recipeTypeFilter === 'all') return recipes
    return recipes.filter(r => r.type === recipeTypeFilter)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/weekly-calendar">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Week of {formatWeekRange(plan.week_start_date)}
            </h1>
            {plan.template && (
              <p className="text-muted-foreground">Based on template: {plan.template.name}</p>
            )}
          </div>
        </div>
        <Button variant="outline" onClick={refreshAllHeadcounts} disabled={isPending}>
          <RefreshCw className={cn("mr-2 h-4 w-4", isPending && "animate-spin")} />
          Refresh Headcounts
        </Button>
      </div>

      {/* Week Grid */}
      <div className="grid gap-4 lg:grid-cols-7">
        {DAYS_OF_WEEK.map((day, dayIndex) => (
          <div key={day.key} className="space-y-3">
            {/* Day Header */}
            <div className="text-center">
              <h3 className="font-semibold text-foreground">{day.label}</h3>
              <p className="text-xs text-muted-foreground">
                {getDateForDay(plan.week_start_date, dayIndex)}
              </p>
            </div>

            {/* Brunch Card */}
            {(['brunch', 'dinner'] as MealType[]).map((mealType) => {
              const meal = getMeal(day.key, mealType)
              if (!meal) return null
              
              const totalHeadcount = meal.headcount_eats_all + meal.headcount_vegetarian + meal.headcount_vegan
              
              return (
                <Card key={mealType} className="overflow-hidden">
                  <CardHeader className="py-2 px-3 bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {mealType === 'brunch' ? (
                          <Sun className="h-3.5 w-3.5 text-amber-500" />
                        ) : (
                          <Moon className="h-3.5 w-3.5 text-indigo-500" />
                        )}
                        <CardTitle className="text-xs font-medium capitalize">
                          {mealType}
                        </CardTitle>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => openHeadcountEditor(meal)}
                      >
                        <Users className="h-3 w-3 mr-1" />
                        {totalHeadcount}
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-2 space-y-2">
                    {/* Headcount Breakdown */}
                    <div className="flex gap-1 text-xs">
                      {meal.headcount_eats_all > 0 && (
                        <Badge variant="outline" className="px-1.5 py-0 gap-0.5">
                          <Drumstick className="h-2.5 w-2.5" />
                          {meal.headcount_eats_all}
                        </Badge>
                      )}
                      {meal.headcount_vegetarian > 0 && (
                        <Badge variant="outline" className="px-1.5 py-0 gap-0.5 bg-yellow-50 text-yellow-700 border-yellow-200">
                          <Leaf className="h-2.5 w-2.5" />
                          {meal.headcount_vegetarian}
                        </Badge>
                      )}
                      {meal.headcount_vegan > 0 && (
                        <Badge variant="outline" className="px-1.5 py-0 gap-0.5 bg-emerald-50 text-emerald-700 border-emerald-200">
                          <Leaf className="h-2.5 w-2.5" />
                          {meal.headcount_vegan}
                        </Badge>
                      )}
                    </div>

                    {/* Recipes */}
                    <div className="space-y-1">
                      {meal.recipes && meal.recipes.length > 0 ? (
                        meal.recipes.map((recipeAssignment) => (
                          <div 
                            key={recipeAssignment.id}
                            className="flex items-start justify-between gap-1 text-xs p-1.5 rounded bg-muted/30 group"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">
                                {recipeAssignment.recipe?.name}
                              </p>
                              <p className="text-muted-foreground capitalize text-[10px]">
                                {recipeAssignment.recipe_role.replace(/_/g, ' ')}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeRecipe(meal.id, recipeAssignment.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground text-center py-2">
                          No recipes
                        </p>
                      )}
                    </div>

                    {/* Add Recipe Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-7 text-xs"
                      onClick={() => openAddRecipe(meal)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Recipe
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ))}
      </div>

      {/* Edit Headcount Dialog */}
      <Dialog open={!!editingMeal} onOpenChange={() => setEditingMeal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Headcount</DialogTitle>
            <DialogDescription>
              Set the number of people eating for this meal
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Drumstick className="h-3.5 w-3.5" />
                  Eats All
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={headcountEatsAll}
                  onChange={(e) => setHeadcountEatsAll(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1 text-yellow-700">
                  <Leaf className="h-3.5 w-3.5" />
                  Vegetarian
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={headcountVegetarian}
                  onChange={(e) => setHeadcountVegetarian(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1 text-emerald-700">
                  <Leaf className="h-3.5 w-3.5" />
                  Vegan
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={headcountVegan}
                  onChange={(e) => setHeadcountVegan(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Total: {headcountEatsAll + headcountVegetarian + headcountVegan} people
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMeal(null)}>
              Cancel
            </Button>
            <Button onClick={saveHeadcounts} disabled={isPending}>
              {isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Recipe Dialog */}
      <Dialog open={!!addingRecipeToMeal} onOpenChange={() => setAddingRecipeToMeal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Recipe</DialogTitle>
            <DialogDescription>
              Add a recipe to this meal
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Filter by Type</Label>
              <Select value={recipeTypeFilter} onValueChange={(v) => {
                setRecipeTypeFilter(v as RecipeType | 'all')
                setSelectedRecipeId('') // Reset selection when filter changes
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RECIPE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Recipe</Label>
              <Select value={selectedRecipeId} onValueChange={setSelectedRecipeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a recipe" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {getFilteredRecipes().map((recipe) => (
                    <SelectItem key={recipe.id} value={recipe.id}>
                      <div className="flex items-center gap-2">
                        <ChefHat className="h-3.5 w-3.5" />
                        {recipe.name}
                        {recipe.type && (
                          <Badge variant="secondary" className="text-[10px] px-1 py-0 capitalize">{recipe.type}</Badge>
                        )}
                        {recipe.suitable_for_vegan && (
                          <Badge variant="outline" className="text-[10px] px-1 py-0 bg-emerald-50 text-emerald-700">V</Badge>
                        )}
                        {recipe.suitable_for_vegetarian && !recipe.suitable_for_vegan && (
                          <Badge variant="outline" className="text-[10px] px-1 py-0 bg-yellow-50 text-yellow-700">VG</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as RecipeRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RECIPE_ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Serving Target</Label>
              <Select value={selectedTarget} onValueChange={(v) => setSelectedTarget(v as ServingTarget)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SERVING_TARGETS.map((target) => (
                    <SelectItem key={target.value} value={target.value}>
                      {target.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddingRecipeToMeal(null)}>
              Cancel
            </Button>
            <Button onClick={confirmAddRecipe} disabled={isPending || !selectedRecipeId}>
              {isPending ? 'Adding...' : 'Add Recipe'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
