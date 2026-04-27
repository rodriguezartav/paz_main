'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Ingredient, IngredientType, Measurement } from '@/lib/types'
import { Plus, Search, Pencil, Trash2, Check, X, Loader2 } from 'lucide-react'
import { createIngredientAction, updateIngredientAction, deleteIngredientAction } from './actions'
import { cn } from '@/lib/utils'

interface IngredientsPageClientProps {
  initialIngredients: Ingredient[]
}

const typeOptions: { value: IngredientType; label: string }[] = [
  { value: 'staple', label: 'Staple' },
  { value: 'protein', label: 'Protein' },
  { value: 'vegetable', label: 'Vegetable' },
  { value: 'fruit', label: 'Fruit' },
  { value: 'roots', label: 'Roots' },
  { value: 'condiment', label: 'Condiment' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'other', label: 'Other' },
]

const measurementOptions: { value: Measurement; label: string }[] = [
  { value: 'kg', label: 'kg' },
  { value: 'g', label: 'g' },
  { value: 'l', label: 'l' },
  { value: 'ml', label: 'ml' },
  { value: 'unit', label: 'unit' },
  { value: 'tbsp', label: 'tbsp' },
]

const typeColors: Record<IngredientType, string> = {
  staple: 'bg-amber-100 text-amber-800 border-amber-200',
  protein: 'bg-red-100 text-red-800 border-red-200',
  vegetable: 'bg-green-100 text-green-800 border-green-200',
  fruit: 'bg-orange-100 text-orange-800 border-orange-200',
  roots: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  condiment: 'bg-purple-100 text-purple-800 border-purple-200',
  dairy: 'bg-blue-100 text-blue-800 border-blue-200',
  cleaning: 'bg-gray-100 text-gray-800 border-gray-200',
  other: 'bg-slate-100 text-slate-800 border-slate-200',
}

export function IngredientsPageClient({ initialIngredients }: IngredientsPageClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<IngredientType | 'all'>('all')
  
  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editType, setEditType] = useState<IngredientType>('other')
  const [editMeasurement, setEditMeasurement] = useState<Measurement>('unit')
  
  // New ingredient state
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState<IngredientType>('vegetable')
  const [newMeasurement, setNewMeasurement] = useState<Measurement>('kg')

  // Filter ingredients
  const filteredIngredients = initialIngredients.filter(ing => {
    const matchesSearch = ing.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || ing.type === filterType
    return matchesSearch && matchesType
  }).sort((a, b) => a.name.localeCompare(b.name))

  const startEdit = (ingredient: Ingredient) => {
    setEditingId(ingredient.id)
    setEditName(ingredient.name)
    setEditType(ingredient.type)
    setEditMeasurement(ingredient.measurement)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName('')
  }

  const saveEdit = () => {
    if (!editingId || !editName.trim()) return
    
    startTransition(async () => {
      await updateIngredientAction(editingId, {
        name: editName.trim(),
        type: editType,
        measurement: editMeasurement
      })
      setEditingId(null)
      router.refresh()
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this ingredient?')) return
    
    startTransition(async () => {
      await deleteIngredientAction(id)
      router.refresh()
    })
  }

  const handleAddNew = () => {
    if (!newName.trim()) return
    
    startTransition(async () => {
      await createIngredientAction({
        name: newName.trim(),
        type: newType,
        measurement: newMeasurement
      })
      setNewName('')
      setIsAdding(false)
      router.refresh()
    })
  }

  const cancelAdd = () => {
    setIsAdding(false)
    setNewName('')
    setNewType('vegetable')
    setNewMeasurement('kg')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Ingredients</h1>
          <p className="text-muted-foreground">{initialIngredients.length} ingredients</p>
        </div>
        <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
          <Plus className="mr-2 h-4 w-4" />
          Add Ingredient
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search ingredients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterType} onValueChange={(v) => setFilterType(v as IngredientType | 'all')}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {typeOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Ingredients List */}
      <Card>
        <CardHeader className="py-3 px-4 border-b">
          <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            <div className="col-span-5 sm:col-span-6">Name</div>
            <div className="col-span-3 sm:col-span-3">Type</div>
            <div className="col-span-2 sm:col-span-2">Unit</div>
            <div className="col-span-2 sm:col-span-1 text-right">Actions</div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Add New Row */}
          {isAdding && (
            <div className="grid grid-cols-12 gap-2 items-center px-4 py-3 bg-primary/5 border-b">
              <div className="col-span-5 sm:col-span-6">
                <Input
                  placeholder="Ingredient name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddNew()
                    if (e.key === 'Escape') cancelAdd()
                  }}
                />
              </div>
              <div className="col-span-3 sm:col-span-3">
                <Select value={newType} onValueChange={(v) => setNewType(v as IngredientType)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 sm:col-span-2">
                <Select value={newMeasurement} onValueChange={(v) => setNewMeasurement(v as Measurement)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {measurementOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 sm:col-span-1 flex justify-end gap-1">
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleAddNew} disabled={isPending || !newName.trim()}>
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 text-green-600" />}
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={cancelAdd}>
                  <X className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
          )}

          {/* Ingredients Rows */}
          {filteredIngredients.length === 0 ? (
            <div className="px-4 py-8 text-center text-muted-foreground">
              {searchQuery || filterType !== 'all' ? 'No ingredients match your filters' : 'No ingredients yet'}
            </div>
          ) : (
            <div className="divide-y">
              {filteredIngredients.map((ingredient) => (
                <div 
                  key={ingredient.id} 
                  className={cn(
                    "grid grid-cols-12 gap-2 items-center px-4 py-2.5 hover:bg-muted/50 transition-colors",
                    editingId === ingredient.id && "bg-primary/5"
                  )}
                >
                  {editingId === ingredient.id ? (
                    <>
                      <div className="col-span-5 sm:col-span-6">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit()
                            if (e.key === 'Escape') cancelEdit()
                          }}
                        />
                      </div>
                      <div className="col-span-3 sm:col-span-3">
                        <Select value={editType} onValueChange={(v) => setEditType(v as IngredientType)}>
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {typeOptions.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2 sm:col-span-2">
                        <Select value={editMeasurement} onValueChange={(v) => setEditMeasurement(v as Measurement)}>
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {measurementOptions.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2 sm:col-span-1 flex justify-end gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={saveEdit} disabled={isPending || !editName.trim()}>
                          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 text-green-600" />}
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={cancelEdit}>
                          <X className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="col-span-5 sm:col-span-6 font-medium truncate">{ingredient.name}</div>
                      <div className="col-span-3 sm:col-span-3">
                        <Badge variant="outline" className={cn("text-xs", typeColors[ingredient.type])}>
                          {typeOptions.find(t => t.value === ingredient.type)?.label || ingredient.type}
                        </Badge>
                      </div>
                      <div className="col-span-2 sm:col-span-2 text-sm text-muted-foreground">{ingredient.measurement}</div>
                      <div className="col-span-2 sm:col-span-1 flex justify-end gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(ingredient)}>
                          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDelete(ingredient.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
