'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
import type { Application, ApplicationStatus } from '@/lib/types'
import { updateApplicationStatus, updateApplicationScore, deleteApplicationAction } from './actions'
import { Search, Eye, Star, Trash2, Calendar, Phone, Mail, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ApplicationsListClientProps {
  applications: Application[]
}

const statusColors: Record<ApplicationStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  reviewing: 'bg-blue-100 text-blue-800 border-blue-200',
  accepted: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  waitlist: 'bg-purple-100 text-purple-800 border-purple-200',
  needs_more_info: 'bg-orange-100 text-orange-800 border-orange-200',
}

const statusLabels: Record<ApplicationStatus, string> = {
  pending: 'Pending',
  reviewing: 'Reviewing',
  accepted: 'Accepted',
  rejected: 'Rejected',
  waitlist: 'Waitlist',
  needs_more_info: 'Needs Info',
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '-'
  const date = new Date(dateString.includes('T') ? dateString : dateString + 'T00:00:00')
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
}

function getPreferredArrivalDate(application: Application): string | null {
  const answer = application.answers?.find(a => 
    a.question_text_snapshot.toLowerCase().includes('preferred arrival date')
  )
  if (!answer) return null
  const value = typeof answer.answer_value === 'string' ? answer.answer_value : JSON.parse(String(answer.answer_value))
  return typeof value === 'string' ? value : null
}

function getPreferredStayLength(application: Application): string | null {
  const answer = application.answers?.find(a => 
    a.question_text_snapshot.toLowerCase().includes('preferred length of stay')
  )
  if (!answer) return null
  const value = typeof answer.answer_value === 'string' ? answer.answer_value : JSON.parse(String(answer.answer_value))
  return typeof value === 'string' ? value : null
}

export function ApplicationsListClient({ applications: initialApplications }: ApplicationsListClientProps) {
  const router = useRouter()
  const [applications, setApplications] = useState(initialApplications)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [applicationToDelete, setApplicationToDelete] = useState<string | null>(null)

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      (app.applicant_name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (app.applicant_email?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (app.applicant_phone?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleStatusChange = async (applicationId: string, newStatus: ApplicationStatus) => {
    await updateApplicationStatus(applicationId, newStatus)
    setApplications(prev => 
      prev.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      )
    )
  }

  const handleScoreChange = async (applicationId: string, score: number) => {
    await updateApplicationScore(applicationId, score)
    setApplications(prev => 
      prev.map(app => 
        app.id === applicationId ? { ...app, internal_score: score } : app
      )
    )
  }

  const handleDelete = async () => {
    if (!applicationToDelete) return
    await deleteApplicationAction(applicationToDelete)
    setApplications(prev => prev.filter(app => app.id !== applicationToDelete))
    setApplicationToDelete(null)
    setDeleteDialogOpen(false)
  }

  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Resident Applications</h1>
          <p className="text-muted-foreground">
            {applications.length} total applications
          </p>
        </div>
      </div>

      {/* Status Summary */}
      <div className="flex flex-wrap gap-2">
        <Badge 
          variant="outline" 
          className={cn(
            'cursor-pointer px-3 py-1',
            statusFilter === 'all' && 'bg-primary text-primary-foreground'
          )}
          onClick={() => setStatusFilter('all')}
        >
          All ({applications.length})
        </Badge>
        {(Object.keys(statusLabels) as ApplicationStatus[]).map(status => (
          <Badge 
            key={status}
            variant="outline"
            className={cn(
              'cursor-pointer px-3 py-1',
              statusFilter === status && statusColors[status]
            )}
            onClick={() => setStatusFilter(status)}
          >
            {statusLabels[status]} ({statusCounts[status] || 0})
          </Badge>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No applications found</p>
            </CardContent>
          </Card>
        ) : (
          filteredApplications.map(application => {
            const arrivalDate = getPreferredArrivalDate(application)
            const stayLength = getPreferredStayLength(application)
            
            return (
              <Card key={application.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Main Info */}
                    <div className="flex-1 p-4 md:p-6">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-foreground">
                              {application.applicant_name || 'Unknown Applicant'}
                            </h3>
                            <Badge className={cn('border', statusColors[application.status])}>
                              {statusLabels[application.status]}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            {application.applicant_email && (
                              <span className="flex items-center gap-1">
                                <Mail className="h-3.5 w-3.5" />
                                {application.applicant_email}
                              </span>
                            )}
                            {application.applicant_phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3.5 w-3.5" />
                                {application.applicant_phone}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            {arrivalDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                Arrival: {formatDate(arrivalDate)}
                              </span>
                            )}
                            {stayLength && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {stayLength}
                              </span>
                            )}
                          </div>
                          
                          <p className="text-xs text-muted-foreground">
                            Submitted: {formatDate(application.submitted_at)}
                          </p>
                        </div>

                        {/* Score */}
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map(score => (
                            <button
                              key={score}
                              onClick={() => handleScoreChange(application.id, score)}
                              className="p-0.5"
                            >
                              <Star 
                                className={cn(
                                  'h-5 w-5 transition-colors',
                                  score <= (application.internal_score || 0)
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-muted-foreground/30 hover:text-amber-300'
                                )} 
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 border-t border-border bg-muted/30 p-4 md:flex-col md:border-l md:border-t-0 md:p-4">
                      <Select
                        value={application.status}
                        onValueChange={(value) => handleStatusChange(application.id, value as ApplicationStatus)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(statusLabels) as ApplicationStatus[]).map(status => (
                            <SelectItem key={status} value={status}>
                              {statusLabels[status]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Link href={`/applications/${application.id}`}>
                        <Button variant="outline" size="sm" className="gap-1.5">
                          <Eye className="h-4 w-4" />
                          Review
                        </Button>
                      </Link>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          setApplicationToDelete(application.id)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this application? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
