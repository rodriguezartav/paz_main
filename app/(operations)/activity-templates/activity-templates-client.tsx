'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { ImageUpload } from '@/components/ui/image-upload'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ActivityTemplate, ActivityType } from '@/lib/types'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Clock,
  MapPin,
  User,
  Users,
  Eye,
  EyeOff,
  Waves,
  Flame,
  TreePine,
  Heart,
  Music,
  Wrench,
  HandHeart,
  MoreHorizontal,
  LayoutTemplate,
  ImageIcon
} from 'lucide-react'
import {
  createActivityTemplateAction,
  updateActivityTemplateAction,
  deleteActivityTemplateAction,
} from './actions'

const activityTypeConfig: Record<ActivityType, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  surf: { label: 'Surf', icon: Waves, color: 'bg-blue-100 text-blue-800 border-blue-200' },
  sauna: { label: 'Sauna', icon: Flame, color: 'bg-orange-100 text-orange-800 border-orange-200' },
  nature_walk: { label: 'Nature Walk', icon: TreePine, color: 'bg-green-100 text-green-800 border-green-200' },
  community: { label: 'Community', icon: Heart, color: 'bg-pink-100 text-pink-800 border-pink-200' },
  music: { label: 'Music', icon: Music, color: 'bg-purple-100 text-purple-800 border-purple-200' },
  workshop: { label: 'Workshop', icon: Wrench, color: 'bg-amber-100 text-amber-800 border-amber-200' },
  service: { label: 'Service', icon: HandHeart, color: 'bg-teal-100 text-teal-800 border-teal-200' },
  other: { label: 'Other', icon: MoreHorizontal, color: 'bg-gray-100 text-gray-800 border-gray-200' },
}

interface ActivityTemplatesClientProps {
  initialTemplates: ActivityTemplate[]
}

const defaultForm = {
  title: '',
  activity_type: 'community' as ActivityType,
  default_start_time: '',
  default_end_time: '',
  default_location: '',
  default_facilitator_name: '',
  default_capacity: '',
  description: '',
  guest_description: '',
  what_to_bring: '',
  safety_note: '',
  image_url: null as string | null,
  is_public: true,
  is_active: true,
}

export function ActivityTemplatesClient({ initialTemplates }: ActivityTemplatesClientProps) {
  const router = useRouter()
  const [templates, setTemplates] = useState<ActivityTemplate[]>(initialTemplates)
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<ActivityTemplate | null>(null)
  const [form, setForm] = useState(defaultForm)
  
  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null)
  
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filter state
  const [showInactive, setShowInactive] = useState(false)

  const openAddTemplate = () => {
    setEditingTemplate(null)
    setForm(defaultForm)
    setDialogOpen(true)
  }

  const openEditTemplate = (template: ActivityTemplate) => {
    setEditingTemplate(template)
    setForm({
      title: template.title,
      activity_type: template.activity_type,
      default_start_time: template.default_start_time || '',
      default_end_time: template.default_end_time || '',
      default_location: template.default_location || '',
      default_facilitator_name: template.default_facilitator_name || '',
      default_capacity: template.default_capacity?.toString() || '',
      description: template.description || '',
      guest_description: template.guest_description || '',
      what_to_bring: template.what_to_bring || '',
      safety_note: template.safety_note || '',
      image_url: template.image_url,
      is_public: template.is_public,
      is_active: template.is_active,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.title.trim()) return
    setIsSubmitting(true)
    
    const data = {
      title: form.title,
      activity_type: form.activity_type,
      default_start_time: form.default_start_time || null,
      default_end_time: form.default_end_time || null,
      default_location: form.default_location || null,
      default_facilitator_name: form.default_facilitator_name || null,
      default_capacity: form.default_capacity ? parseInt(form.default_capacity) : null,
      description: form.description || null,
      guest_description: form.guest_description || null,
      what_to_bring: form.what_to_bring || null,
      safety_note: form.safety_note || null,
      image_url: form.image_url,
      is_public: form.is_public,
      is_active: form.is_active,
    }
    
    try {
      if (editingTemplate) {
        await updateActivityTemplateAction(editingTemplate.id, data)
      } else {
        await createActivityTemplateAction(data)
      }
      setDialogOpen(false)
      router.refresh()
      window.location.reload()
    } catch (error) {
      console.error('Failed to save template:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    setIsSubmitting(true)
    
    try {
      await deleteActivityTemplateAction(deleteConfirm.id)
      setDeleteConfirm(null)
      router.refresh()
      window.location.reload()
    } catch (error) {
      console.error('Failed to delete template:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredTemplates = showInactive 
    ? templates 
    : templates.filter(t => t.is_active)

  const formatTime = (time: string | null) => {
    if (!time) return null
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Activity Templates</h1>
          <p className="text-sm text-muted-foreground">Create reusable templates for activities</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              id="show-inactive"
              checked={showInactive}
              onCheckedChange={setShowInactive}
            />
            <Label htmlFor="show-inactive" className="text-sm">Show inactive</Label>
          </div>
          <Button onClick={openAddTemplate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Template
          </Button>
        </div>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <LayoutTemplate className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No templates created yet</p>
            <Button onClick={openAddTemplate} variant="outline" className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map(template => {
            const typeConfig = activityTypeConfig[template.activity_type]
            const TypeIcon = typeConfig.icon
            
            return (
              <Card key={template.id} className={`overflow-hidden ${!template.is_active ? 'opacity-60' : ''}`}>
                {/* Template Image */}
                {template.image_url ? (
                  <div className="relative h-40 bg-muted">
                    <img
                      src={template.image_url}
                      alt={template.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge className={`${typeConfig.color}`}>
                        <TypeIcon className="h-3 w-3 mr-1" />
                        {typeConfig.label}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="h-24 bg-muted flex items-center justify-center">
                    <div className={`rounded-lg p-3 ${typeConfig.color}`}>
                      <TypeIcon className="h-6 w-6" />
                    </div>
                  </div>
                )}
                
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{template.title}</h3>
                      
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {!template.image_url && (
                          <Badge variant="outline" className={`text-xs ${typeConfig.color}`}>
                            {typeConfig.label}
                          </Badge>
                        )}
                        {template.is_public ? (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            <Eye className="h-3 w-3 mr-1" />
                            Public
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-200">
                            <EyeOff className="h-3 w-3 mr-1" />
                            Internal
                          </Badge>
                        )}
                        {!template.is_active && (
                          <Badge variant="outline" className="text-xs">Inactive</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-sm text-muted-foreground">
                    {(template.default_start_time || template.default_end_time) && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatTime(template.default_start_time)}
                        {template.default_end_time && ` - ${formatTime(template.default_end_time)}`}
                      </span>
                    )}
                    {template.default_location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {template.default_location}
                      </span>
                    )}
                    {template.default_capacity && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {template.default_capacity}
                      </span>
                    )}
                  </div>
                  
                  {template.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {template.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-1 mt-4 pt-3 border-t">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => openEditTemplate(template)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteConfirm({ id: template.id, title: template.title })}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Template Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? 'Edit Template' : 'Create Template'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Template Image</Label>
              <ImageUpload
                value={form.image_url}
                onChange={(url) => setForm(prev => ({ ...prev, image_url: url }))}
                folder="activity-templates"
                disabled={isSubmitting}
              />
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Template Name *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Morning Surf Session"
                />
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="activity_type">Activity Type</Label>
                  <Select 
                    value={form.activity_type} 
                    onValueChange={(v) => setForm(prev => ({ ...prev, activity_type: v as ActivityType }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(activityTypeConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="default_capacity">Default Capacity</Label>
                  <Input
                    id="default_capacity"
                    type="number"
                    value={form.default_capacity}
                    onChange={e => setForm(prev => ({ ...prev, default_capacity: e.target.value }))}
                    placeholder="Leave empty for unlimited"
                    min="1"
                  />
                </div>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="default_start_time">Default Start Time</Label>
                  <Input
                    id="default_start_time"
                    type="time"
                    value={form.default_start_time}
                    onChange={e => setForm(prev => ({ ...prev, default_start_time: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default_end_time">Default End Time</Label>
                  <Input
                    id="default_end_time"
                    type="time"
                    value={form.default_end_time}
                    onChange={e => setForm(prev => ({ ...prev, default_end_time: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="default_location">Default Location</Label>
                  <Input
                    id="default_location"
                    value={form.default_location}
                    onChange={e => setForm(prev => ({ ...prev, default_location: e.target.value }))}
                    placeholder="e.g., Beach, Yoga Deck"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default_facilitator_name">Default Facilitator</Label>
                  <Input
                    id="default_facilitator_name"
                    value={form.default_facilitator_name}
                    onChange={e => setForm(prev => ({ ...prev, default_facilitator_name: e.target.value }))}
                    placeholder="e.g., Roberto"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Internal Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Internal notes about this template..."
                  rows={2}
                />
              </div>
            </div>
            
            {/* Guest-Facing Info */}
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-medium text-sm text-muted-foreground">Guest-Facing Information</h4>
              
              <div className="space-y-2">
                <Label htmlFor="guest_description">Public Description</Label>
                <Textarea
                  id="guest_description"
                  value={form.guest_description}
                  onChange={e => setForm(prev => ({ ...prev, guest_description: e.target.value }))}
                  placeholder="Description visible to guests..."
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="what_to_bring">What to Bring</Label>
                <Textarea
                  id="what_to_bring"
                  value={form.what_to_bring}
                  onChange={e => setForm(prev => ({ ...prev, what_to_bring: e.target.value }))}
                  placeholder="e.g., Sunscreen, water bottle, towel..."
                  rows={2}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="safety_note">Safety Note</Label>
                <Textarea
                  id="safety_note"
                  value={form.safety_note}
                  onChange={e => setForm(prev => ({ ...prev, safety_note: e.target.value }))}
                  placeholder="Any safety considerations..."
                  rows={2}
                />
              </div>
            </div>
            
            {/* Settings */}
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-medium text-sm text-muted-foreground">Settings</h4>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_public">Public Activity</Label>
                  <p className="text-xs text-muted-foreground">Show in guest portal</p>
                </div>
                <Switch
                  id="is_public"
                  checked={form.is_public}
                  onCheckedChange={(checked) => setForm(prev => ({ ...prev, is_public: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_active">Active Template</Label>
                  <p className="text-xs text-muted-foreground">Available for creating activities</p>
                </div>
                <Switch
                  id="is_active"
                  checked={form.is_active}
                  onCheckedChange={(checked) => setForm(prev => ({ ...prev, is_active: checked }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting || !form.title.trim()}>
              {isSubmitting ? 'Saving...' : editingTemplate ? 'Update Template' : 'Create Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteConfirm?.title}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isSubmitting}>
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
