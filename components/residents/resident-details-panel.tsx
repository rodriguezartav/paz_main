'use client'

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
  DoorOpen, Edit, ExternalLink
} from 'lucide-react'

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

export function ResidentDetailsPanel({ resident, payment, application }: ResidentDetailsPanelProps) {
  const nights = calculateNights(resident.arrival_date, resident.departure_date)

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
            <CheckItem label="Check-in completed" checked={resident.check_in_completed} />
            <CheckItem label="Release accepted" checked={resident.release_accepted} />
            <CheckItem label="Health insurance confirmed" checked={resident.health_insurance_confirmed} />
            <CheckItem label="Media release accepted" checked={resident.media_release_accepted} />
            <CheckItem label="Orientation completed" checked={resident.orientation_completed} />
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

      {/* Application Link */}
        {application && (
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Application</CardTitle>
              <Link href={`/applications/${application.id}`}>
                <Button variant="outline" size="sm">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Application
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <p>Submitted: {application.submitted_at ? formatDate(application.submitted_at) : '-'}</p>
                {application.internal_score && (
                  <p className="mt-1">Score: {application.internal_score}/5</p>
                )}
                {application.reviewer_notes && (
                  <p className="mt-2 rounded-lg bg-muted/50 p-2">{application.reviewer_notes}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Admin Actions */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Admin Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Mark Checked In
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
            <Button variant="outline">
              <DoorOpen className="mr-2 h-4 w-4" />
              Mark Checked Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function CheckItem({ label, checked }: { label: string; checked: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {checked ? (
        <CheckCircle2 className="h-5 w-5 text-paz-green" />
      ) : (
        <XCircle className="h-5 w-5 text-muted-foreground" />
      )}
      <span className={checked ? 'text-card-foreground' : 'text-muted-foreground'}>{label}</span>
    </div>
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
