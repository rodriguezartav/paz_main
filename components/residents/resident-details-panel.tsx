'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DietBadge } from './diet-badge'
import { StatusBadge } from './status-badge'
import { PaymentStatusBadge } from './payment-status-badge'
import { BalanceDueBadge } from './balance-due-badge'
import type { Resident, Payment, Application } from '@/lib/types'
import Link from 'next/link'
import { calculateNights } from '@/lib/utils/date'
import { 
  User, Mail, Phone, AlertTriangle, 
  Calendar, MapPin, FileText, 
  CheckCircle2, XCircle, CreditCard,
  DoorOpen, Edit, ExternalLink, AlertCircle, Loader2
} from 'lucide-react'
import type { ApplicationAnswer } from '@/lib/types'
import { markResidentCheckedInAction, markResidentCheckedOutAction, updateResidentChecklistAction } from '@/app/(operations)/residents/actions'

interface ResidentDetailsPanelProps {
  resident: Resident
  payment?: Payment | null
  application?: Application | null
}

function formatDate(dateString: string): string {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
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
  }
  
  return { green: [...new Set(green)], yellow: [...new Set(yellow)], red: [...new Set(red)] }
}

export function ResidentDetailsPanel({ resident, payment, application }: ResidentDetailsPanelProps) {
  const nights = calculateNights(resident.arrival_date, resident.departure_date)
  const [isPending, startTransition] = useTransition()

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

  const handleChecklistToggle = (field: 'release_accepted' | 'health_insurance_confirmed' | 'media_release_accepted' | 'orientation_completed', currentValue: boolean) => {
    startTransition(async () => {
      await updateResidentChecklistAction(resident.id, field, !currentValue)
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
            <Button variant="ghost" size="sm">
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
                  <p className="text-card-foreground">{resident.room || '-'} / {resident.bed || '-'}</p>
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
            <Button variant="outline">
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
