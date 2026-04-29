'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Loader2, ShoppingCart, Package, ClipboardList, Copy, Check, Info, Search, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WeeklyMealPlan, Ingredient, ShoppingListResult, IngredientType } from '@/lib/types'
import { generateShoppingListAction, bulkUpdateIngredientStockAction, fetchIngredientsForRangeAction } from './actions'

interface ShoppingListPageClientProps {
  weeklyMealPlans: WeeklyMealPlan[]
  ingredients: Ingredient[]
}

const dayOfWeekOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const

type RangeIngredient = {
  id: string
  name: string
  type: string
  measurement: string
  items_in_stock: number | null
  add_to_shopping_list_per_person: number | null
  add_to_shopping_list_per_week: number | null
  source: 'recipe' | 'per_person' | 'per_week'
  recipe_name?: string
  recipe_amount?: number
}

function getDateForDayOfWeek(weekStartDate: string, dayIndex: number): string {
  // Parse the date parts directly to avoid timezone issues
  const [year, month, day] = weekStartDate.split('-').map(Number)
  const startDate = new Date(year, month - 1, day)
  const targetDate = new Date(startDate)
  targetDate.setDate(startDate.getDate() + dayIndex)
  // Format as YYYY-MM-DD without timezone conversion
  const y = targetDate.getFullYear()
  const m = String(targetDate.getMonth() + 1).padStart(2, '0')
  const d = String(targetDate.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDate(dateString: string): string {
  // Parse the date parts directly to avoid timezone issues
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function formatWeekRange(weekStartDate: string): string {
  const [year, month, day] = weekStartDate.split('-').map(Number)
  const start = new Date(year, month - 1, day)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
}

const typeLabels: Record<IngredientType, string> = {
  staple: 'Staples',
  protein: 'Proteins',
  vegetable: 'Vegetables',
  fruit: 'Fruits',
  condiment: 'Condiments',
  dairy: 'Dairy',
  cleaning: 'Cleaning',
  roots: 'Roots',
  other: 'Other'
}

const typeColors: Record<IngredientType, string> = {
  staple: 'bg-amber-100 text-amber-800',
  protein: 'bg-red-100 text-red-800',
  vegetable: 'bg-green-100 text-green-800',
  fruit: 'bg-orange-100 text-orange-800',
  condiment: 'bg-purple-100 text-purple-800',
  dairy: 'bg-blue-100 text-blue-800',
  cleaning: 'bg-gray-100 text-gray-800',
  roots: 'bg-yellow-100 text-yellow-800',
  other: 'bg-slate-100 text-slate-800'
}

export function ShoppingListPageClient({ weeklyMealPlans, ingredients }: ShoppingListPageClientProps) {
  const [isPending, startTransition] = useTransition()
  
  // Selection state
  const [selectedPlanId, setSelectedPlanId] = useState<string>('')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [rangeLoaded, setRangeLoaded] = useState(false)
  
  // Range ingredients (from recipes + per person + per week)
  const [rangeIngredients, setRangeIngredients] = useState<RangeIngredient[]>([])
  
  // Inventory state
  const [inventorySearch, setInventorySearch] = useState('')
  const [inventoryTypeFilter, setInventoryTypeFilter] = useState<string>('all')
  const [showOnlyRelevant, setShowOnlyRelevant] = useState(true)
  const [stockUpdates, setStockUpdates] = useState<Record<string, string>>({})
  const [inventorySaved, setInventorySaved] = useState(false)
  
  // Result state
  const [shoppingList, setShoppingList] = useState<ShoppingListResult | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get selected plan details
  const selectedPlan = weeklyMealPlans.find(p => p.id === selectedPlanId)
  
  // Get available dates for the selected week
  const getAvailableDates = () => {
    if (!selectedPlan) return []
    return dayOfWeekOrder.map((_, i) => ({
      value: getDateForDayOfWeek(selectedPlan.week_start_date, i),
      label: formatDate(getDateForDayOfWeek(selectedPlan.week_start_date, i))
    }))
  }

  // Filter ingredients for inventory section
  // When range is loaded, show rangeIngredients; otherwise show default ingredients
  const baseIngredients = rangeLoaded ? rangeIngredients : ingredients
  const filteredIngredients = baseIngredients.filter(ing => {
    const matchesSearch = ing.name.toLowerCase().includes(inventorySearch.toLowerCase())
    const matchesType = inventoryTypeFilter === 'all' || ing.type === inventoryTypeFilter
    // When range is loaded, show all loaded ingredients; otherwise filter by shopping flags
    const isRelevant = rangeLoaded || !showOnlyRelevant || 
      (ing.add_to_shopping_list_per_person || 0) > 0 || 
      (ing.add_to_shopping_list_per_week || 0) > 0
    return matchesSearch && matchesType && isRelevant
  })

  // Handle plan selection
  const handlePlanSelect = (planId: string) => {
    setSelectedPlanId(planId)
    const plan = weeklyMealPlans.find(p => p.id === planId)
    if (plan) {
      setStartDate(getDateForDayOfWeek(plan.week_start_date, 0))
      setEndDate(getDateForDayOfWeek(plan.week_start_date, 6))
    }
    setShoppingList(null)
    setError(null)
    setRangeLoaded(false)
    setRangeIngredients([])
  }

  // Load ingredients for the selected range
  const handleLoadRange = () => {
    if (!selectedPlanId || !startDate || !endDate) {
      setError('Please select a weekly calendar and date range')
      return
    }

    startTransition(async () => {
      setError(null)
      const result = await fetchIngredientsForRangeAction(selectedPlanId, startDate, endDate)
      if (result.success && result.ingredients) {
        setRangeIngredients(result.ingredients)
        setRangeLoaded(true)
      } else {
        setError(result.error || 'Failed to load ingredients')
      }
    })
  }

  // Handle stock input change
  const handleStockChange = (ingredientId: string, value: string) => {
    setStockUpdates(prev => ({ ...prev, [ingredientId]: value }))
    setInventorySaved(false)
  }

  // Get current stock value (from updates or original)
  const getStockValue = (ingredient: { id: string; items_in_stock: number | null }): string => {
    if (stockUpdates[ingredient.id] !== undefined) {
      return stockUpdates[ingredient.id]
    }
    return ingredient.items_in_stock?.toString() || '0'
  }

  // Save inventory updates
  const handleSaveInventory = () => {
    startTransition(async () => {
      const updates = Object.entries(stockUpdates)
        .filter(([, value]) => value !== '')
        .map(([id, value]) => ({ id, items_in_stock: parseFloat(value) || 0 }))
      
      if (updates.length > 0) {
        const result = await bulkUpdateIngredientStockAction(updates)
        if (result.success) {
          setInventorySaved(true)
          setTimeout(() => setInventorySaved(false), 2000)
        } else {
          setError(result.error || 'Failed to save inventory')
        }
      }
    })
  }

  // Generate shopping list
  const handleGenerate = () => {
    if (!selectedPlanId || !startDate || !endDate) {
      setError('Please select a weekly calendar and date range')
      return
    }

    startTransition(async () => {
      setError(null)
      const result = await generateShoppingListAction(selectedPlanId, startDate, endDate)
      if (result.success && result.result) {
        setShoppingList(result.result)
      } else {
        setError(result.error || 'Failed to generate shopping list')
      }
    })
  }

  // Generate copy-ready text
  const generateCopyText = (): string => {
    if (!shoppingList) return ''

    const lines: string[] = []
    lines.push(`SHOPPING LIST`)
    lines.push(`${formatDate(shoppingList.date_range.start)} - ${formatDate(shoppingList.date_range.end)}`)
    lines.push('')

    // Group by produce vs general
    const produce: IngredientType[] = ['fruit', 'roots', 'vegetable']
    const general: IngredientType[] = ['protein', 'dairy', 'staple', 'condiment', 'cleaning', 'other']

    const produceItems = shoppingList.items.filter(i => produce.includes(i.type))
    const generalItems = shoppingList.items.filter(i => general.includes(i.type))

    if (produceItems.length > 0) {
      lines.push('--- PRODUCE ---')
      lines.push('')
      
      for (const type of produce) {
        const typeItems = produceItems.filter(i => i.type === type)
        if (typeItems.length > 0) {
          lines.push(typeLabels[type])
          for (const item of typeItems) {
            lines.push(`- ${item.name}: ${item.final_amount_to_buy.toFixed(1)} ${item.measurement}`)
          }
          lines.push('')
        }
      }
    }

    if (generalItems.length > 0) {
      lines.push('--- GENERAL ---')
      lines.push('')
      
      for (const type of general) {
        const typeItems = generalItems.filter(i => i.type === type)
        if (typeItems.length > 0) {
          lines.push(typeLabels[type])
          for (const item of typeItems) {
            lines.push(`- ${item.name}: ${item.final_amount_to_buy.toFixed(1)} ${item.measurement}`)
          }
          lines.push('')
        }
      }
    }

    return lines.join('\n')
  }

  // Copy to clipboard
  const handleCopy = async () => {
    const text = generateCopyText()
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Group items by type for display
  const groupItemsByType = () => {
    if (!shoppingList) return { produce: [], general: [] }
    
    const produce: IngredientType[] = ['fruit', 'roots', 'vegetable']
    const general: IngredientType[] = ['protein', 'dairy', 'staple', 'condiment', 'cleaning', 'other']

    return {
      produce: produce.map(type => ({
        type,
        label: typeLabels[type],
        items: shoppingList.items.filter(i => i.type === type)
      })).filter(g => g.items.length > 0),
      general: general.map(type => ({
        type,
        label: typeLabels[type],
        items: shoppingList.items.filter(i => i.type === type)
      })).filter(g => g.items.length > 0)
    }
  }

  const groupedItems = groupItemsByType()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display text-primary">Shopping List</h1>
        <p className="text-muted-foreground mt-1">
          Generate a copy-ready provider list from scheduled meals, per-person items, weekly items, and current stock.
        </p>
      </div>

      {/* Error display */}
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* 1. Date Range Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Select Date Range
          </CardTitle>
          <CardDescription>
            Choose the existing weekly calendar this shopping list is based on.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Weekly Calendar Week</Label>
              <Select value={selectedPlanId} onValueChange={handlePlanSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a week" />
                </SelectTrigger>
                <SelectContent>
                  {weeklyMealPlans.map(plan => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {formatWeekRange(plan.week_start_date)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Generate from</Label>
              <Select 
                value={startDate} 
                onValueChange={setStartDate}
                disabled={!selectedPlan}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Start date" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableDates().map(d => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Generate until</Label>
              <Select 
                value={endDate} 
                onValueChange={setEndDate}
                disabled={!selectedPlan}
              >
                <SelectTrigger>
                  <SelectValue placeholder="End date" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableDates()
                    .filter(d => d.value >= startDate)
                    .map(d => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground flex-1">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Per-person items use the greater headcount between brunch and dinner for each day.</span>
            </div>
            <Button
              onClick={handleLoadRange}
              disabled={isPending || !selectedPlanId || !startDate || !endDate}
            >
              {isPending && !rangeLoaded ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading...
                </>
              ) : rangeLoaded ? (
                <>
                  <Check className="h-4 w-4 mr-2 text-green-600" />
                  Range Loaded
                </>
              ) : (
                'Load Range'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 2. Inventory Update */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Update Inventory
          </CardTitle>
          <CardDescription>
            {rangeLoaded 
              ? `Showing ingredients from recipes, per-person, and per-week items for ${formatDate(startDate)} - ${formatDate(endDate)}. Update stock levels before generating.`
              : 'Load a date range above to see all ingredients needed for that period.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search ingredients..."
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={inventoryTypeFilter} onValueChange={setInventoryTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(typeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={showOnlyRelevant ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowOnlyRelevant(!showOnlyRelevant)}
            >
              Shopping Items Only
            </Button>
          </div>

          {/* Ingredient List */}
          <div className="max-h-[400px] overflow-y-auto rounded-lg border">
            <div className={cn(
              "grid gap-2 border-b bg-muted/50 px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground sticky top-0",
              rangeLoaded ? "grid-cols-12" : "grid-cols-12"
            )}>
              <div className={rangeLoaded ? "col-span-3" : "col-span-4"}>Name</div>
              {rangeLoaded && <div className="col-span-3">Source</div>}
              <div className="col-span-2">Type</div>
              <div className="col-span-1">Unit</div>
              <div className="col-span-1 text-center">Per Person</div>
              <div className="col-span-2 text-center">In Stock</div>
            </div>
            {filteredIngredients.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                {rangeLoaded 
                  ? 'No ingredients found for this date range.'
                  : 'No ingredients found. Adjust filters or add shopping flags to ingredients.'}
              </div>
            ) : (
              filteredIngredients.map((ing, idx) => {
                const rangeIng = ing as RangeIngredient
                const sourceLabel = rangeLoaded 
                  ? rangeIng.source === 'recipe' 
                    ? rangeIng.recipe_name || 'Recipe'
                    : rangeIng.source === 'per_person' 
                      ? 'Per Person/Day'
                      : 'Per Week'
                  : null
                const sourceBadgeColor = rangeLoaded
                  ? rangeIng.source === 'recipe'
                    ? 'bg-blue-100 text-blue-800'
                    : rangeIng.source === 'per_person'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-purple-100 text-purple-800'
                  : ''
                
                return (
                  <div key={`${ing.id}-${idx}`} className="grid grid-cols-12 gap-2 items-center border-b px-4 py-2 hover:bg-muted/30">
                    <div className={cn("font-medium truncate", rangeLoaded ? "col-span-3" : "col-span-4")}>{ing.name}</div>
                    {rangeLoaded && (
                      <div className="col-span-3">
                        <Badge variant="outline" className={cn("text-xs truncate max-w-full", sourceBadgeColor)}>
                          {sourceLabel}
                        </Badge>
                      </div>
                    )}
                    <div className="col-span-2">
                      <Badge variant="outline" className={cn("text-xs", typeColors[ing.type as IngredientType])}>
                        {ing.type}
                      </Badge>
                    </div>
                    <div className="col-span-1 text-sm text-muted-foreground">{ing.measurement}</div>
                    <div className="col-span-1 text-sm text-muted-foreground text-center">
                      {rangeLoaded && rangeIng.source === 'recipe' 
                        ? rangeIng.recipe_amount?.toFixed(1) || '-'
                        : ing.add_to_shopping_list_per_person || '-'}
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        value={getStockValue(ing)}
                        onChange={(e) => handleStockChange(ing.id, e.target.value)}
                        className="h-8 text-center"
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              onClick={handleSaveInventory} 
              disabled={isPending || Object.keys(stockUpdates).length === 0}
              variant="outline"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : inventorySaved ? (
                <Check className="h-4 w-4 mr-2 text-green-600" />
              ) : null}
              {inventorySaved ? 'Saved!' : 'Save Inventory'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 3. Generate Button */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Generate Shopping List
          </CardTitle>
          <CardDescription>
            This list is calculated from scheduled recipes, per-person ingredient flags, weekly ingredient flags, and current inventory.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleGenerate} 
            disabled={isPending || !selectedPlanId || !startDate || !endDate}
            size="lg"
            className="w-full sm:w-auto"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Generate Shopping List
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* 4. Generated List Display */}
      {shoppingList && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Provider List</CardTitle>
                <CardDescription>
                  {formatDate(shoppingList.date_range.start)} - {formatDate(shoppingList.date_range.end)} • {shoppingList.items.length} items
                </CardDescription>
              </div>
              <Button onClick={handleCopy} variant="outline" size="sm">
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy List
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {shoppingList.items.length === 0 ? (
              <div className="rounded-lg border border-dashed py-12 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">No items needed after inventory subtraction.</p>
                <p className="text-sm text-muted-foreground">All ingredients are in stock or no recipes scheduled.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Produce Section */}
                {groupedItems.produce.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-primary mb-3 border-b pb-2">PRODUCE</h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {groupedItems.produce.map(group => (
                        <div key={group.type} className="space-y-2">
                          <h4 className="font-medium text-foreground">{group.label}</h4>
                          <ul className="space-y-1">
                            {group.items.map(item => (
                              <li key={item.ingredient_id} className="text-sm flex justify-between">
                                <span>{item.name}</span>
                                <span className="font-medium">{item.final_amount_to_buy.toFixed(1)} {item.measurement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* General Section */}
                {groupedItems.general.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-primary mb-3 border-b pb-2">GENERAL</h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {groupedItems.general.map(group => (
                        <div key={group.type} className="space-y-2">
                          <h4 className="font-medium text-foreground">{group.label}</h4>
                          <ul className="space-y-1">
                            {group.items.map(item => (
                              <li key={item.ingredient_id} className="text-sm flex justify-between">
                                <span>{item.name}</span>
                                <span className="font-medium">{item.final_amount_to_buy.toFixed(1)} {item.measurement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!selectedPlanId && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">Select a Weekly Calendar week to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
