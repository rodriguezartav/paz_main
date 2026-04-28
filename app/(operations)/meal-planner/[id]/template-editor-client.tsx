'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, 
  Eye, 
  Save, 
  Plus, 
  X, 
  ChefHat, 
  Sun, 
  Moon, 
  Clock,
  GripVertical,
  Search,
  ChevronUp,
  ChevronDown,
  Edit2
} from 'lucide-react'
import type { WeeklyMenuTemplate, WeeklyMenuTemplateMeal, WeeklyMenuTemplateMealRecipe, Recipe, DayOfWeek, RecipeRole, ServingTarget, RecipeType } from '@/lib/types'
import { updateTemplateAction, updateMealAction, addRecipeToMealAction, updateMealRecipeAction, removeRecipeFromMealAction } from '../actions'
import { cn } from '@/lib/utils'

interface TemplateEditorClientProps {
  template: WeeklyMenuTemplate
  recipes: Recipe[]
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

const RECIPE_ROLES: { value: RecipeRole; label: string }[] = [
  { value: 'main', label: 'Main' },
  { value: 'base', label: 'Base' },
  { value: 'protein', label: 'Protein' },
  { value: 'side', label: 'Side' },
  { value: 'salad', label: 'Salad' },
  { value: 'sauce', label: 'Sauce' },
  { value: 'vegetarian_alternative', label: 'Vegetarian Alternative' },
  { value: 'vegan_alternative', label: 'Vegan Alternative' },
  { value: 'extra', label: 'Extra' },
]

const SERVING_TARGETS: { value: ServingTarget; label: string }[] = [
  { value: 'everyone', label: 'Everyone' },
  { value: 'eats_all', label: 'Eats All' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'vegetarian_and_vegan', label: 'Vegetarian & Vegan' },
  { value: 'custom', label: 'Custom' },
]

const RECIPE_TYPES: { value: RecipeType | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'main', label: 'Main' },
  { value: 'side', label: 'Side' },
  { value: 'salad', label: 'Salad' },
  { value: 'soup', label: 'Soup' },
  { value: 'sauce', label: 'Sauce' },
  { value: 'dessert', label: 'Dessert' },
]

export function TemplateEditorClient({ template: initialTemplate, recipes }: TemplateEditorClientProps) {
  const router = useRouter()
  const [template, setTemplate] = useState(initialTemplate)
  const [isSaving, setIsSaving] = useState(false)
  const [editingMeal, setEditingMeal] = useState<WeeklyMenuTemplateMeal | null>(null)
  const [isAddRecipeOpen, setIsAddRecipeOpen] = useState(false)
  const [selectedMealForRecipe, setSelectedMealForRecipe] = useState<WeeklyMenuTemplateMeal | null>(null)
  const [editingRecipe, setEditingRecipe] = useState<WeeklyMenuTemplateMealRecipe | null>(null)
  
  // Add Recipe Form State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>('')
  const [recipeRole, setRecipeRole] = useState<RecipeRole>('main')
  const [servingTarget, setServingTarget] = useState<ServingTarget>('everyone')
  const [recipeNotes, setRecipeNotes] = useState('')
  const [recipeTypeFilter, setRecipeTypeFilter] = useState<RecipeType | 'all'>('all')

  // Group meals by day
  const mealsByDay = useMemo(() => {
    const grouped: Record<DayOfWeek, { brunch?: WeeklyMenuTemplateMeal; dinner?: WeeklyMenuTemplateMeal }> = {
      monday: {}, tuesday: {}, wednesday: {}, thursday: {}, friday: {}, saturday: {}, sunday: {}
    }
    
    for (const meal of template.meals || []) {
      grouped[meal.day_of_week][meal.meal_type] = meal
    }
    
    return grouped
  }, [template.meals])

  // Filter recipes for selector
  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = recipeTypeFilter === 'all' || recipe.type === recipeTypeFilter
      return matchesSearch && matchesType
    })
  }, [recipes, searchQuery, recipeTypeFilter])

  const handleSaveTemplate = async (updates: { name?: string; description?: string }) => {
    setIsSaving(true)
    try {
      const result = await updateTemplateAction(template.id, updates)
      if (result.success && result.template) {
        setTemplate({ ...template, ...result.template })
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateMeal = async (mealId: string, updates: { prep_day_offset?: number; notes?: string | null }) => {
    const result = await updateMealAction(mealId, updates)
    if (result.success && result.meal) {
      setTemplate({
        ...template,
        meals: template.meals?.map(m => m.id === mealId ? { ...m, ...result.meal } : m)
      })
      setEditingMeal(null)
    }
  }

  const handleAddRecipe = async () => {
    if (!selectedMealForRecipe || !selectedRecipeId) return
    
    setIsSaving(true)
    try {
      const result = await addRecipeToMealAction(
        selectedMealForRecipe.id,
        selectedRecipeId,
        recipeRole,
        servingTarget,
        recipeNotes || undefined
      )
      
      if (result.success && result.recipe) {
        // Update local state
        setTemplate({
          ...template,
          meals: template.meals?.map(m => {
            if (m.id === selectedMealForRecipe.id) {
              return {
                ...m,
                recipes: [...(m.recipes || []), result.recipe!]
              }
            }
            return m
          })
        })
        
        // Reset form
        setIsAddRecipeOpen(false)
        setSelectedMealForRecipe(null)
        setSelectedRecipeId('')
        setRecipeRole('main')
        setServingTarget('everyone')
        setRecipeNotes('')
        setSearchQuery('')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateRecipe = async () => {
    if (!editingRecipe) return
    
    setIsSaving(true)
    try {
      const result = await updateMealRecipeAction(editingRecipe.id, {
        recipe_role: recipeRole,
        serving_target: servingTarget,
        notes: recipeNotes || null
      })
      
      if (result.success) {
        setTemplate({
          ...template,
          meals: template.meals?.map(m => ({
            ...m,
            recipes: m.recipes?.map(r => r.id === editingRecipe.id ? { ...r, recipe_role: recipeRole, serving_target: servingTarget, notes: recipeNotes || null } : r)
          }))
        })
        setEditingRecipe(null)
        setRecipeRole('main')
        setServingTarget('everyone')
        setRecipeNotes('')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemoveRecipe = async (recipeId: string, mealId: string) => {
    const result = await removeRecipeFromMealAction(recipeId)
    if (result.success) {
      setTemplate({
        ...template,
        meals: template.meals?.map(m => {
          if (m.id === mealId) {
            return {
              ...m,
              recipes: m.recipes?.filter(r => r.id !== recipeId)
            }
          }
          return m
        })
      })
    }
  }

  const openAddRecipe = (meal: WeeklyMenuTemplateMeal) => {
    setSelectedMealForRecipe(meal)
    setRecipeTypeFilter('all')
    setIsAddRecipeOpen(true)
  }

  const openEditRecipe = (recipe: WeeklyMenuTemplateMealRecipe) => {
    setEditingRecipe(recipe)
    setRecipeRole(recipe.recipe_role)
    setServingTarget(recipe.serving_target)
    setRecipeNotes(recipe.notes || '')
  }

  const getPrepTimingLabel = (offset: number) => {
    if (offset === 0) return 'Same Day Prep'
    if (offset === -1) return 'Prep 1 Day Before'
    if (offset === -2) return 'Prep 2 Days Before'
    return `Prep ${Math.abs(offset)} Days Before`
  }

  const getRoleColor = (role: RecipeRole) => {
    switch (role) {
      case 'main': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'base': return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'protein': return 'bg-red-50 text-red-700 border-red-200'
      case 'side': return 'bg-green-50 text-green-700 border-green-200'
      case 'salad': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'sauce': return 'bg-orange-50 text-orange-700 border-orange-200'
      case 'vegetarian_alternative': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'vegan_alternative': return 'bg-lime-50 text-lime-700 border-lime-200'
      case 'extra': return 'bg-gray-50 text-gray-700 border-gray-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getTargetColor = (target: ServingTarget) => {
    switch (target) {
      case 'everyone': return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'eats_all': return 'bg-rose-50 text-rose-700 border-rose-200'
      case 'vegetarian': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'vegan': return 'bg-green-50 text-green-700 border-green-200'
      case 'vegetarian_and_vegan': return 'bg-teal-50 text-teal-700 border-teal-200'
      case 'custom': return 'bg-gray-50 text-gray-700 border-gray-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
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
            {template.description && (
              <p className="text-muted-foreground">{template.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/meal-planner/${template.id}/preview`}>
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Link>
          </Button>
        </div>
      </div>

      {/* Weekly Grid */}
      <div className="grid gap-4 lg:grid-cols-7">
        {DAYS_OF_WEEK.map((day) => {
          const dayMeals = mealsByDay[day.key]
          return (
            <div key={day.key} className="space-y-3">
              <h3 className="font-semibold text-center text-sm uppercase tracking-wide text-muted-foreground">
                {day.label}
              </h3>
              
              {/* Brunch Card */}
              <MealCard
                meal={dayMeals.brunch}
                mealType="brunch"
                dayLabel={day.label}
                onAddRecipe={openAddRecipe}
                onEditMeal={setEditingMeal}
                onEditRecipe={openEditRecipe}
                onRemoveRecipe={handleRemoveRecipe}
                getPrepTimingLabel={getPrepTimingLabel}
                getRoleColor={getRoleColor}
                getTargetColor={getTargetColor}
              />
              
              {/* Dinner Card */}
              <MealCard
                meal={dayMeals.dinner}
                mealType="dinner"
                dayLabel={day.label}
                onAddRecipe={openAddRecipe}
                onEditMeal={setEditingMeal}
                onEditRecipe={openEditRecipe}
                onRemoveRecipe={handleRemoveRecipe}
                getPrepTimingLabel={getPrepTimingLabel}
                getRoleColor={getRoleColor}
                getTargetColor={getTargetColor}
              />
            </div>
          )
        })}
      </div>

      {/* Edit Meal Dialog */}
      <Dialog open={!!editingMeal} onOpenChange={(open) => !open && setEditingMeal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Meal Settings</DialogTitle>
            <DialogDescription>
              Update prep timing and notes for this meal.
            </DialogDescription>
          </DialogHeader>
          {editingMeal && (
            <MealEditForm
              meal={editingMeal}
              onSave={handleUpdateMeal}
              onCancel={() => setEditingMeal(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Add Recipe Sheet */}
      <Sheet open={isAddRecipeOpen} onOpenChange={setIsAddRecipeOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add Recipe</SheetTitle>
            <SheetDescription>
              Add a recipe to {selectedMealForRecipe?.day_of_week} {selectedMealForRecipe?.meal_type}
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-6 py-6">
            {/* Search */}
            <div className="space-y-2">
              <Label>Search Recipes</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Recipe Type Filter */}
            <div className="space-y-2">
              <Label>Filter by Type</Label>
              <Select value={recipeTypeFilter} onValueChange={(v) => setRecipeTypeFilter(v as RecipeType | 'all')}>
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

            {/* Recipe List */}
            <div className="space-y-2">
              <Label>Select Recipe</Label>
              <div className="border rounded-lg max-h-96 overflow-y-auto">
                {filteredRecipes.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground text-center">No recipes found</p>
                ) : (
                  filteredRecipes.map((recipe) => (
                    <button
                      key={recipe.id}
                      onClick={() => setSelectedRecipeId(recipe.id)}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 text-left hover:bg-muted/50 border-b last:border-b-0 transition-colors',
                        selectedRecipeId === recipe.id && 'bg-primary/10'
                      )}
                    >
                      <ChefHat className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{recipe.name}</p>
<div className="flex items-center gap-2 mt-0.5">
                                          {recipe.type && (
                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
                                              {recipe.type}
                                            </Badge>
                                          )}
                          {recipe.suitable_for_vegan && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-green-50 text-green-700 border-green-200">
                              Vegan
                            </Badge>
                          )}
                          {recipe.suitable_for_vegetarian && !recipe.suitable_for_vegan && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-yellow-50 text-yellow-700 border-yellow-200">
                              Vegetarian
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Role & Target */}
            {selectedRecipeId && (
              <>
                <div className="space-y-2">
                  <Label>Recipe Role</Label>
                  <Select value={recipeRole} onValueChange={(v) => setRecipeRole(v as RecipeRole)}>
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
                  <Select value={servingTarget} onValueChange={(v) => setServingTarget(v as ServingTarget)}>
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

                <div className="space-y-2">
                  <Label>Notes (optional)</Label>
                  <Textarea
                    placeholder="Recipe-specific notes..."
                    value={recipeNotes}
                    onChange={(e) => setRecipeNotes(e.target.value)}
                  />
                </div>

                <Button onClick={handleAddRecipe} disabled={isSaving} className="w-full">
                  {isSaving ? 'Adding...' : 'Add Recipe'}
                </Button>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Recipe Dialog */}
      <Dialog open={!!editingRecipe} onOpenChange={(open) => !open && setEditingRecipe(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Recipe Settings</DialogTitle>
            <DialogDescription>
              Update role, serving target, and notes for {editingRecipe?.recipe?.name}
            </DialogDescription>
          </DialogHeader>
          
          {editingRecipe && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Recipe Role</Label>
                <Select value={recipeRole} onValueChange={(v) => setRecipeRole(v as RecipeRole)}>
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
                <Select value={servingTarget} onValueChange={(v) => setServingTarget(v as ServingTarget)}>
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

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Recipe-specific notes..."
                  value={recipeNotes}
                  onChange={(e) => setRecipeNotes(e.target.value)}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingRecipe(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRecipe} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Meal Card Component
function MealCard({
  meal,
  mealType,
  dayLabel,
  onAddRecipe,
  onEditMeal,
  onEditRecipe,
  onRemoveRecipe,
  getPrepTimingLabel,
  getRoleColor,
  getTargetColor
}: {
  meal?: WeeklyMenuTemplateMeal
  mealType: 'brunch' | 'dinner'
  dayLabel: string
  onAddRecipe: (meal: WeeklyMenuTemplateMeal) => void
  onEditMeal: (meal: WeeklyMenuTemplateMeal) => void
  onEditRecipe: (recipe: WeeklyMenuTemplateMealRecipe) => void
  onRemoveRecipe: (recipeId: string, mealId: string) => void
  getPrepTimingLabel: (offset: number) => string
  getRoleColor: (role: RecipeRole) => string
  getTargetColor: (target: ServingTarget) => string
}) {
  if (!meal) return null

  const hasRecipes = meal.recipes && meal.recipes.length > 0

  return (
    <Card className={cn(
      'transition-all',
      !hasRecipes && 'border-dashed'
    )}>
      <CardHeader className="p-3 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {mealType === 'brunch' ? (
              <Sun className="h-4 w-4 text-amber-500" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-500" />
            )}
            <CardTitle className="text-sm font-medium capitalize">{mealType}</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6"
            onClick={() => onEditMeal(meal)}
          >
            <Edit2 className="h-3 w-3" />
          </Button>
        </div>
        
        {/* Prep Timing */}
        {meal.prep_day_offset !== 0 && (
          <div className="flex items-center gap-1 mt-1">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">
              {getPrepTimingLabel(meal.prep_day_offset)}
            </span>
          </div>
        )}
        
        {/* Meal Notes */}
        {meal.notes && (
          <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">
            {meal.notes}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="p-3 pt-0">
        {/* Recipes */}
        {hasRecipes ? (
          <div className="space-y-2">
            {meal.recipes?.sort((a, b) => a.order_index - b.order_index).map((recipe) => (
              <div 
                key={recipe.id}
                className="group flex items-start gap-2 p-2 rounded bg-muted/50 hover:bg-muted transition-colors"
              >
                <ChefHat className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-xs font-medium truncate">{recipe.recipe?.name}</p>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className={cn('text-[9px] px-1 py-0', getRoleColor(recipe.recipe_role))}>
                      {recipe.recipe_role.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline" className={cn('text-[9px] px-1 py-0', getTargetColor(recipe.serving_target))}>
                      {recipe.serving_target.replace('_', ' ')}
                    </Badge>
                  </div>
                  {recipe.notes && (
                    <p className="text-[9px] text-muted-foreground line-clamp-1">{recipe.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5"
                    onClick={() => onEditRecipe(recipe)}
                  >
                    <Edit2 className="h-2.5 w-2.5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5 text-destructive hover:text-destructive"
                    onClick={() => onRemoveRecipe(recipe.id, meal.id)}
                  >
                    <X className="h-2.5 w-2.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-2">No recipes</p>
        )}
        
        {/* Add Recipe Button */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full mt-2 h-7 text-xs"
          onClick={() => onAddRecipe(meal)}
        >
          <Plus className="mr-1 h-3 w-3" />
          Add Recipe
        </Button>
      </CardContent>
    </Card>
  )
}

// Meal Edit Form Component
function MealEditForm({
  meal,
  onSave,
  onCancel
}: {
  meal: WeeklyMenuTemplateMeal
  onSave: (mealId: string, updates: { prep_day_offset?: number; notes?: string | null }) => void
  onCancel: () => void
}) {
  const [prepOffset, setPrepOffset] = useState(meal.prep_day_offset)
  const [notes, setNotes] = useState(meal.notes || '')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    await onSave(meal.id, {
      prep_day_offset: prepOffset,
      notes: notes || null
    })
    setIsSaving(false)
  }

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Prep Timing</Label>
        <Select value={String(prepOffset)} onValueChange={(v) => setPrepOffset(Number(v))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Same Day Prep</SelectItem>
            <SelectItem value="-1">Prep 1 Day Before</SelectItem>
            <SelectItem value="-2">Prep 2 Days Before</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          When should this meal be prepped/cooked?
        </p>
      </div>
      
      <div className="space-y-2">
        <Label>Meal Notes</Label>
        <Textarea
          placeholder="Notes for this meal slot..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogFooter>
    </div>
  )
}
