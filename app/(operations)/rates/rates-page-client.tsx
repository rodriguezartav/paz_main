'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { RateRule, RateApplicationType, RateRoomType } from '@/lib/types'
import { Plus, Pencil, DollarSign, Users, Home, Tent, Loader2 } from 'lucide-react'
import { createRateRuleAction, updateRateRuleAction, toggleRateRuleActiveAction } from './actions'

interface RatesPageClientProps {
  initialRates: RateRule[]
}

const applicationTypeOptions: { value: RateApplicationType; label: string }[] = [
  { value: 'resident', label: 'Resident' },
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'retreat', label: 'Retreat' },
]

const roomTypeOptions: { value: RateRoomType; label: string }[] = [
  { value: 'quad', label: 'Quad' },
  { value: 'double', label: 'Double' },
  { value: 'private', label: 'Private' },
  { value: 'any', label: 'Any' },
]

const applicationTypeColors: Record<RateApplicationType, string> = {
  resident: 'bg-blue-100 text-blue-800 border-blue-200',
  volunteer: 'bg-green-100 text-green-800 border-green-200',
  retreat: 'bg-purple-100 text-purple-800 border-purple-200',
}

const roomTypeColors: Record<RateRoomType, string> = {
  quad: 'bg-amber-100 text-amber-800 border-amber-200',
  double: 'bg-orange-100 text-orange-800 border-orange-200',
  private: 'bg-rose-100 text-rose-800 border-rose-200',
  any: 'bg-slate-100 text-slate-800 border-slate-200',
}

export function RatesPageClient({ initialRates }: RatesPageClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRate, setEditingRate] = useState<RateRule | null>(null)
  
  // Form state
  const [formName, setFormName] = useState('')
  const [formApplicationType, setFormApplicationType] = useState<RateApplicationType>('resident')
  const [formRoomType, setFormRoomType] = useState<RateRoomType>('double')
  const [formBaseRate, setFormBaseRate] = useState('')
  const [formCurrency, setFormCurrency] = useState('USD')
  const [formIsActive, setFormIsActive] = useState(true)
  const [formNotes, setFormNotes] = useState('')

  // Stats
  const activeRates = initialRates.filter(r => r.is_active)
  const residentRates = initialRates.filter(r => r.application_type === 'resident')
  const volunteerRates = initialRates.filter(r => r.application_type === 'volunteer')
  const retreatRates = initialRates.filter(r => r.application_type === 'retreat')

  const openCreateDialog = () => {
    setEditingRate(null)
    setFormName('')
    setFormApplicationType('resident')
    setFormRoomType('double')
    setFormBaseRate('')
    setFormCurrency('USD')
    setFormIsActive(true)
    setFormNotes('')
    setIsDialogOpen(true)
  }

  const openEditDialog = (rate: RateRule) => {
    setEditingRate(rate)
    setFormName(rate.name)
    setFormApplicationType(rate.application_type)
    setFormRoomType(rate.room_type)
    setFormBaseRate(rate.base_nightly_rate.toString())
    setFormCurrency(rate.currency)
    setFormIsActive(rate.is_active)
    setFormNotes(rate.notes || '')
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (!formName.trim() || !formBaseRate) return
    
    const baseRate = parseFloat(formBaseRate)
    if (isNaN(baseRate) || baseRate < 0) return

    startTransition(async () => {
      if (editingRate) {
        await updateRateRuleAction(editingRate.id, {
          name: formName.trim(),
          application_type: formApplicationType,
          room_type: formRoomType,
          base_nightly_rate: baseRate,
          currency: formCurrency,
          is_active: formIsActive,
          notes: formNotes.trim() || null
        })
      } else {
        await createRateRuleAction({
          name: formName.trim(),
          application_type: formApplicationType,
          room_type: formRoomType,
          base_nightly_rate: baseRate,
          currency: formCurrency,
          is_active: formIsActive,
          notes: formNotes.trim() || null
        })
      }
      setIsDialogOpen(false)
      router.refresh()
    })
  }

  const handleToggleActive = (rate: RateRule) => {
    startTransition(async () => {
      await toggleRateRuleActiveAction(rate.id, !rate.is_active)
      router.refresh()
    })
  }

  const renderRateGroup = (title: string, rates: RateRule[], icon: React.ReactNode) => {
    const groupRates = rates.sort((a, b) => {
      // Sort by active status first, then by room type
      if (a.is_active !== b.is_active) return a.is_active ? -1 : 1
      return a.room_type.localeCompare(b.room_type)
    })

    return (
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="text-lg">{title}</CardTitle>
            <Badge variant="secondary" className="ml-auto">
              {rates.filter(r => r.is_active).length} active
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {groupRates.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">
              No rates in this category yet.
            </p>
          ) : (
            <div className="space-y-3">
              {groupRates.map(rate => (
                <div 
                  key={rate.id} 
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    rate.is_active ? 'bg-background' : 'bg-muted/50 opacity-60'
                  }`}
                >
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-card-foreground truncate">
                        {rate.name}
                      </span>
                      <Badge className={roomTypeColors[rate.room_type]} variant="outline">
                        {rate.room_type}
                      </Badge>
                      {!rate.is_active && (
                        <Badge variant="secondary" className="bg-gray-200 text-gray-600">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    {rate.notes && (
                      <p className="text-xs text-muted-foreground truncate">
                        {rate.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 ml-3">
                    <span className="font-semibold text-lg whitespace-nowrap">
                      ${rate.base_nightly_rate.toFixed(0)}
                      <span className="text-xs text-muted-foreground font-normal">/night</span>
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(rate)}
                      disabled={isPending}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Guest Rates</h1>
          <p className="text-muted-foreground">
            Manage base nightly rates for residents, volunteers, and retreats.
          </p>
        </div>
        <Button onClick={openCreateDialog} disabled={isPending}>
          <Plus className="mr-2 h-4 w-4" />
          New Rate
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeRates.length}</p>
                <p className="text-xs text-muted-foreground">Active Rates</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-100 p-2">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{residentRates.length}</p>
                <p className="text-xs text-muted-foreground">Resident</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-100 p-2">
                <Home className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{volunteerRates.length}</p>
                <p className="text-xs text-muted-foreground">Volunteer</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-100 p-2">
                <Tent className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{retreatRates.length}</p>
                <p className="text-xs text-muted-foreground">Retreat</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      {initialRates.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="py-12 text-center">
            <DollarSign className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No base rates yet</h3>
            <p className="mt-2 text-muted-foreground">
              No base rates have been created yet. Create your first base rate.
            </p>
            <Button onClick={openCreateDialog} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Create First Rate
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Rate Groups */
        <div className="space-y-6">
          {renderRateGroup(
            'Resident Rates',
            residentRates,
            <Users className="h-5 w-5 text-blue-600" />
          )}
          {renderRateGroup(
            'Volunteer Rates',
            volunteerRates,
            <Home className="h-5 w-5 text-green-600" />
          )}
          {renderRateGroup(
            'Retreat Rates',
            retreatRates,
            <Tent className="h-5 w-5 text-purple-600" />
          )}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingRate ? 'Edit Rate' : 'Create New Rate'}</DialogTitle>
            <DialogDescription>
              {editingRate 
                ? 'Update the base rate details below.' 
                : 'Set up a new base nightly rate.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g., Resident Quad"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Application Type *</Label>
                <Select 
                  value={formApplicationType} 
                  onValueChange={(v) => setFormApplicationType(v as RateApplicationType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {applicationTypeOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Room Type *</Label>
                <Select 
                  value={formRoomType} 
                  onValueChange={(v) => setFormRoomType(v as RateRoomType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypeOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="baseRate">Base Nightly Rate *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="baseRate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formBaseRate}
                    onChange={(e) => setFormBaseRate(e.target.value)}
                    className="pl-7"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={formCurrency} onValueChange={setFormCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label htmlFor="active" className="text-sm font-medium">Active</Label>
                <p className="text-xs text-muted-foreground">
                  Inactive rates will not be suggested
                </p>
              </div>
              <Switch
                id="active"
                checked={formIsActive}
                onCheckedChange={setFormIsActive}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Optional notes about this rate..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isPending || !formName.trim() || !formBaseRate}
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {editingRate ? 'Save Changes' : 'Create Rate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
