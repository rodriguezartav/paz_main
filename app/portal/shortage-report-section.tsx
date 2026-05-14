'use client'

import { useState, useTransition, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Plus, Check, Loader2, ShoppingBasket, ChevronsUpDown } from 'lucide-react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription 
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { IngredientShortageReport, Ingredient } from '@/lib/types'
import { reportShortageAction, resolveShortageAction, resolveAllShortagesAction } from './actions'

interface ShortageReportSectionProps {
  reports: IngredientShortageReport[]
  ingredients: Ingredient[]
  showAdminControls?: boolean
}

export function ShortageReportSection({ reports, ingredients, showAdminControls = false }: ShortageReportSectionProps) {
  const [isPending, startTransition] = useTransition()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [comboboxOpen, setComboboxOpen] = useState(false)
  const [selectedIngredientId, setSelectedIngredientId] = useState<string | null>(null)
  const [customItemName, setCustomItemName] = useState('')
  const [reportedBy, setReportedBy] = useState('')
  const [notes, setNotes] = useState('')

  // Group ingredients by type for better organization
  const groupedIngredients = useMemo(() => {
    const groups: Record<string, Ingredient[]> = {}
    ingredients.forEach(ing => {
      if (!groups[ing.type]) {
        groups[ing.type] = []
      }
      groups[ing.type].push(ing)
    })
    // Sort ingredients within each group alphabetically
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => a.name.localeCompare(b.name))
    })
    return groups
  }, [ingredients])

  const selectedIngredient = ingredients.find(i => i.id === selectedIngredientId)
  const itemName = selectedIngredient?.name || customItemName

  const handleSubmit = () => {
    if (!itemName.trim()) return
    
    startTransition(async () => {
      const result = await reportShortageAction({
        item_name: itemName.trim(),
        reported_by: reportedBy.trim() || null,
        notes: notes.trim() || null,
      })
      
      if (result.success) {
        setSelectedIngredientId(null)
        setCustomItemName('')
        setReportedBy('')
        setNotes('')
        setDialogOpen(false)
      }
    })
  }

  const handleResolve = (id: string) => {
    startTransition(async () => {
      await resolveShortageAction(id)
    })
  }

  const handleResolveAll = () => {
    startTransition(async () => {
      await resolveAllShortagesAction()
    })
  }

  const typeLabels: Record<string, string> = {
    staple: 'Staples',
    protein: 'Proteins',
    vegetable: 'Vegetables',
    fruit: 'Fruits',
    condiment: 'Condiments',
    dairy: 'Dairy',
    cleaning: 'Cleaning',
    roots: 'Roots',
    other: 'Other',
  }

  return (
    <Card className="border-amber-200 bg-amber-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShoppingBasket className="h-5 w-5 text-amber-600" />
            Running Low?
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="border-amber-300 hover:bg-amber-100">
                <Plus className="h-4 w-4 mr-1" />
                Report Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Report Missing Item</DialogTitle>
                <DialogDescription>
                  Let the kitchen know when we&apos;re running low on something.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>What&apos;s running low? *</Label>
                  <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={comboboxOpen}
                        className="w-full justify-between"
                      >
                        {selectedIngredient
                          ? selectedIngredient.name
                          : customItemName || "Select an ingredient..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0" align="start">
                      <Command>
                        <CommandInput 
                          placeholder="Search ingredients..." 
                          onValueChange={(value) => {
                            // Allow custom entry if typing something not in the list
                            setCustomItemName(value)
                          }}
                        />
                        <CommandList>
                          <CommandEmpty>
                            <div className="p-2 text-sm text-muted-foreground">
                              No ingredient found. 
                              <Button 
                                variant="link" 
                                className="p-0 h-auto text-primary"
                                onClick={() => {
                                  setSelectedIngredientId(null)
                                  setComboboxOpen(false)
                                }}
                              >
                                Use &quot;{customItemName}&quot; as custom item
                              </Button>
                            </div>
                          </CommandEmpty>
                          {Object.entries(groupedIngredients).map(([type, items]) => (
                            <CommandGroup key={type} heading={typeLabels[type] || type}>
                              {items.map((ingredient) => (
                                <CommandItem
                                  key={ingredient.id}
                                  value={ingredient.name}
                                  onSelect={() => {
                                    setSelectedIngredientId(ingredient.id)
                                    setCustomItemName('')
                                    setComboboxOpen(false)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedIngredientId === ingredient.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {ingredient.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          ))}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {customItemName && !selectedIngredient && (
                    <p className="text-xs text-muted-foreground">
                      Custom item: &quot;{customItemName}&quot;
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reported_by">Your name (optional)</Label>
                  <Input
                    id="reported_by"
                    placeholder="Your name"
                    value={reportedBy}
                    onChange={(e) => setReportedBy(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Input
                    id="notes"
                    placeholder="e.g., Only half a bottle left"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={isPending || !itemName.trim()}>
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Reporting...
                    </>
                  ) : (
                    'Report Item'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {reports.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            All stocked up! Report an item if we&apos;re running low on something.
          </p>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {reports.map((report) => (
                <Badge 
                  key={report.id} 
                  variant="outline" 
                  className="bg-amber-100 border-amber-300 text-amber-800 px-3 py-1.5 text-sm flex items-center gap-2"
                >
                  <AlertTriangle className="h-3 w-3" />
                  {report.item_name}
                  {report.notes && (
                    <span className="text-amber-600 text-xs">({report.notes})</span>
                  )}
                  {showAdminControls && (
                    <button
                      onClick={() => handleResolve(report.id)}
                      disabled={isPending}
                      className="ml-1 hover:text-green-600 transition-colors"
                      title="Mark as resolved"
                    >
                      <Check className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
            
            {showAdminControls && reports.length > 0 && (
              <div className="pt-2 border-t border-amber-200">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-green-600 border-green-300 hover:bg-green-50"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Groceries Arrived - Clear All
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear All Shortage Reports?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will mark all {reports.length} reported item(s) as resolved. 
                        Use this when the groceries have arrived.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleResolveAll}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isPending ? 'Clearing...' : 'Clear All'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
