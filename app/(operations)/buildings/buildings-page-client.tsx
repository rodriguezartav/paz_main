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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import type { Building, Room, Resident } from '@/lib/types'
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  BedDouble,
  ChevronDown,
  ChevronRight,
  Home
} from 'lucide-react'
import {
  createBuildingAction,
  updateBuildingAction,
  deleteBuildingAction,
  createRoomAction,
  updateRoomAction,
  deleteRoomAction,
  createBedAction,
  deleteBedAction
} from './actions'

interface BuildingsPageClientProps {
  initialBuildings: Building[]
  residents: Resident[]
}

export function BuildingsPageClient({ initialBuildings, residents }: BuildingsPageClientProps) {
  const router = useRouter()
  const [buildings, setBuildings] = useState<Building[]>(initialBuildings)
  const [expandedBuildings, setExpandedBuildings] = useState<Set<string>>(new Set())
  
  // Building dialog state
  const [buildingDialogOpen, setBuildingDialogOpen] = useState(false)
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null)
  const [buildingForm, setBuildingForm] = useState({ name: '', description: '' })
  
  // Room dialog state
  const [roomDialogOpen, setRoomDialogOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [roomForm, setRoomForm] = useState<{ name: string; description: string; is_private: boolean; building_id: string; room_type: 'private' | 'double' | 'triple' | 'quad' }>({ name: '', description: '', is_private: false, building_id: '', room_type: 'double' })
  
  // Bed dialog state
  const [bedDialogOpen, setBedDialogOpen] = useState(false)
  const [bedForm, setBedForm] = useState({ name: '', room_id: '' })
  
  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'building' | 'room' | 'bed'; id: string; name: string } | null>(null)
  
  const [isSubmitting, setIsSubmitting] = useState(false)

  const toggleBuildingExpanded = (buildingId: string) => {
    setExpandedBuildings(prev => {
      const next = new Set(prev)
      if (next.has(buildingId)) {
        next.delete(buildingId)
      } else {
        next.add(buildingId)
      }
      return next
    })
  }

  // Building handlers
  const openAddBuilding = () => {
    setEditingBuilding(null)
    setBuildingForm({ name: '', description: '' })
    setBuildingDialogOpen(true)
  }

  const openEditBuilding = (building: Building) => {
    setEditingBuilding(building)
    setBuildingForm({ name: building.name, description: building.description || '' })
    setBuildingDialogOpen(true)
  }

  const handleSaveBuilding = async () => {
    if (!buildingForm.name.trim()) return
    setIsSubmitting(true)
    
    try {
      if (editingBuilding) {
        await updateBuildingAction(editingBuilding.id, buildingForm)
      } else {
        await createBuildingAction(buildingForm)
      }
      setBuildingDialogOpen(false)
      router.refresh()
      // Optimistically update
      const updatedBuildings = await fetch('/api/buildings').then(r => r.json()).catch(() => null)
      if (!updatedBuildings) {
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to save building:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Room handlers
const openAddRoom = (buildingId: string) => {
  setEditingRoom(null)
  setRoomForm({ name: '', description: '', is_private: false, building_id: buildingId, room_type: 'double' })
  setRoomDialogOpen(true)
  }

const openEditRoom = (room: Room) => {
  setEditingRoom(room)
  setRoomForm({
  name: room.name,
  description: room.description || '',
  is_private: room.is_private,
  building_id: room.building_id || '',
  room_type: room.room_type || 'double'
    })
    setRoomDialogOpen(true)
  }

  const handleSaveRoom = async () => {
    if (!roomForm.name.trim()) return
    setIsSubmitting(true)
    
    try {
      if (editingRoom) {
        await updateRoomAction(editingRoom.id, roomForm)
      } else {
        await createRoomAction(roomForm)
      }
      setRoomDialogOpen(false)
      router.refresh()
      window.location.reload()
    } catch (error) {
      console.error('Failed to save room:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Bed handlers
  const openAddBed = (roomId: string) => {
    setBedForm({ name: '', room_id: roomId })
    setBedDialogOpen(true)
  }

  const handleSaveBed = async () => {
    if (!bedForm.name.trim()) return
    setIsSubmitting(true)
    
    try {
      await createBedAction(bedForm)
      setBedDialogOpen(false)
      router.refresh()
      window.location.reload()
    } catch (error) {
      console.error('Failed to save bed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete handlers
  const handleDelete = async () => {
    if (!deleteConfirm) return
    setIsSubmitting(true)
    
    try {
      if (deleteConfirm.type === 'building') {
        await deleteBuildingAction(deleteConfirm.id)
      } else if (deleteConfirm.type === 'room') {
        await deleteRoomAction(deleteConfirm.id)
      } else if (deleteConfirm.type === 'bed') {
        await deleteBedAction(deleteConfirm.id)
      }
      setDeleteConfirm(null)
      router.refresh()
      window.location.reload()
    } catch (error) {
      console.error('Failed to delete:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTotalBeds = (building: Building) => {
    return building.rooms?.reduce((sum, room) => sum + (room.beds?.length || 0), 0) || 0
  }

  const getOccupiedBeds = (building: Building) => {
    return building.rooms?.reduce((sum, room) => 
      sum + (room.beds?.filter(bed => bed.current_assignment)?.length || 0), 0) || 0
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Manage Buildings</h1>
          <p className="text-sm text-muted-foreground">Create and organize buildings with their rooms</p>
        </div>
        <Button onClick={openAddBuilding}>
          <Plus className="mr-2 h-4 w-4" />
          Add Building
        </Button>
      </div>

      {/* Buildings List */}
      <div className="space-y-4">
        {buildings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No buildings yet</p>
              <Button onClick={openAddBuilding} variant="outline" className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Building
              </Button>
            </CardContent>
          </Card>
        ) : (
          buildings.map(building => {
            const isExpanded = expandedBuildings.has(building.id)
            const totalBeds = getTotalBeds(building)
            const occupiedBeds = getOccupiedBeds(building)
            
            return (
              <Card key={building.id} className="overflow-hidden">
                <Collapsible open={isExpanded} onOpenChange={() => toggleBuildingExpanded(building.id)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          )}
                          <Building2 className="h-5 w-5 text-primary" />
                          <div>
                            <CardTitle className="text-lg">{building.name}</CardTitle>
                            {building.description && (
                              <p className="text-sm text-muted-foreground mt-1">{building.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Home className="h-4 w-4" />
                            <span>{building.rooms?.length || 0} rooms</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <BedDouble className="h-4 w-4" />
                            <span>{occupiedBeds}/{totalBeds} beds</span>
                          </div>
                          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => openEditBuilding(building)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => setDeleteConfirm({ type: 'building', id: building.id, name: building.name })}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="border-t pt-4">
                      <div className="space-y-4">
                        {/* Add Room Button */}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openAddRoom(building.id)}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Room
                        </Button>
                        
                        {/* Rooms List */}
                        {building.rooms && building.rooms.length > 0 ? (
                          <div className="grid gap-3">
                            {building.rooms.map(room => (
                              <div 
                                key={room.id} 
                                className="rounded-lg border bg-card p-4"
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <Home className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{room.name}</span>
                                    {room.is_private && (
                                      <Badge variant="secondary" className="text-xs">Private</Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => openEditRoom(room)}
                                    >
                                      <Edit className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => setDeleteConfirm({ type: 'room', id: room.id, name: room.name })}
                                    >
                                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                    </Button>
                                  </div>
                                </div>
                                
                                {room.description && (
                                  <p className="text-sm text-muted-foreground mb-3">{room.description}</p>
                                )}
                                
                                {/* Beds */}
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                      Beds ({room.beds?.length || 0})
                                    </span>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      className="h-7 text-xs"
                                      onClick={() => openAddBed(room.id)}
                                    >
                                      <Plus className="mr-1 h-3 w-3" />
                                      Add Bed
                                    </Button>
                                  </div>
                                  
                                  {room.beds && room.beds.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                      {room.beds.map(bed => (
                                        <div 
                                          key={bed.id}
                                          className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm"
                                        >
                                          <BedDouble className="h-3.5 w-3.5 text-muted-foreground" />
                                          <span>{bed.name}</span>
                                          {bed.current_assignment?.resident && (
                                            <Badge variant="outline" className="text-xs">
                                              {bed.current_assignment.resident.name}
                                            </Badge>
                                          )}
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-5 w-5 ml-1"
                                            onClick={() => setDeleteConfirm({ type: 'bed', id: bed.id, name: bed.name })}
                                          >
                                            <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-muted-foreground italic">No beds yet</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">No rooms in this building yet</p>
                        )}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            )
          })
        )}
      </div>

      {/* Building Dialog */}
      <Dialog open={buildingDialogOpen} onOpenChange={setBuildingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBuilding ? 'Edit Building' : 'Add Building'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="building-name">Name</Label>
              <Input
                id="building-name"
                value={buildingForm.name}
                onChange={e => setBuildingForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Main Lodge"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="building-description">Description</Label>
              <Textarea
                id="building-description"
                value={buildingForm.description}
                onChange={e => setBuildingForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBuildingDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveBuilding} disabled={isSubmitting || !buildingForm.name.trim()}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Room Dialog */}
      <Dialog open={roomDialogOpen} onOpenChange={setRoomDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRoom ? 'Edit Room' : 'Add Room'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="room-name">Name</Label>
              <Input
                id="room-name"
                value={roomForm.name}
                onChange={e => setRoomForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Dorm A"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="room-description">Description</Label>
              <Textarea
                id="room-description"
                value={roomForm.description}
                onChange={e => setRoomForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description..."
                rows={2}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="room-private">Private Room</Label>
                <p className="text-sm text-muted-foreground">For single-guest bookings</p>
              </div>
              <Switch
                id="room-private"
                checked={roomForm.is_private}
                onCheckedChange={checked => setRoomForm(prev => ({ ...prev, is_private: checked }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoomDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRoom} disabled={isSubmitting || !roomForm.name.trim()}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bed Dialog */}
      <Dialog open={bedDialogOpen} onOpenChange={setBedDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Bed</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bed-name">Bed Name</Label>
              <Input
                id="bed-name"
                value={bedForm.name}
                onChange={e => setBedForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Bed 1, Window Bed, Top Bunk"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBedDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveBed} disabled={isSubmitting || !bedForm.name.trim()}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteConfirm?.type}?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteConfirm?.name}&quot;?
              {deleteConfirm?.type === 'building' && ' This will also delete all rooms and beds in this building.'}
              {deleteConfirm?.type === 'room' && ' This will also delete all beds in this room.'}
              {' '}This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
