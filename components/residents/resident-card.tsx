'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DietBadge } from './diet-badge'
import { StatusBadge } from './status-badge'
import { PaymentStatusBadge } from './payment-status-badge'
import { BalanceDueBadge } from './balance-due-badge'
import type { Resident, Payment } from '@/lib/types'
import { calculateNights } from '@/lib/utils/date'
import { Calendar, MapPin, User, CheckCircle2, XCircle } from 'lucide-react'

interface ResidentCardProps {
  resident: Resident
  payment?: Payment | null
}

function formatDate(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
}

export function ResidentCard({ resident, payment }: ResidentCardProps) {
  const nights = calculateNights(resident.arrival_date, resident.departure_date)
  
  return (
    <Card className="border-border bg-card transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-lg text-card-foreground">{resident.name}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{resident.nationality}</p>
          </div>
          <StatusBadge status={resident.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Personal Info */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{resident.gender === 'female' ? 'F' : 'M'}, {resident.age}</span>
          </div>
          <DietBadge diet={resident.diet} />
        </div>

        {/* Stay Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-card-foreground">
              {formatDate(resident.arrival_date)} - {formatDate(resident.departure_date)}
            </span>
            <span className="text-muted-foreground">({nights} nights)</span>
          </div>
          {(resident.room || resident.bed) && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-card-foreground">
                {resident.room}{resident.bed ? ` / Bed ${resident.bed}` : ''}
              </span>
            </div>
          )}
        </div>

        {/* Payment Info */}
        {payment && (
          <div className="space-y-2 rounded-lg bg-muted/50 p-3">
            <div className="flex items-center justify-between">
              <PaymentStatusBadge status={payment.status} />
              <span className="text-sm font-medium text-card-foreground">
                {payment.currency === 'CRC' ? '₡' : '$'}{payment.amount_paid.toLocaleString()} / {payment.currency === 'CRC' ? '₡' : '$'}{payment.total_amount.toLocaleString()}
              </span>
            </div>
            <BalanceDueBadge balanceDue={payment.balance_due} currency={payment.currency} />
          </div>
        )}

        {/* Check-in Status */}
        <div className="flex items-center gap-2 text-sm">
          {resident.check_in_completed ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-paz-green" />
              <span className="text-paz-green">Check-in completed</span>
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Check-in pending</span>
            </>
          )}
        </div>

        {/* View Details Button */}
        <Link href={`/residents/${resident.id}`}>
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
