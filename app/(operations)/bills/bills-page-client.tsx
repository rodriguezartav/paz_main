'use client'

import { useState, useTransition, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import type { ResidentBill, Resident, BillStatus } from '@/lib/types'
import { createBillAction, updateBillAction, deleteBillAction } from './actions'
import { Plus, Pencil, Trash2, DollarSign, User, Calendar, FileText, Search, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface BillsPageClientProps {
  initialBills: ResidentBill[]
  residents: Resident[]
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '-'
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
}

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function BillStatusBadge({ status }: { status: BillStatus }) {
  const variants: Record<BillStatus, { className: string; label: string }> = {
    unpaid: { className: 'bg-red-100 text-red-800 border-red-200', label: 'Unpaid' },
    partially_paid: { className: 'bg-amber-100 text-amber-800 border-amber-200', label: 'Partial' },
    paid: { className: 'bg-green-100 text-green-800 border-green-200', label: 'Paid' },
  }
  const { className, label } = variants[status]
  return <Badge variant="outline" className={className}>{label}</Badge>
}

export function BillsPageClient({ initialBills, residents }: BillsPageClientProps) {
  const [isPending, startTransition] = useTransition()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<BillStatus | 'all'>('all')
  
  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedBill, setSelectedBill] = useState<ResidentBill | null>(null)
  
  // Form states
  const [formResidentId, setFormResidentId] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formAmount, setFormAmount] = useState('')
  const [formTax, setFormTax] = useState('')
  const [formAmountPaid, setFormAmountPaid] = useState('')
  const [formPaymentDetails, setFormPaymentDetails] = useState('')
  const [formDueDate, setFormDueDate] = useState('')

  // Calculated values
  const calculatedTotal = useMemo(() => {
    const amount = parseFloat(formAmount) || 0
    const tax = parseFloat(formTax) || 0
    return amount + tax
  }, [formAmount, formTax])

  const calculatedAmountDue = useMemo(() => {
    const paid = parseFloat(formAmountPaid) || 0
    return Math.max(0, calculatedTotal - paid)
  }, [calculatedTotal, formAmountPaid])

  const calculatedStatus = useMemo((): BillStatus => {
    const paid = parseFloat(formAmountPaid) || 0
    if (paid >= calculatedTotal && calculatedTotal > 0) return 'paid'
    if (paid > 0) return 'partially_paid'
    return 'unpaid'
  }, [calculatedTotal, formAmountPaid])

  // Filter bills
  const filteredBills = useMemo(() => {
    return initialBills.filter(bill => {
      const matchesSearch = searchQuery === '' || 
        bill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (bill.resident as unknown as { name: string })?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || bill.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [initialBills, searchQuery, statusFilter])

  // Summary stats
  const stats = useMemo(() => {
    const total = initialBills.reduce((sum, b) => sum + b.total, 0)
    const paid = initialBills.reduce((sum, b) => sum + b.amount_paid, 0)
    const due = initialBills.reduce((sum, b) => sum + b.amount_due, 0)
    const unpaidCount = initialBills.filter(b => b.status === 'unpaid').length
    return { total, paid, due, unpaidCount }
  }, [initialBills])

  const resetForm = () => {
    setFormResidentId('')
    setFormDescription('')
    setFormAmount('')
    setFormTax('')
    setFormAmountPaid('')
    setFormPaymentDetails('')
    setFormDueDate('')
  }

  const openCreateDialog = () => {
    resetForm()
    setShowCreateDialog(true)
  }

  const openEditDialog = (bill: ResidentBill) => {
    setSelectedBill(bill)
    setFormResidentId(bill.resident_id)
    setFormDescription(bill.description)
    setFormAmount(bill.amount.toString())
    setFormTax(bill.tax.toString())
    setFormAmountPaid(bill.amount_paid.toString())
    setFormPaymentDetails(bill.payment_details || '')
    setFormDueDate(bill.due_date || '')
    setShowEditDialog(true)
  }

  const openDeleteDialog = (bill: ResidentBill) => {
    setSelectedBill(bill)
    setShowDeleteDialog(true)
  }

  const handleCreate = () => {
    if (!formResidentId || !formDescription) return
    startTransition(async () => {
      await createBillAction({
        resident_id: formResidentId,
        description: formDescription,
        amount: parseFloat(formAmount) || 0,
        tax: parseFloat(formTax) || 0,
        total: calculatedTotal,
        amount_paid: parseFloat(formAmountPaid) || 0,
        amount_due: calculatedAmountDue,
        status: calculatedStatus,
        payment_details: formPaymentDetails || null,
        due_date: formDueDate || null
      })
      setShowCreateDialog(false)
      resetForm()
    })
  }

  const handleUpdate = () => {
    if (!selectedBill) return
    startTransition(async () => {
      await updateBillAction(selectedBill.id, {
        description: formDescription,
        amount: parseFloat(formAmount) || 0,
        tax: parseFloat(formTax) || 0,
        total: calculatedTotal,
        amount_paid: parseFloat(formAmountPaid) || 0,
        amount_due: calculatedAmountDue,
        status: calculatedStatus,
        payment_details: formPaymentDetails || null,
        due_date: formDueDate || null
      })
      setShowEditDialog(false)
      setSelectedBill(null)
    })
  }

  const handleDelete = () => {
    if (!selectedBill) return
    startTransition(async () => {
      await deleteBillAction(selectedBill.id)
      setShowDeleteDialog(false)
      setSelectedBill(null)
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Bills</h1>
          <p className="mt-1 text-muted-foreground">Manage resident bills and payments</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          New Bill
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Billed</p>
                <p className="text-xl font-semibold">{formatCurrency(stats.total)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-xl font-semibold">{formatCurrency(stats.paid)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-100 p-2">
                <DollarSign className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Amount Due</p>
                <p className="text-xl font-semibold">{formatCurrency(stats.due)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-red-100 p-2">
                <FileText className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unpaid Bills</p>
                <p className="text-xl font-semibold">{stats.unpaidCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search bills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as BillStatus | 'all')}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
            <SelectItem value="partially_paid">Partially Paid</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bills List */}
      <Card>
        <CardHeader>
          <CardTitle>Bills ({filteredBills.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredBills.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              {initialBills.length === 0 ? 'No bills yet. Create your first bill to get started.' : 'No bills match your filters.'}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBills.map((bill) => {
                const resident = bill.resident as unknown as { id: string; name: string; email: string } | undefined
                return (
                  <div
                    key={bill.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="rounded-lg bg-muted p-2">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{bill.description}</p>
                          <BillStatusBadge status={bill.status} />
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          {resident && (
                            <Link href={`/residents/${resident.id}`} className="flex items-center gap-1 hover:text-foreground">
                              <User className="h-3 w-3" />
                              {resident.name}
                            </Link>
                          )}
                          {bill.due_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Due {formatDate(bill.due_date)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(bill.total)}</p>
                        {bill.amount_due > 0 && (
                          <p className="text-sm text-amber-600">Due: {formatCurrency(bill.amount_due)}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(bill)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(bill)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Bill Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Bill</DialogTitle>
            <DialogDescription>Add a new bill for a resident.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Resident</Label>
              <Select value={formResidentId} onValueChange={setFormResidentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select resident" />
                </SelectTrigger>
                <SelectContent>
                  {residents.map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="e.g., Accommodation - Week 1"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="pl-7"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax">Tax</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="tax"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formTax}
                    onChange={(e) => setFormTax(e.target.value)}
                    className="pl-7"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted p-3">
              <span className="text-sm font-medium">Total</span>
              <span className="text-lg font-semibold">{formatCurrency(calculatedTotal)}</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="amount_paid">Amount Paid</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="amount_paid"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formAmountPaid}
                    onChange={(e) => setFormAmountPaid(e.target.value)}
                    className="pl-7"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted p-3">
              <span className="text-sm font-medium">Amount Due</span>
              <div className="flex items-center gap-2">
                <BillStatusBadge status={calculatedStatus} />
                <span className="text-lg font-semibold">{formatCurrency(calculatedAmountDue)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_details">Payment Details</Label>
              <Textarea
                id="payment_details"
                value={formPaymentDetails}
                onChange={(e) => setFormPaymentDetails(e.target.value)}
                placeholder="e.g., Paid via bank transfer on..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!formResidentId || !formDescription || isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create Bill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Bill Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Bill</DialogTitle>
            <DialogDescription>Update bill details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-amount">Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="edit-amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="pl-7"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-tax">Tax</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="edit-tax"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formTax}
                    onChange={(e) => setFormTax(e.target.value)}
                    className="pl-7"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted p-3">
              <span className="text-sm font-medium">Total</span>
              <span className="text-lg font-semibold">{formatCurrency(calculatedTotal)}</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-amount_paid">Amount Paid</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="edit-amount_paid"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formAmountPaid}
                    onChange={(e) => setFormAmountPaid(e.target.value)}
                    className="pl-7"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-due_date">Due Date</Label>
                <Input
                  id="edit-due_date"
                  type="date"
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted p-3">
              <span className="text-sm font-medium">Amount Due</span>
              <div className="flex items-center gap-2">
                <BillStatusBadge status={calculatedStatus} />
                <span className="text-lg font-semibold">{formatCurrency(calculatedAmountDue)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-payment_details">Payment Details</Label>
              <Textarea
                id="edit-payment_details"
                value={formPaymentDetails}
                onChange={(e) => setFormPaymentDetails(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={!formDescription || isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bill</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this bill? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
