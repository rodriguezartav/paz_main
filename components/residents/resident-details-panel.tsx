'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DietBadge } from './diet-badge'
import { StatusBadge } from './status-badge'
import { PaymentStatusBadge } from './payment-status-badge'
import { BalanceDueBadge } from './balance-due-badge'
import type { Resident, Payment, Application, Room, ResidentBill, BillStatus } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { calculateNights } from '@/lib/utils/date'
import { 
  User, Mail, Phone, AlertTriangle, 
  Calendar, MapPin, FileText, 
  CheckCircle2, XCircle, CreditCard,
  DoorOpen, Edit, ExternalLink, AlertCircle, Loader2, DollarSign, Receipt, Plus
} from 'lucide-react'
import type { ApplicationAnswer } from '@/lib/types'
import { markResidentCheckedInAction, markResidentCheckedOutAction, updateResidentChecklistAction, assignBedToResidentAction, updateResidentStayAction, createStayBillAction } from '@/app/(operations)/residents/actions'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { ResidentType } from '@/lib/types'

interface ResidentDetailsPanelProps {
  resident: Resident
  payment?: Payment | null
  application?: Application | null
  rooms?: Room[]
  bills?: ResidentBill[]
}

function formatDate(dateString: string): string {
  if (!dateString) return '-'
  // Add time component to avoid timezone issues with date-only strings
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
}

function formatCurrency(amount: number, currency: string): string {
  if (currency === 'CRC') {
    return `₡${amount.toLocaleString()}`
  }
  return `$${amount.toLocaleString()}`
}

function parseAnswerValue(answer: ApplicationAnswer): string | string[] {
  try {
    const parsed = JSON.parse(String(answer.answer_value))
    return parsed
  } catch {
    return String(answer.answer_value)
  }
}

function analyzeFitSignals(answers: ApplicationAnswer[] = []) {
  const green: string[] = []
  const yellow: string[] = []
  const red: string[] = []
  
  for (const answer of answers) {
    const value = parseAnswerValue(answer)
    const valueStr = Array.isArray(value) ? value.join(' ') : String(value)
    const question = answer.question_text_snapshot.toLowerCase()
    
    // Green signals
    if (question.includes('shared living environment') && valueStr.includes('Yes')) {
      green.push('Understands shared living')
    }
    if (question.includes('substance-free') && valueStr === 'Yes') {
      green.push('Accepts substance-free environment')
    }
    if (question.includes('no-phone/no-electronics') && valueStr === 'Yes') {
      green.push('Comfortable with digital detox')
    }
    if (question.includes('health or travel insurance') && valueStr === 'Yes') {
      green.push('Has insurance')
    }
    if (question.includes('which statement feels most true') && valueStr.includes('simple shared-life')) {
      green.push('Wants shared life in nature')
    }
    if (question.includes('cleaning after yourself') && valueStr === 'Yes') {
      green.push('Comfortable with self-care')
    }
    
    // Yellow signals
    if (valueStr.includes('I need more information')) {
      yellow.push('Needs more information')
    }
    if (question.includes('work online') && (valueStr === 'Part-time' || valueStr === 'A little')) {
      yellow.push('Needs some online work time')
    }
    if (question.includes('emotional crisis') && valueStr === 'Yes, mildly') {
      yellow.push('Going through mild transition')
    }
    if (question.includes('which statement feels most true') && valueStr.includes('not sure yet')) {
      yellow.push('Unsure about expectations')
    }
    if (question.includes('which of the following have you experienced') && (!valueStr || valueStr.trim() === '' || valueStr === '[]')) {
      yellow.push('No prior relevant experiences selected')
    }
    
    // Red signals
    if (question.includes('which statement feels most true') && valueStr.includes('comfortable retreat')) {
      red.push('Expects hotel-style service')
    }
    if (question.includes('which statement feels most true') && valueStr.includes('surf trip with cheap')) {
      red.push('Expects cheap surf lodging')
    }
    if (question.includes('substance-free') && valueStr === 'No') {
      red.push('Does not accept substance-free rules')
    }
    if (question.includes('health or travel insurance') && valueStr === 'No') {
      red.push('No insurance and will not get it')
    }
    if (question.includes('emotional crisis') && valueStr === 'Yes, strongly') {
      red.push('In strong emotional crisis')
    }
    if (question.includes('work online') && valueStr === 'Full-time') {
      red.push('Needs full-time coworking')
    }
    if (question.includes('hours per day') && valueStr === '5+') {
      red.push('Expects 5+ hours online daily')
    }
    if (question.includes('food allergies') && valueStr && valueStr.trim() !== '' && valueStr.toLowerCase() !== 'no' && valueStr.toLowerCase() !== 'none') {
      red.push('Has food allergies/dietary restrictions')
    }
  }
  
  return { green: [...new Set(green)], yellow: [...new Set(yellow)], red: [...new Set(red)] }
}

export function ResidentDetailsPanel({ resident, payment, application, rooms = [], bills = [] }: ResidentDetailsPanelProps) {
  const nights = calculateNights(resident.arrival_date, resident.departure_date)
  const [isPending, startTransition] = useTransition()
  const [showBedDialog, setShowBedDialog] = useState(false)
  const [selectedBuildingId, setSelectedBuildingId] = useState('')
  const [selectedRoomId, setSelectedRoomId] = useState('')
  const [selectedBedId, setSelectedBedId] = useState('')
  
  // Edit Stay Dialog state
  const [showEditStayDialog, setShowEditStayDialog] = useState(false)
  const [editArrivalDate, setEditArrivalDate] = useState(resident.arrival_date)
  const [editDepartureDate, setEditDepartureDate] = useState(resident.departure_date)
  const [editResidentType, setEditResidentType] = useState<ResidentType>(resident.resident_type || 'resident')
  const [editResidentSince, setEditResidentSince] = useState(resident.resident_since || '')
  const [editNightlyRate, setEditNightlyRate] = useState<number | null>(resident.nightly_rate)
  const [editNotes, setEditNotes] = useState(resident.notes || '')
  
  // Get unique buildings from rooms
  const buildings = rooms.reduce((acc, room) => {
    if (room.building && !acc.find(b => b.id === room.building!.id)) {
      acc.push(room.building)
    }
    return acc
  }, [] as { id: string; name: string }[])
  
  // Get rooms in selected building
  const roomsInBuilding = selectedBuildingId 
    ? rooms.filter(r => r.building?.id === selectedBuildingId)
    : []
  
  // Get available beds in selected room (beds without active assignments)
  const bedsInRoom = selectedRoomId
    ? (rooms.find(r => r.id === selectedRoomId)?.beds || []).filter(bed => !bed.current_assignment)
    : []

  const handleCheckIn = () => {
    startTransition(async () => {
      await markResidentCheckedInAction(resident.id)
    })
  }

  const handleCheckOut = () => {
    startTransition(async () => {
      await markResidentCheckedOutAction(resident.id)
    })
  }

  const handleCreateStayBill = () => {
    if (!resident.nightly_rate) return
    startTransition(async () => {
      await createStayBillAction(
        resident.id,
        resident.arrival_date,
        resident.departure_date,
        resident.nightly_rate
      )
    })
  }

  const handleChecklistToggle = (field: 'release_accepted' | 'health_insurance_confirmed' | 'media_release_accepted' | 'orientation_completed', currentValue: boolean) => {
    startTransition(async () => {
      await updateResidentChecklistAction(resident.id, field, !currentValue)
    })
  }

  const handleAssignBed = () => {
    if (!selectedBedId) return
    startTransition(async () => {
      await assignBedToResidentAction(resident.id, selectedBedId)
      setShowBedDialog(false)
      setSelectedBuildingId('')
      setSelectedRoomId('')
      setSelectedBedId('')
    })
  }
  
  const handleBuildingChange = (buildingId: string) => {
    setSelectedBuildingId(buildingId)
    setSelectedRoomId('')
    setSelectedBedId('')
  }
  
  const handleRoomChange = (roomId: string) => {
    setSelectedRoomId(roomId)
    setSelectedBedId('')
  }

  const openEditStayDialog = () => {
    setEditArrivalDate(resident.arrival_date)
    setEditDepartureDate(resident.departure_date)
    setEditResidentType(resident.resident_type || 'resident')
    setEditResidentSince(resident.resident_since || '')
    setEditNightlyRate(resident.nightly_rate)
    setEditNotes(resident.notes || '')
    setShowEditStayDialog(true)
  }

  const handleSaveStay = () => {
    startTransition(async () => {
      await updateResidentStayAction(resident.id, {
        arrival_date: editArrivalDate,
        departure_date: editDepartureDate,
        resident_type: editResidentType,
        resident_since: editResidentSince || null,
        nightly_rate: editNightlyRate,
        notes: editNotes || null
      })
      setShowEditStayDialog(false)
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{resident.name}</h1>
          <p className="text-muted-foreground">{resident.nationality}</p>
        </div>
        <StatusBadge status={resident.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Card */}
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Profile</CardTitle>
            <Button variant="ghost" size="sm">
              <Edit className="mr-1 h-4 w-4" />
              Edit
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Gender / Age</p>
                  <p className="text-card-foreground">{resident.gender === 'female' ? 'Female' : 'Male'}, {resident.age}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-5 w-5" />
                <div>
                  <p className="text-sm text-muted-foreground">Diet</p>
                  <DietBadge diet={resident.diet} className="mt-1" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-card-foreground">{resident.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">WhatsApp</p>
                  <p className="text-card-foreground">{resident.whatsapp || '-'}</p>
                </div>
              </div>
              <div className="col-span-full flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Emergency Contact</p>
                  <p className="text-card-foreground">{resident.emergency_contact || '-'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stay Card */}
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Stay</CardTitle>
            <Button variant="ghost" size="sm" onClick={openEditStayDialog}>
              <Edit className="mr-1 h-4 w-4" />
              Edit
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Arrival</p>
                  <p className="text-card-foreground">{formatDate(resident.arrival_date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Departure</p>
                  <p className="text-card-foreground">{formatDate(resident.departure_date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-5 w-5" />
                <div>
                  <p className="text-sm text-muted-foreground">Nights</p>
                  <p className="text-card-foreground">{nights}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Room / Bed</p>
                  {resident.current_bed && resident.current_bed.length > 0 ? (
                    <p className="text-card-foreground">
                      {resident.current_bed[0].bed.room.building?.name && `${resident.current_bed[0].bed.room.building.name} - `}
                      {resident.current_bed[0].bed.room.name} - {resident.current_bed[0].bed.name}
                    </p>
                  ) : (
                    <p className="text-muted-foreground">Not assigned</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Resident Type</p>
                  <p className="text-card-foreground capitalize">{resident.resident_type || 'resident'}</p>
                </div>
              </div>
              {resident.resident_since && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Resident Since</p>
                    <p className="text-card-foreground">{formatDate(resident.resident_since)}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Nightly Rate</p>
                  <p className="text-card-foreground">
                    {resident.nightly_rate != null ? `$${resident.nightly_rate}` : 'Not set'}
                  </p>
                </div>
              </div>
            </div>
            {resident.notes && (
              <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                <FileText className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="text-card-foreground">{resident.notes}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Check-In Card */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Check-In</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <CheckItem label="Check-in completed" checked={resident.check_in_completed} disabled />
            <CheckItem 
              label="Release accepted" 
              checked={resident.release_accepted} 
              onClick={() => handleChecklistToggle('release_accepted', resident.release_accepted)}
              disabled={isPending}
            />
            <CheckItem 
              label="Health insurance confirmed" 
              checked={resident.health_insurance_confirmed} 
              onClick={() => handleChecklistToggle('health_insurance_confirmed', resident.health_insurance_confirmed)}
              disabled={isPending}
            />
            <CheckItem 
              label="Media release accepted" 
              checked={resident.media_release_accepted} 
              onClick={() => handleChecklistToggle('media_release_accepted', resident.media_release_accepted)}
              disabled={isPending}
            />
            <CheckItem 
              label="Orientation completed" 
              checked={resident.orientation_completed} 
              onClick={() => handleChecklistToggle('orientation_completed', resident.orientation_completed)}
              disabled={isPending}
            />
          </CardContent>
        </Card>

        {/* Bills Card */}
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Receipt className="h-5 w-5 text-muted-foreground" />
              Bills
            </CardTitle>
            <Link href={`/bills?resident=${resident.id}`}>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Bill
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {bills.length === 0 ? (
              <p className="text-sm text-muted-foreground">No bills for this resident.</p>
            ) : (
              <div className="space-y-3">
                {bills.map((bill) => {
                  const statusStyles: Record<BillStatus, string> = {
                    unpaid: 'bg-red-100 text-red-800 border-red-200',
                    partially_paid: 'bg-amber-100 text-amber-800 border-amber-200',
                    paid: 'bg-green-100 text-green-800 border-green-200',
                  }
                  const statusLabels: Record<BillStatus, string> = {
                    unpaid: 'Unpaid',
                    partially_paid: 'Partial',
                    paid: 'Paid',
                  }
                  return (
                    <div
                      key={bill.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3"
                    >
                      <div>
                        <p className="font-medium text-sm">{bill.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusStyles[bill.status]}`}>
                            {statusLabels[bill.status]}
                          </span>
                          {bill.due_date && (
                            <span className="text-xs text-muted-foreground">
                              Due {new Date(bill.due_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${bill.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                        {bill.amount_due > 0 && (
                          <p className="text-xs text-amber-600">Due: ${bill.amount_due.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
                <div className="pt-2 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Billed</span>
                    <span className="font-semibold">${bills.reduce((sum, b) => sum + b.total, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Due</span>
                    <span className="font-semibold text-amber-600">${bills.reduce((sum, b) => sum + b.amount_due, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Card */}
        {payment && (
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Payment</CardTitle>
              <PaymentStatusBadge status={payment.status} />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-lg font-semibold text-card-foreground">{formatCurrency(payment.total_amount, payment.currency)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Price per Night</p>
                  <p className="text-card-foreground">{formatCurrency(payment.price_per_night, payment.currency)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Deposit</p>
                  <p className="text-card-foreground">{formatCurrency(payment.deposit_amount, payment.currency)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount Paid</p>
                  <p className="text-card-foreground">{formatCurrency(payment.amount_paid, payment.currency)}</p>
                </div>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="mb-2 text-sm text-muted-foreground">Balance Due</p>
                <BalanceDueBadge balanceDue={payment.balance_due} currency={payment.currency} />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CreditCard className="h-4 w-4" />
                <span>Method: {formatPaymentMethod(payment.method)}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Application & Conclusions */}
        {application && (() => {
          const fitSignals = analyzeFitSignals(application.answers)
          return (
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Application & Conclusions</CardTitle>
              <Link href={`/applications/${application.id}`}>
                <Button variant="outline" size="sm">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Full Application
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <p>Submitted: {application.submitted_at ? formatDate(application.submitted_at) : '-'}</p>
                {application.internal_score && (
                  <p>Score: {application.internal_score}/5</p>
                )}
              </div>
              
              {application.reviewer_notes && (
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="mb-1 text-xs font-medium text-muted-foreground">Reviewer Notes</p>
                  <p className="text-sm">{application.reviewer_notes}</p>
                </div>
              )}

              {/* Fit Signals */}
              <div className="grid gap-3 sm:grid-cols-3">
                {fitSignals.green.length > 0 && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                    <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-green-700">
                      <CheckCircle2 className="h-4 w-4" />
                      Green Signals
                    </div>
                    <ul className="space-y-1 text-xs text-green-800">
                      {fitSignals.green.map((signal, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          {signal}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {fitSignals.yellow.length > 0 && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-amber-700">
                      <AlertCircle className="h-4 w-4" />
                      Yellow Signals
                    </div>
                    <ul className="space-y-1 text-xs text-amber-800">
                      {fitSignals.yellow.map((signal, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                          {signal}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {fitSignals.red.length > 0 && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                    <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-red-700">
                      <AlertTriangle className="h-4 w-4" />
                      Red Signals
                    </div>
                    <ul className="space-y-1 text-xs text-red-800">
                      {fitSignals.red.map((signal, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                          {signal}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {fitSignals.green.length === 0 && fitSignals.yellow.length === 0 && fitSignals.red.length === 0 && (
                <p className="text-sm text-muted-foreground">No fit signals detected from application</p>
              )}
            </CardContent>
          </Card>
          )
        })()}

      {/* Admin Actions */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Admin Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              onClick={handleCheckIn}
              disabled={isPending || resident.check_in_completed || resident.status === 'checked_out'}
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              {resident.check_in_completed ? 'Already Checked In' : 'Mark Checked In'}
            </Button>
            <Button variant="outline" onClick={() => setShowBedDialog(true)}>
              <MapPin className="mr-2 h-4 w-4" />
              Assign Room / Bed
            </Button>
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Add Note
            </Button>
            <Button variant="outline">
              <CreditCard className="mr-2 h-4 w-4" />
              Update Payment
            </Button>
            <Button 
              variant="outline" 
              onClick={handleCreateStayBill}
              disabled={isPending || !resident.nightly_rate}
              title={!resident.nightly_rate ? 'Set nightly rate first' : 'Create bill from stay dates and rate'}
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Receipt className="mr-2 h-4 w-4" />
              )}
              Create Stay Bill
            </Button>
            <Button 
              variant="outline" 
              onClick={handleCheckOut}
              disabled={isPending || resident.status === 'checked_out'}
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <DoorOpen className="mr-2 h-4 w-4" />
              )}
              {resident.status === 'checked_out' ? 'Already Checked Out' : 'Mark Checked Out'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Assign Bed Dialog */}
      <Dialog open={showBedDialog} onOpenChange={(open) => {
        setShowBedDialog(open)
        if (!open) {
          setSelectedBuildingId('')
          setSelectedRoomId('')
          setSelectedBedId('')
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Room / Bed</DialogTitle>
            <DialogDescription>
              Select a building, room, and bed to assign to {resident.name}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Building Select */}
            <div className="space-y-2">
              <Label>Building</Label>
              <Select value={selectedBuildingId} onValueChange={handleBuildingChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a building" />
                </SelectTrigger>
                <SelectContent>
                  {buildings.length === 0 ? (
                    <SelectItem value="none" disabled>No buildings available</SelectItem>
                  ) : (
                    buildings.map((building) => (
                      <SelectItem key={building.id} value={building.id}>
                        {building.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Room Select */}
            <div className="space-y-2">
              <Label>Room</Label>
              <Select 
                value={selectedRoomId} 
                onValueChange={handleRoomChange}
                disabled={!selectedBuildingId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedBuildingId ? "Select a room" : "Select a building first"} />
                </SelectTrigger>
                <SelectContent>
                  {roomsInBuilding.length === 0 ? (
                    <SelectItem value="none" disabled>No rooms in this building</SelectItem>
                  ) : (
                    roomsInBuilding.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.name} {room.is_private && '(Private)'}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Bed Select */}
            <div className="space-y-2">
              <Label>Bed</Label>
              <Select 
                value={selectedBedId} 
                onValueChange={setSelectedBedId}
                disabled={!selectedRoomId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedRoomId ? "Select a bed" : "Select a room first"} />
                </SelectTrigger>
                <SelectContent>
                  {bedsInRoom.length === 0 ? (
                    <SelectItem value="none" disabled>No available beds in this room</SelectItem>
                  ) : (
                    bedsInRoom.map((bed) => (
                      <SelectItem key={bed.id} value={bed.id}>
                        {bed.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBedDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssignBed}
              disabled={!selectedBedId || isPending}
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <MapPin className="mr-2 h-4 w-4" />
              )}
              Assign Bed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Stay Dialog */}
      <Dialog open={showEditStayDialog} onOpenChange={setShowEditStayDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Stay Details</DialogTitle>
            <DialogDescription>
              Update stay information for {resident.name}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="arrival_date">Arrival Date</Label>
                <Input
                  id="arrival_date"
                  type="date"
                  value={editArrivalDate}
                  onChange={(e) => setEditArrivalDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="departure_date">Departure Date</Label>
                <Input
                  id="departure_date"
                  type="date"
                  value={editDepartureDate}
                  onChange={(e) => setEditDepartureDate(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Resident Type</Label>
                <Select value={editResidentType} onValueChange={(value) => setEditResidentType(value as ResidentType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="resident">Resident</SelectItem>
                    <SelectItem value="volunteer">Volunteer</SelectItem>
                    <SelectItem value="retreat">Retreat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="resident_since">Resident Since</Label>
                <Input
                  id="resident_since"
                  type="date"
                  value={editResidentSince}
                  onChange={(e) => setEditResidentSince(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nightly_rate">Nightly Rate</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="nightly_rate"
                  type="number"
                  min="0"
                  step="1"
                  value={editNightlyRate ?? ''}
                  onChange={(e) => setEditNightlyRate(e.target.value ? parseFloat(e.target.value) : null)}
                  className="pl-7"
                  placeholder="Enter nightly rate"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Add notes about this stay..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditStayDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveStay}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Edit className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function CheckItem({ label, checked, onClick, disabled }: { label: string; checked: boolean; onClick?: () => void; disabled?: boolean }) {
  const isClickable = onClick && !disabled
  
  return (
    <button
      type="button"
      className={`flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors ${
        isClickable ? 'hover:bg-muted/50 cursor-pointer' : 'cursor-default'
      } ${disabled ? 'opacity-50' : ''}`}
      onClick={isClickable ? onClick : undefined}
      disabled={disabled || !onClick}
    >
      {checked ? (
        <CheckCircle2 className="h-5 w-5 text-paz-green" />
      ) : (
        <XCircle className="h-5 w-5 text-muted-foreground" />
      )}
      <span className={checked ? 'text-card-foreground' : 'text-muted-foreground'}>{label}</span>
    </button>
  )
}

function formatPaymentMethod(method: string | null): string {
  if (!method) return '-'
  const methods: Record<string, string> = {
    cash: 'Cash',
    sinpe: 'SINPE',
    bank_transfer: 'Bank Transfer',
    paypal: 'PayPal',
    stripe: 'Stripe',
    other: 'Other'
  }
  return methods[method] || method
}
