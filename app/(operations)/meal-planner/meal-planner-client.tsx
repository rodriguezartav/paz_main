'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CalendarDays, Plus, MoreHorizontal, Edit, Copy, Eye, Power, PowerOff, Trash2, ChefHat, Utensils } from 'lucide-react'
import type { WeeklyMenuTemplate } from '@/lib/types'
import { createTemplateAction, updateTemplateAction, duplicateTemplateAction, deleteTemplateAction } from './actions'
import { formatDistanceToNow } from 'date-fns'

interface MealPlannerClientProps {
  initialTemplates: WeeklyMenuTemplate[]
}

export function MealPlannerClient({ initialTemplates }: MealPlannerClientProps) {
  const router = useRouter()
  const [templates, setTemplates] = useState(initialTemplates)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<WeeklyMenuTemplate | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // Form state
  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')

  const getTemplateStats = (template: WeeklyMenuTemplate) => {
    const meals = template.meals || []
    const mealsWithRecipes = meals.filter(m => m.recipes && m.recipes.length > 0).length
    const totalRecipes = meals.reduce((sum, m) => sum + (m.recipes?.length || 0), 0)
    return { mealsWithRecipes, totalRecipes, totalMeals: 14 }
  }

  const handleCreate = async () => {
    if (!formName.trim()) return
    setIsLoading(true)
    
    try {
      const result = await createTemplateAction(formName, formDescription || null)
      if (result.success && result.template) {
        setTemplates([...templates, result.template])
        setIsCreateDialogOpen(false)
        setFormName('')
        setFormDescription('')
        router.push(`/meal-planner/${result.template.id}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDuplicate = async () => {
    if (!selectedTemplate || !formName.trim()) return
    setIsLoading(true)
    
    try {
      const result = await duplicateTemplateAction(selectedTemplate.id, formName)
      if (result.success && result.template) {
        setTemplates([...templates, result.template])
        setIsDuplicateDialogOpen(false)
        setFormName('')
        setSelectedTemplate(null)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleActive = async (template: WeeklyMenuTemplate) => {
    const result = await updateTemplateAction(template.id, { active: !template.active })
    if (result.success) {
      setTemplates(templates.map(t => t.id === template.id ? { ...t, active: !t.active } : t))
    }
  }

  const handleDelete = async () => {
    if (!selectedTemplate) return
    setIsLoading(true)
    
    try {
      const result = await deleteTemplateAction(selectedTemplate.id)
      if (result.success) {
        setTemplates(templates.filter(t => t.id !== selectedTemplate.id))
        setIsDeleteDialogOpen(false)
        setSelectedTemplate(null)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const openDuplicateDialog = (template: WeeklyMenuTemplate) => {
    setSelectedTemplate(template)
    setFormName(`${template.name} (Copy)`)
    setIsDuplicateDialogOpen(true)
  }

  const openDeleteDialog = (template: WeeklyMenuTemplate) => {
    setSelectedTemplate(template)
    setIsDeleteDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CalendarDays className="h-6 w-6" />
            Meal Planner
          </h1>
          <p className="text-muted-foreground">Create and manage weekly menu templates</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No templates yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first weekly menu template to start planning meals.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => {
            const stats = getTemplateStats(template)
            return (
              <Card key={template.id} className={!template.active ? 'opacity-60' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        {template.name}
                        {!template.active && (
                          <Badge variant="secondary" className="text-xs">Inactive</Badge>
                        )}
                      </CardTitle>
                      {template.description && (
                        <CardDescription className="line-clamp-2">
                          {template.description}
                        </CardDescription>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/meal-planner/${template.id}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Template
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/meal-planner/${template.id}/preview`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDuplicateDialog(template)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleToggleActive(template)}>
                          {template.active ? (
                            <>
                              <PowerOff className="mr-2 h-4 w-4" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <Power className="mr-2 h-4 w-4" />
                              Reactivate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => openDeleteDialog(template)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Utensils className="h-4 w-4" />
                        <span>{stats.mealsWithRecipes}/{stats.totalMeals} meals</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <ChefHat className="h-4 w-4" />
                        <span>{stats.totalRecipes} recipes</span>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all"
                          style={{ width: `${(stats.mealsWithRecipes / stats.totalMeals) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {Math.round((stats.mealsWithRecipes / stats.totalMeals) * 100)}% complete
                      </p>
                    </div>

                    {/* Last Updated */}
                    <p className="text-xs text-muted-foreground">
                      Updated {formatDistanceToNow(new Date(template.updated_at), { addSuffix: true })}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button asChild variant="outline" size="sm" className="flex-1">
                        <Link href={`/meal-planner/${template.id}`}>
                          <Edit className="mr-1.5 h-4 w-4" />
                          Edit
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm" className="flex-1">
                        <Link href={`/meal-planner/${template.id}/preview`}>
                          <Eye className="mr-1.5 h-4 w-4" />
                          Preview
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create Template Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Template</DialogTitle>
            <DialogDescription>
              Create a new weekly menu template. This will automatically generate 14 meal slots (brunch and dinner for each day).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                placeholder="e.g., Standard Week, High Season Menu"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe this menu template..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!formName.trim() || isLoading}>
              {isLoading ? 'Creating...' : 'Create Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Duplicate Template Dialog */}
      <Dialog open={isDuplicateDialogOpen} onOpenChange={setIsDuplicateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicate Template</DialogTitle>
            <DialogDescription>
              Create a copy of &quot;{selectedTemplate?.name}&quot; with all meals and recipes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="duplicate-name">New Template Name</Label>
              <Input
                id="duplicate-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDuplicateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDuplicate} disabled={!formName.trim() || isLoading}>
              {isLoading ? 'Duplicating...' : 'Duplicate Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedTemplate?.name}&quot;? This will also delete all meal slots and recipe assignments. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? 'Deleting...' : 'Delete Template'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
