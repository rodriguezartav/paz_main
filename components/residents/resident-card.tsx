'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { DietBadge } from './diet-badge'
import { StatusBadge } from './status-badge'
import { PaymentStatusBadge } from './payment-status-badge'
import { BalanceDueBadge } from './balance-due-badge'
import type { Resident, Payment } from '@/lib/types'
import { calculateNights } from '@/lib/utils/date'
import { Calendar, MapPin, User, CheckCircle2, XCircle, Trash2 } from 'lucide-react'
import { deleteResidentAction } from '@/app/(operations)/residents/actions'

interface ResidentCardProps {
  resident: Resident
  payment?: Payment | null
}

function formatDate(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
}

export function ResidentCard({ resident, payment }: ResidentCardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const nights = calculateNights(resident.arrival_date, resident.departure_date)
  
  const handleDelete = () => {
    startTransition(async () => {
      await deleteResidentAction(resident.id)
      setShowDeleteDialog(false)
      router.refresh()
    })
  }
  
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

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link href={`/residents/${resident.id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              View Details
            </Button>
          </Link>
          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon" className="text-destructive hover:bg-destructive hover:text-destructive-foreground">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Resident</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete {resident.name}? This will also delete their payment records and bed assignments. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isPending}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isPending ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
