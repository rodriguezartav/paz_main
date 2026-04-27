'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PaymentStatusBadge } from './payment-status-badge'
import { BalanceDueBadge } from './balance-due-badge'
import type { Resident, Payment } from '@/lib/types'
import { calculateNights } from '@/lib/utils/date'
import { Calendar, CreditCard, Upload, CheckCircle, FileText } from 'lucide-react'

interface PaymentCardProps {
  resident: Resident
  payment: Payment
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatCurrency(amount: number, currency: string): string {
  if (currency === 'CRC') {
    return `₡${amount.toLocaleString()}`
  }
  return `$${amount.toLocaleString()}`
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

export function PaymentCard({ resident, payment }: PaymentCardProps) {
  const nights = calculateNights(resident.arrival_date, resident.departure_date)

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-lg text-card-foreground">{resident.name}</CardTitle>
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(resident.arrival_date)} - {formatDate(resident.departure_date)}</span>
              <span>({nights} nights)</span>
            </div>
          </div>
          <PaymentStatusBadge status={payment.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Payment Details */}
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="flex justify-between sm:flex-col">
            <span className="text-muted-foreground">Price per Night</span>
            <span className="font-medium text-card-foreground">{formatCurrency(payment.price_per_night, payment.currency)}</span>
          </div>
          <div className="flex justify-between sm:flex-col">
            <span className="text-muted-foreground">Total Amount</span>
            <span className="font-medium text-card-foreground">{formatCurrency(payment.total_amount, payment.currency)}</span>
          </div>
          <div className="flex justify-between sm:flex-col">
            <span className="text-muted-foreground">Deposit</span>
            <span className="text-card-foreground">{formatCurrency(payment.deposit_amount, payment.currency)}</span>
          </div>
          <div className="flex justify-between sm:flex-col">
            <span className="text-muted-foreground">Amount Paid</span>
            <span className="text-card-foreground">{formatCurrency(payment.amount_paid, payment.currency)}</span>
          </div>
        </div>

        {/* Balance Due - Prominent */}
        <div className="rounded-lg bg-muted/50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Balance Due</span>
            <span className="text-lg font-semibold text-card-foreground">
              {formatCurrency(payment.balance_due, payment.currency)}
            </span>
          </div>
          <BalanceDueBadge balanceDue={payment.balance_due} currency={payment.currency} />
        </div>

        {/* Payment Method */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CreditCard className="h-4 w-4" />
          <span>Method: {formatPaymentMethod(payment.method)}</span>
          <span className="text-border">|</span>
          <span>Currency: {payment.currency}</span>
        </div>

        {/* Notes */}
        {payment.notes && (
          <div className="flex items-start gap-2 text-sm">
            <FileText className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{payment.notes}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button variant="outline" size="sm">
            <Upload className="mr-1.5 h-4 w-4" />
            Upload Proof
          </Button>
          <Button variant="outline" size="sm">
            <CheckCircle className="mr-1.5 h-4 w-4" />
            Mark Deposit Paid
          </Button>
          <Button variant="outline" size="sm">
            <CheckCircle className="mr-1.5 h-4 w-4" />
            Mark Paid
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="mr-1.5 h-4 w-4" />
            Add Note
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
