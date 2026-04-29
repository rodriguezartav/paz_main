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
import type { ScheduledActivity, ActivityType, ActivityStatus } from '@/lib/types'
import { 
  Calendar,
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
  MoreHorizontal
} from 'lucide-react'
import {
  createActivityAction,
  updateActivityAction,
  deleteActivityAction,
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

const statusConfig: Record<ActivityStatus, { label: string; color: string }> = {
  planned: { label: 'Planned', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-800 border-green-200' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800 border-red-200' },
  completed: { label: 'Completed', color: 'bg-gray-100 text-gray-800 border-gray-200' },
}

interface ActivitiesPageClientProps {
  initialActivities: ScheduledActivity[]
}

const defaultForm = {
  title: '',
  activity_type: 'community' as ActivityType,
  date: new Date().toISOString().split('T')[0],
  start_time: '',
  end_time: '',
  location: '',
  facilitator_name: '',
  capacity: '',
  status: 'planned' as ActivityStatus,
  notes: '',
  is_public: true,
  guest_description: '',
  what_to_bring: '',
  safety_note: '',
  signup_enabled: false,
}

export function ActivitiesPageClient({ initialActivities }: ActivitiesPageClientProps) {
  const router = useRouter()
  const [activities, setActivities] = useState<ScheduledActivity[]>(initialActivities)
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<ScheduledActivity | null>(null)
  const [form, setForm] = useState(defaultForm)
  
  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null)
  
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filter state
  const [statusFilter, setStatusFilter] = useState<ActivityStatus | 'all'>('all')

  const openAddActivity = () => {
    setEditingActivity(null)
    setForm(defaultForm)
    setDialogOpen(true)
  }

  const openEditActivity = (activity: ScheduledActivity) => {
    setEditingActivity(activity)
    setForm({
      title: activity.title,
      activity_type: activity.activity_type,
      date: activity.date,
      start_time: activity.start_time || '',
      end_time: activity.end_time || '',
      location: activity.location || '',
      facilitator_name: activity.facilitator_name || '',
      capacity: activity.capacity?.toString() || '',
      status: activity.status,
      notes: activity.notes || '',
      is_public: activity.is_public,
      guest_description: activity.guest_description || '',
      what_to_bring: activity.what_to_bring || '',
      safety_note: activity.safety_note || '',
      signup_enabled: activity.signup_enabled,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.title.trim() || !form.date) return
    setIsSubmitting(true)
    
    const data = {
      title: form.title,
      activity_type: form.activity_type,
      date: form.date,
      start_time: form.start_time || null,
      end_time: form.end_time || null,
      location: form.location || null,
      facilitator_name: form.facilitator_name || null,
      capacity: form.capacity ? parseInt(form.capacity) : null,
      status: form.status,
      notes: form.notes || null,
      is_public: form.is_public,
      guest_description: form.guest_description || null,
      what_to_bring: form.what_to_bring || null,
      safety_note: form.safety_note || null,
      signup_enabled: form.signup_enabled,
    }
    
    try {
      if (editingActivity) {
        await updateActivityAction(editingActivity.id, data)
      } else {
        await createActivityAction(data)
      }
      setDialogOpen(false)
      router.refresh()
      window.location.reload()
    } catch (error) {
      console.error('Failed to save activity:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    setIsSubmitting(true)
    
    try {
      await deleteActivityAction(deleteConfirm.id)
      setDeleteConfirm(null)
      router.refresh()
      window.location.reload()
    } catch (error) {
      console.error('Failed to delete activity:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredActivities = statusFilter === 'all' 
    ? activities 
    : activities.filter(a => a.status === statusFilter)

  // Group activities by date
  const groupedActivities = filteredActivities.reduce((acc, activity) => {
    const date = activity.date
    if (!acc[date]) acc[date] = []
    acc[date].push(activity)
    return acc
  }, {} as Record<string, ScheduledActivity[]>)

  const sortedDates = Object.keys(groupedActivities).sort()

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    if (date.getTime() === today.getTime()) return 'Today'
    if (date.getTime() === tomorrow.getTime()) return 'Tomorrow'
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric',
      timeZone: 'UTC'
    })
  }

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
          <h1 className="text-2xl font-semibold text-foreground">Activities</h1>
          <p className="text-sm text-muted-foreground">Schedule and manage community activities</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ActivityStatus | 'all')}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="planned">Planned</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={openAddActivity}>
            <Plus className="mr-2 h-4 w-4" />
            Add Activity
          </Button>
        </div>
      </div>

      {/* Activities List */}
      <div className="space-y-6">
        {sortedDates.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No activities scheduled</p>
              <Button onClick={openAddActivity} variant="outline" className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Schedule Your First Activity
              </Button>
            </CardContent>
          </Card>
        ) : (
          sortedDates.map(date => (
            <div key={date}>
              <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                {formatDate(date)}
              </h2>
              <div className="grid gap-3">
                {groupedActivities[date].map(activity => {
                  const typeConfig = activityTypeConfig[activity.activity_type]
                  const TypeIcon = typeConfig.icon
                  const sConfig = statusConfig[activity.status]
                  
                  return (
                    <Card key={activity.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <div className={`rounded-lg p-2 ${typeConfig.color}`}>
                              <TypeIcon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-foreground">{activity.title}</h3>
                                <Badge variant="outline" className={`text-xs ${sConfig.color}`}>
                                  {sConfig.label}
                                </Badge>
                                {activity.is_public ? (
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
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                                {(activity.start_time || activity.end_time) && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    {formatTime(activity.start_time)}
                                    {activity.end_time && ` - ${formatTime(activity.end_time)}`}
                                  </span>
                                )}
                                {activity.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {activity.location}
                                  </span>
                                )}
                                {activity.facilitator_name && (
                                  <span className="flex items-center gap-1">
                                    <User className="h-3.5 w-3.5" />
                                    {activity.facilitator_name}
                                  </span>
                                )}
                                {activity.capacity && (
                                  <span className="flex items-center gap-1">
                                    <Users className="h-3.5 w-3.5" />
                                    {activity.capacity} spots
                                  </span>
                                )}
                              </div>
                              
                              {activity.notes && (
                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                  {activity.notes}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => openEditActivity(activity)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => setDeleteConfirm({ id: activity.id, title: activity.title })}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Activity Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingActivity ? 'Edit Activity' : 'Add Activity'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
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
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={form.status} 
                    onValueChange={(v) => setForm(prev => ({ ...prev, status: v as ActivityStatus }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={form.date}
                    onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={form.start_time}
                    onChange={e => setForm(prev => ({ ...prev, start_time: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time">End Time</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={form.end_time}
                    onChange={e => setForm(prev => ({ ...prev, end_time: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={form.location}
                    onChange={e => setForm(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., Beach, Yoga Deck"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facilitator_name">Facilitator</Label>
                  <Input
                    id="facilitator_name"
                    value={form.facilitator_name}
                    onChange={e => setForm(prev => ({ ...prev, facilitator_name: e.target.value }))}
                    placeholder="e.g., Roberto"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity (optional)</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={form.capacity}
                  onChange={e => setForm(prev => ({ ...prev, capacity: e.target.value }))}
                  placeholder="Leave empty for unlimited"
                  min="1"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Internal Notes</Label>
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Notes for staff..."
                  rows={2}
                />
              </div>
            </div>
            
            {/* Guest Display Settings */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-foreground mb-4">Guest Display Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="is_public">Show on Public Page</Label>
                    <p className="text-sm text-muted-foreground">Display this activity to guests</p>
                  </div>
                  <Switch
                    id="is_public"
                    checked={form.is_public}
                    onCheckedChange={(checked) => setForm(prev => ({ ...prev, is_public: checked }))}
                  />
                </div>
                
                {form.is_public && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="guest_description">Guest Description</Label>
                      <Textarea
                        id="guest_description"
                        value={form.guest_description}
                        onChange={e => setForm(prev => ({ ...prev, guest_description: e.target.value }))}
                        placeholder="Description shown to guests..."
                        rows={3}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="what_to_bring">What to Bring</Label>
                      <Textarea
                        id="what_to_bring"
                        value={form.what_to_bring}
                        onChange={e => setForm(prev => ({ ...prev, what_to_bring: e.target.value }))}
                        placeholder="e.g., Towel, water bottle, sunscreen"
                        rows={2}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="safety_note">Safety Note</Label>
                      <Textarea
                        id="safety_note"
                        value={form.safety_note}
                        onChange={e => setForm(prev => ({ ...prev, safety_note: e.target.value }))}
                        placeholder="Important safety information..."
                        rows={2}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="signup_enabled">Enable Signup</Label>
                        <p className="text-sm text-muted-foreground">Allow guests to sign up for this activity</p>
                      </div>
                      <Switch
                        id="signup_enabled"
                        checked={form.signup_enabled}
                        onCheckedChange={(checked) => setForm(prev => ({ ...prev, signup_enabled: checked }))}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting || !form.title.trim() || !form.date}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Activity</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteConfirm?.title}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
