'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { RateRule, RateApplicationType, RateRoomType, ResidentPriceModifier, AdjustmentType } from '@/lib/types'
import { Plus, Pencil, DollarSign, Users, Home, Tent, Loader2, Calculator, AlertTriangle, Info, Percent, Hash } from 'lucide-react'
import { createRateRuleAction, updateRateRuleAction, toggleRateRuleActiveAction, createResidentPriceModifierAction, updateResidentPriceModifierAction, toggleResidentPriceModifierActiveAction } from './actions'

interface RatesPageClientProps {
  initialRates: RateRule[]
  initialModifiers: ResidentPriceModifier[]
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

const roomTypeColors: Record<RateRoomType, string> = {
  quad: 'bg-amber-100 text-amber-800 border-amber-200',
  double: 'bg-orange-100 text-orange-800 border-orange-200',
  private: 'bg-rose-100 text-rose-800 border-rose-200',
  any: 'bg-slate-100 text-slate-800 border-slate-200',
}

export function RatesPageClient({ initialRates, initialModifiers }: RatesPageClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  // Rate Dialog state
  const [isRateDialogOpen, setIsRateDialogOpen] = useState(false)
  const [editingRate, setEditingRate] = useState<RateRule | null>(null)
  
  // Rate Form state
  const [formName, setFormName] = useState('')
  const [formApplicationType, setFormApplicationType] = useState<RateApplicationType>('resident')
  const [formRoomType, setFormRoomType] = useState<RateRoomType>('double')
  const [formBaseRate, setFormBaseRate] = useState('')
  const [formCurrency, setFormCurrency] = useState('USD')
  const [formIsActive, setFormIsActive] = useState(true)
  const [formNotes, setFormNotes] = useState('')

  // Modifier Dialog state
  const [isModifierDialogOpen, setIsModifierDialogOpen] = useState(false)
  const [editingModifier, setEditingModifier] = useState<ResidentPriceModifier | null>(null)
  
  // Modifier Form state
  const [modFormName, setModFormName] = useState('')
  const [modFormMinNights, setModFormMinNights] = useState('')
  const [modFormMaxNights, setModFormMaxNights] = useState('')
  const [modFormAdjustmentType, setModFormAdjustmentType] = useState<AdjustmentType>('percentage')
  const [modFormAdjustmentValue, setModFormAdjustmentValue] = useState('')
  const [modFormIsActive, setModFormIsActive] = useState(true)
  const [modFormNotes, setModFormNotes] = useState('')

  // Preview Tool state
  const [previewBaseRate, setPreviewBaseRate] = useState('')
  const [previewNights, setPreviewNights] = useState('')

  // Stats
  const activeRates = initialRates.filter(r => r.is_active)
  const residentRates = initialRates.filter(r => r.application_type === 'resident')
  const volunteerRates = initialRates.filter(r => r.application_type === 'volunteer')
  const retreatRates = initialRates.filter(r => r.application_type === 'retreat')
  const activeModifiers = initialModifiers.filter(m => m.is_active)

  // Preview calculation
  const previewResult = useMemo(() => {
    const baseRate = parseFloat(previewBaseRate)
    const nights = parseInt(previewNights)
    
    if (isNaN(baseRate) || baseRate <= 0 || isNaN(nights) || nights <= 0) {
      return null
    }

    // Warning for less than 8 nights
    if (nights < 8) {
      return {
        type: 'warning' as const,
        message: 'Resident rates are designed for an 8-night minimum stay. Use retreat pricing or manual override for shorter stays.',
        finalRate: null,
        modifier: null
      }
    }

    // Warning for more than 30 nights
    if (nights > 30) {
      return {
        type: 'warning' as const,
        message: 'Resident stays longer than 30 nights require manual review.',
        finalRate: null,
        modifier: null
      }
    }

    // Find applicable modifier
    const applicableModifier = activeModifiers.find(m => 
      nights >= m.min_nights && (m.max_nights === null || nights <= m.max_nights)
    )

    if (!applicableModifier) {
      return {
        type: 'info' as const,
        message: 'No active modifier found for this stay length.',
        finalRate: baseRate,
        modifier: null
      }
    }

    // Calculate final rate
    let finalRate: number
    if (applicableModifier.adjustment_type === 'percentage') {
      finalRate = baseRate * (1 + applicableModifier.adjustment_value / 100)
    } else {
      finalRate = baseRate + applicableModifier.adjustment_value
    }

    // Round to nearest whole dollar
    finalRate = Math.round(finalRate)

    return {
      type: 'success' as const,
      message: `${applicableModifier.name} applied because this stay qualifies for a ${Math.abs(applicableModifier.adjustment_value)}% resident discount.`,
      finalRate,
      modifier: applicableModifier
    }
  }, [previewBaseRate, previewNights, activeModifiers])

  // Rate dialog handlers
  const openCreateRateDialog = () => {
    setEditingRate(null)
    setFormName('')
    setFormApplicationType('resident')
    setFormRoomType('double')
    setFormBaseRate('')
    setFormCurrency('USD')
    setFormIsActive(true)
    setFormNotes('')
    setIsRateDialogOpen(true)
  }

  const openEditRateDialog = (rate: RateRule) => {
    setEditingRate(rate)
    setFormName(rate.name)
    setFormApplicationType(rate.application_type)
    setFormRoomType(rate.room_type)
    setFormBaseRate(rate.base_nightly_rate.toString())
    setFormCurrency(rate.currency)
    setFormIsActive(rate.is_active)
    setFormNotes(rate.notes || '')
    setIsRateDialogOpen(true)
  }

  const handleSaveRate = () => {
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
      setIsRateDialogOpen(false)
      router.refresh()
    })
  }

  // Modifier dialog handlers
  const openCreateModifierDialog = () => {
    setEditingModifier(null)
    setModFormName('')
    setModFormMinNights('')
    setModFormMaxNights('')
    setModFormAdjustmentType('percentage')
    setModFormAdjustmentValue('')
    setModFormIsActive(true)
    setModFormNotes('')
    setIsModifierDialogOpen(true)
  }

  const openEditModifierDialog = (modifier: ResidentPriceModifier) => {
    setEditingModifier(modifier)
    setModFormName(modifier.name)
    setModFormMinNights(modifier.min_nights.toString())
    setModFormMaxNights(modifier.max_nights?.toString() || '')
    setModFormAdjustmentType(modifier.adjustment_type)
    setModFormAdjustmentValue(modifier.adjustment_value.toString())
    setModFormIsActive(modifier.is_active)
    setModFormNotes(modifier.notes || '')
    setIsModifierDialogOpen(true)
  }

  const handleSaveModifier = () => {
    const minNights = parseInt(modFormMinNights)
    const maxNights = modFormMaxNights ? parseInt(modFormMaxNights) : null
    const adjustmentValue = parseFloat(modFormAdjustmentValue)

    if (!modFormName.trim() || isNaN(minNights) || minNights < 1 || isNaN(adjustmentValue)) return
    if (maxNights !== null && maxNights < minNights) return

    startTransition(async () => {
      if (editingModifier) {
        await updateResidentPriceModifierAction(editingModifier.id, {
          name: modFormName.trim(),
          min_nights: minNights,
          max_nights: maxNights,
          adjustment_type: modFormAdjustmentType,
          adjustment_value: adjustmentValue,
          is_active: modFormIsActive,
          notes: modFormNotes.trim() || null
        })
      } else {
        await createResidentPriceModifierAction({
          name: modFormName.trim(),
          min_nights: minNights,
          max_nights: maxNights,
          adjustment_type: modFormAdjustmentType,
          adjustment_value: adjustmentValue,
          is_active: modFormIsActive,
          notes: modFormNotes.trim() || null
        })
      }
      setIsModifierDialogOpen(false)
      router.refresh()
    })
  }

  const handleToggleModifierActive = (modifier: ResidentPriceModifier) => {
    startTransition(async () => {
      await toggleResidentPriceModifierActiveAction(modifier.id, !modifier.is_active)
      router.refresh()
    })
  }

  const renderRateGroup = (title: string, rates: RateRule[], icon: React.ReactNode, description: string) => {
    const groupRates = rates.sort((a, b) => {
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
          <CardDescription className="text-xs">{description}</CardDescription>
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
                      onClick={() => openEditRateDialog(rate)}
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
            Manage base nightly rates and resident price modifiers.
          </p>
        </div>
        <Button onClick={openCreateRateDialog} disabled={isPending}>
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

      {/* Base Rates Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-foreground">Base Rates</h2>
        
        {initialRates.length === 0 ? (
          <Card className="border-border bg-card">
            <CardContent className="py-12 text-center">
              <DollarSign className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No base rates yet</h3>
              <p className="mt-2 text-muted-foreground">
                No base rates have been created yet. Create your first base rate.
              </p>
              <Button onClick={openCreateRateDialog} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Create First Rate
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {renderRateGroup(
              'Resident Rates',
              residentRates,
              <Users className="h-5 w-5 text-blue-600" />,
              'Resident base rates apply from 8 nights onward. Resident discounts may apply depending on length of stay.'
            )}
            {renderRateGroup(
              'Volunteer Rates',
              volunteerRates,
              <Home className="h-5 w-5 text-green-600" />,
              'Volunteer rates use base rate only.'
            )}
            {renderRateGroup(
              'Retreat Rates',
              retreatRates,
              <Tent className="h-5 w-5 text-purple-600" />,
              'Retreat rates use base rate only.'
            )}
          </div>
        )}
      </div>

      {/* Resident Price Modifiers Section */}
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Resident Price Modifiers</h2>
            <p className="text-sm text-muted-foreground">
              Discounts applied to resident stays based on length of stay.
            </p>
          </div>
          <Button onClick={openCreateModifierDialog} disabled={isPending} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            New Modifier
          </Button>
        </div>

        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Active Modifiers</CardTitle>
              <Badge variant="secondary" className="ml-auto">
                {activeModifiers.length} active
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Price modifiers apply ONLY to resident rates. Volunteer and retreat rates use base rates only.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {initialModifiers.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">
                No price modifiers created yet.
              </p>
            ) : (
              <div className="space-y-3">
                {initialModifiers.map(modifier => (
                  <div 
                    key={modifier.id} 
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      modifier.is_active ? 'bg-background' : 'bg-muted/50 opacity-60'
                    }`}
                  >
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-card-foreground truncate">
                          {modifier.name}
                        </span>
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200" variant="outline">
                          {modifier.min_nights}–{modifier.max_nights || '∞'} Nights
                        </Badge>
                        <Badge className={modifier.adjustment_type === 'percentage' ? 'bg-violet-100 text-violet-800 border-violet-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200'} variant="outline">
                          {modifier.adjustment_type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                        </Badge>
                        {!modifier.is_active && (
                          <Badge variant="secondary" className="bg-gray-200 text-gray-600">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      {modifier.notes && (
                        <p className="text-xs text-muted-foreground truncate">
                          {modifier.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 ml-3">
                      <span className="font-semibold text-lg whitespace-nowrap text-blue-600">
                        {modifier.adjustment_value > 0 ? '+' : ''}{modifier.adjustment_value}
                        {modifier.adjustment_type === 'percentage' ? '%' : '$'}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditModifierDialog(modifier)}
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
      </div>

      {/* Resident Price Modifier Preview Tool */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-foreground">Rate Preview Tool</h2>
        
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Calculate Resident Rate</CardTitle>
            </div>
            <CardDescription>
              Enter a base rate and number of nights to preview the final rate with modifiers applied.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="previewBaseRate">Base Nightly Rate</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="previewBaseRate"
                    type="number"
                    min="0"
                    step="1"
                    value={previewBaseRate}
                    onChange={(e) => setPreviewBaseRate(e.target.value)}
                    className="pl-7"
                    placeholder="100"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="previewNights">Total Nights</Label>
                <Input
                  id="previewNights"
                  type="number"
                  min="1"
                  step="1"
                  value={previewNights}
                  onChange={(e) => setPreviewNights(e.target.value)}
                  placeholder="14"
                />
              </div>
            </div>

            {previewResult && (
              <div className="mt-4">
                {previewResult.type === 'warning' && (
                  <Alert variant="destructive" className="bg-amber-50 border-amber-200 text-amber-800">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Warning</AlertTitle>
                    <AlertDescription>{previewResult.message}</AlertDescription>
                  </Alert>
                )}
                {previewResult.type === 'info' && (
                  <Alert className="bg-blue-50 border-blue-200 text-blue-800">
                    <Info className="h-4 w-4" />
                    <AlertTitle>No Modifier Applied</AlertTitle>
                    <AlertDescription>
                      {previewResult.message}
                      <div className="mt-2 text-lg font-semibold">
                        Final Rate: ${previewResult.finalRate}/night
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
                {previewResult.type === 'success' && (
                  <Alert className="bg-green-50 border-green-200 text-green-800">
                    <DollarSign className="h-4 w-4" />
                    <AlertTitle>Modifier Applied</AlertTitle>
                    <AlertDescription>
                      {previewResult.message}
                      <div className="mt-2 flex items-center gap-4">
                        <div>
                          <span className="text-sm text-muted-foreground">Base:</span>{' '}
                          <span className="line-through">${parseFloat(previewBaseRate).toFixed(0)}</span>
                        </div>
                        <div className="text-lg font-semibold">
                          Final Rate: ${previewResult.finalRate}/night
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Rate Dialog */}
      <Dialog open={isRateDialogOpen} onOpenChange={setIsRateDialogOpen}>
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
            <Button variant="outline" onClick={() => setIsRateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveRate}
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

      {/* Create/Edit Modifier Dialog */}
      <Dialog open={isModifierDialogOpen} onOpenChange={setIsModifierDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingModifier ? 'Edit Modifier' : 'Create New Modifier'}</DialogTitle>
            <DialogDescription>
              {editingModifier 
                ? 'Update the price modifier details below.' 
                : 'Set up a new resident price modifier.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="modName">Name *</Label>
              <Input
                id="modName"
                value={modFormName}
                onChange={(e) => setModFormName(e.target.value)}
                placeholder="e.g., Resident 8 to 14 Nights"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minNights">Min Nights *</Label>
                <Input
                  id="minNights"
                  type="number"
                  min="1"
                  step="1"
                  value={modFormMinNights}
                  onChange={(e) => setModFormMinNights(e.target.value)}
                  placeholder="8"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxNights">Max Nights</Label>
                <Input
                  id="maxNights"
                  type="number"
                  min="1"
                  step="1"
                  value={modFormMaxNights}
                  onChange={(e) => setModFormMaxNights(e.target.value)}
                  placeholder="14 (leave empty for no limit)"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Adjustment Type *</Label>
                <Select 
                  value={modFormAdjustmentType} 
                  onValueChange={(v) => setModFormAdjustmentType(v as AdjustmentType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adjustmentValue">Adjustment Value *</Label>
                <div className="relative">
                  {modFormAdjustmentType === 'fixed_amount' && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  )}
                  <Input
                    id="adjustmentValue"
                    type="number"
                    step="0.01"
                    value={modFormAdjustmentValue}
                    onChange={(e) => setModFormAdjustmentValue(e.target.value)}
                    className={modFormAdjustmentType === 'fixed_amount' ? 'pl-7' : ''}
                    placeholder="-5"
                  />
                  {modFormAdjustmentType === 'percentage' && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Use negative values for discounts (e.g., -5 for 5% off)
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label htmlFor="modActive" className="text-sm font-medium">Active</Label>
                <p className="text-xs text-muted-foreground">
                  Inactive modifiers will not be applied
                </p>
              </div>
              <Switch
                id="modActive"
                checked={modFormIsActive}
                onCheckedChange={setModFormIsActive}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="modNotes">Notes</Label>
              <Textarea
                id="modNotes"
                value={modFormNotes}
                onChange={(e) => setModFormNotes(e.target.value)}
                placeholder="Optional notes about this modifier..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModifierDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveModifier}
              disabled={isPending || !modFormName.trim() || !modFormMinNights || !modFormAdjustmentValue}
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {editingModifier ? 'Save Changes' : 'Create Modifier'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
