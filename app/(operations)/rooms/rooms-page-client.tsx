'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Building2, Plus, Edit, Trash2, BedDouble, User, UserPlus, Users } from 'lucide-react'
import type { Room, Bed, Resident } from '@/lib/types'
import {
  createRoomAction,
  updateRoomAction,
  deleteRoomAction,
  createBedAction,
  updateBedAction,
  deleteBedAction,
  assignBedAction,
  unassignBedAction,
  assignAllBedsInRoomAction,
} from './actions'

interface RoomsPageClientProps {
  initialRooms: Room[]
  residents: Resident[]
}

export function RoomsPageClient({ initialRooms, residents }: RoomsPageClientProps) {
  const router = useRouter()
  const [rooms, setRooms] = useState<Room[]>(initialRooms)
  const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false)
  const [isBedDialogOpen, setIsBedDialogOpen] = useState(false)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [isAssignAllDialogOpen, setIsAssignAllDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [editingBed, setEditingBed] = useState<Bed | null>(null)
  const [selectedRoomForBed, setSelectedRoomForBed] = useState<Room | null>(null)
  const [selectedBedForAssign, setSelectedBedForAssign] = useState<Bed | null>(null)
  const [selectedRoomForAssignAll, setSelectedRoomForAssignAll] = useState<Room | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'room' | 'bed'; id: string; name: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Room form state
  const [roomName, setRoomName] = useState('')
  const [roomDescription, setRoomDescription] = useState('')
  const [roomIsPrivate, setRoomIsPrivate] = useState(false)

  // Bed form state
  const [bedName, setBedName] = useState('')

  // Assignment state
  const [selectedResidentId, setSelectedResidentId] = useState('')

  const openRoomDialog = (room?: Room) => {
    if (room) {
      setEditingRoom(room)
      setRoomName(room.name)
      setRoomDescription(room.description || '')
      setRoomIsPrivate(room.is_private)
    } else {
      setEditingRoom(null)
      setRoomName('')
      setRoomDescription('')
      setRoomIsPrivate(false)
    }
    setIsRoomDialogOpen(true)
  }

  const openBedDialog = (room: Room, bed?: Bed) => {
    setSelectedRoomForBed(room)
    if (bed) {
      setEditingBed(bed)
      setBedName(bed.name)
    } else {
      setEditingBed(null)
      setBedName('')
    }
    setIsBedDialogOpen(true)
  }

  const openAssignDialog = (bed: Bed) => {
    setSelectedBedForAssign(bed)
    setSelectedResidentId(bed.current_assignment?.resident_id || '')
    setIsAssignDialogOpen(true)
  }

  const openAssignAllDialog = (room: Room) => {
    setSelectedRoomForAssignAll(room)
    setSelectedResidentId('')
    setIsAssignAllDialogOpen(true)
  }

  const openDeleteDialog = (type: 'room' | 'bed', id: string, name: string) => {
    setDeleteTarget({ type, id, name })
    setIsDeleteDialogOpen(true)
  }

  const handleSaveRoom = async () => {
    setIsLoading(true)
    try {
      if (editingRoom) {
        await updateRoomAction(editingRoom.id, {
          name: roomName,
          description: roomDescription || null,
          is_private: roomIsPrivate,
        })
      } else {
        await createRoomAction({
          name: roomName,
          description: roomDescription || null,
          is_private: roomIsPrivate,
        })
      }
      setIsRoomDialogOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Error saving room:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveBed = async () => {
    if (!selectedRoomForBed) return
    setIsLoading(true)
    try {
      if (editingBed) {
        await updateBedAction(editingBed.id, { name: bedName })
      } else {
        await createBedAction({
          room_id: selectedRoomForBed.id,
          name: bedName,
        })
      }
      setIsBedDialogOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Error saving bed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAssignBed = async () => {
    if (!selectedBedForAssign) return
    setIsLoading(true)
    try {
      if (selectedResidentId) {
        await assignBedAction(selectedResidentId, selectedBedForAssign.id)
      } else {
        await unassignBedAction(selectedBedForAssign.id)
      }
      setIsAssignDialogOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Error assigning bed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAssignAllBeds = async () => {
    if (!selectedRoomForAssignAll || !selectedResidentId) return
    setIsLoading(true)
    try {
      await assignAllBedsInRoomAction(selectedResidentId, selectedRoomForAssignAll.id)
      setIsAssignAllDialogOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Error assigning all beds:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsLoading(true)
    try {
      if (deleteTarget.type === 'room') {
        await deleteRoomAction(deleteTarget.id)
      } else {
        await deleteBedAction(deleteTarget.id)
      }
      setIsDeleteDialogOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Error deleting:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Rooms</h1>
          <p className="text-sm text-muted-foreground">
            Manage rooms and bed assignments
          </p>
        </div>
        <Button onClick={() => openRoomDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Room
        </Button>
      </div>

      {/* Rooms Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {rooms.map((room) => (
          <Card key={room.id} className="overflow-hidden">
            <CardHeader className="bg-sidebar-accent/30">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{room.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      {room.is_private && (
                        <Badge variant="secondary" className="text-xs">Private</Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {room.beds?.length || 0} bed{(room.beds?.length || 0) !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openRoomDialog(room)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => openDeleteDialog('room', room.id, room.name)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {room.description && (
                <p className="text-sm text-muted-foreground mt-2">{room.description}</p>
              )}
            </CardHeader>
            <CardContent className="pt-4">
              {/* Beds List */}
              <div className="space-y-2">
                {room.beds?.map((bed) => (
                  <div
                    key={bed.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-background p-3"
                  >
                    <div className="flex items-center gap-3">
                      <BedDouble className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{bed.name}</span>
                      {bed.current_assignment?.resident ? (
                        <Badge variant="default" className="gap-1">
                          <User className="h-3 w-3" />
                          {bed.current_assignment.resident.name}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          Available
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => openAssignDialog(bed)}
                        title="Assign resident"
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => openBedDialog(room, bed)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => openDeleteDialog('bed', bed.id, bed.name)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {(!room.beds || room.beds.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No beds in this room
                  </p>
                )}
              </div>

              {/* Room Actions */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => openBedDialog(room)}
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add Bed
                </Button>
                {room.beds && room.beds.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => openAssignAllDialog(room)}
                  >
                    <Users className="mr-1.5 h-4 w-4" />
                    Assign All Beds
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {rooms.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No rooms yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get started by adding your first room
              </p>
              <Button onClick={() => openRoomDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Room
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Room Dialog */}
      <Dialog open={isRoomDialogOpen} onOpenChange={setIsRoomDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRoom ? 'Edit Room' : 'Add Room'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="roomName">Name</Label>
              <Input
                id="roomName"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="e.g., Dorm A, Private 1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roomDescription">Description (optional)</Label>
              <Input
                id="roomDescription"
                value={roomDescription}
                onChange={(e) => setRoomDescription(e.target.value)}
                placeholder="e.g., Main dormitory with 4 beds"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="roomIsPrivate"
                checked={roomIsPrivate}
                onCheckedChange={(checked) => setRoomIsPrivate(checked === true)}
              />
              <Label htmlFor="roomIsPrivate" className="text-sm font-normal">
                Private room (for single bookings)
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoomDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRoom} disabled={!roomName || isLoading}>
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bed Dialog */}
      <Dialog open={isBedDialogOpen} onOpenChange={setIsBedDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingBed ? 'Edit Bed' : 'Add Bed'} 
              {selectedRoomForBed && ` - ${selectedRoomForBed.name}`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bedName">Bed Name</Label>
              <Input
                id="bedName"
                value={bedName}
                onChange={(e) => setBedName(e.target.value)}
                placeholder="e.g., A1, Queen, Bunk Top"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBedDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveBed} disabled={!bedName || isLoading}>
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Bed Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Assign Bed {selectedBedForAssign?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Resident</Label>
              <Select value={selectedResidentId} onValueChange={setSelectedResidentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a resident or leave empty to unassign" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">
                    <span className="text-muted-foreground">Unassign (no resident)</span>
                  </SelectItem>
                  {residents.map((resident) => (
                    <SelectItem key={resident.id} value={resident.id}>
                      {resident.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedBedForAssign?.current_assignment?.resident && (
              <p className="text-sm text-muted-foreground">
                Currently assigned to: {selectedBedForAssign.current_assignment.resident.name}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignBed} disabled={isLoading}>
              {isLoading ? 'Saving...' : selectedResidentId ? 'Assign' : 'Unassign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign All Beds Dialog */}
      <Dialog open={isAssignAllDialogOpen} onOpenChange={setIsAssignAllDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Assign All Beds in {selectedRoomForAssignAll?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              This will assign all {selectedRoomForAssignAll?.beds?.length || 0} bed(s) in this room to the selected resident.
              This is useful for private room bookings.
            </p>
            <div className="space-y-2">
              <Label>Resident</Label>
              <Select value={selectedResidentId} onValueChange={setSelectedResidentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a resident" />
                </SelectTrigger>
                <SelectContent>
                  {residents.map((resident) => (
                    <SelectItem key={resident.id} value={resident.id}>
                      {resident.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignAllDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignAllBeds} disabled={!selectedResidentId || isLoading}>
              {isLoading ? 'Assigning...' : 'Assign All Beds'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.type === 'room' ? 'Room' : 'Bed'}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteTarget?.name}?
              {deleteTarget?.type === 'room' && ' This will also delete all beds in this room.'}
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
