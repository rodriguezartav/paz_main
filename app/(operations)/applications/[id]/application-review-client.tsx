'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Application, ApplicationStatus, ApplicationAnswer } from '@/lib/types'
import { updateApplicationStatus, updateApplicationScore, updateApplicationNotes, acceptApplicationAndCreateResident } from '../actions'
import { ArrowLeft, Star, Mail, Phone, Calendar, Clock, AlertTriangle, CheckCircle, AlertCircle, Save, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ApplicationReviewClientProps {
  application: Application
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

// Patterns that indicate concerning answers
const redFlagPatterns = [
  { text: 'No', questions: ['health or travel insurance', 'swim confidently', 'understand that Paz is not a medical'] },
  { text: 'I need more information', questions: [] },
  { text: 'Yes, strongly', questions: ['emotional crisis'] },
  { text: 'Full-time', questions: ['work online'] },
  { text: '5+', questions: ['hours per day'] },
  { text: 'I want a comfortable retreat where things are organized for me.', questions: [] },
  { text: 'I want a surf trip with cheap food and lodging.', questions: [] },
]

function formatDate(dateString: string | null): string {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function parseAnswerValue(answer: ApplicationAnswer): string | string[] {
  try {
    const parsed = JSON.parse(String(answer.answer_value))
    return parsed
  } catch {
    return String(answer.answer_value)
  }
}

function isRedFlag(answer: ApplicationAnswer): boolean {
  const value = parseAnswerValue(answer)
  const valueStr = Array.isArray(value) ? value.join(' ') : String(value)
  const questionText = answer.question_text_snapshot.toLowerCase()
  
  for (const pattern of redFlagPatterns) {
    if (valueStr.includes(pattern.text)) {
      if (pattern.questions.length === 0) return true
      if (pattern.questions.some(q => questionText.includes(q.toLowerCase()))) return true
    }
  }
  
  return false
}

function groupAnswersBySection(answers: ApplicationAnswer[] = []): Map<string, ApplicationAnswer[]> {
  const sections = new Map<string, ApplicationAnswer[]>()
  
  for (const answer of answers) {
    const section = answer.section_title_snapshot
    if (!sections.has(section)) {
      sections.set(section, [])
    }
    sections.get(section)!.push(answer)
  }
  
  return sections
}

// Fit signals analysis
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

export function ApplicationReviewClient({ application }: ApplicationReviewClientProps) {
  const router = useRouter()
  const [status, setStatus] = useState(application.status)
  const [score, setScore] = useState(application.internal_score || 0)
  const [notes, setNotes] = useState(application.reviewer_notes || '')
  const [isSaving, setIsSaving] = useState(false)
  
  // Acceptance dialog state
  const [showAcceptDialog, setShowAcceptDialog] = useState(false)
  const [arrivalDate, setArrivalDate] = useState('')
  const [departureDate, setDepartureDate] = useState('')
  const [isAccepting, setIsAccepting] = useState(false)

  const sectionedAnswers = groupAnswersBySection(application.answers)
  const fitSignals = analyzeFitSignals(application.answers)
  
  // Get specific answer values for display
  const getAnswerValue = (questionPartial: string): string | null => {
    const answer = application.answers?.find(a => 
      a.question_text_snapshot.toLowerCase().includes(questionPartial.toLowerCase())
    )
    if (!answer) return null
    const value = parseAnswerValue(answer)
    return Array.isArray(value) ? value.join(', ') : String(value)
  }

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    // If changing to accepted, open the dialog to create resident
    if (newStatus === 'accepted') {
      openAcceptDialog()
      return
    }
    setStatus(newStatus)
    await updateApplicationStatus(application.id, newStatus)
  }

  const handleScoreChange = async (newScore: number) => {
    setScore(newScore)
    await updateApplicationScore(application.id, newScore)
  }

  const handleSaveNotes = async () => {
    setIsSaving(true)
    await updateApplicationNotes(application.id, notes)
    setIsSaving(false)
  }

  const handleAcceptApplication = async () => {
    if (!arrivalDate || !departureDate) return
    
    setIsAccepting(true)
    try {
      const { residentId } = await acceptApplicationAndCreateResident(
        application,
        arrivalDate,
        departureDate
      )
      setStatus('accepted')
      setShowAcceptDialog(false)
      router.push(`/residents/${residentId}`)
    } catch (error) {
      console.error('Failed to accept application:', error)
    } finally {
      setIsAccepting(false)
    }
  }

  const openAcceptDialog = () => {
    // Pre-fill dates from application answers if available
    const preferredArrival = getAnswerValue('preferred arrival date')
    if (preferredArrival) {
      setArrivalDate(preferredArrival)
    }
    // Default departure to 2 weeks after arrival
    if (preferredArrival) {
      const arrival = new Date(preferredArrival)
      arrival.setDate(arrival.getDate() + 14)
      setDepartureDate(arrival.toISOString().split('T')[0])
    }
    setShowAcceptDialog(true)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-sidebar/50 px-4 py-4 md:px-6">
        <div className="flex items-center gap-4">
          <Link href="/applications">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-foreground">
              {application.applicant_name || 'Unknown Applicant'}
            </h1>
            <p className="text-sm text-muted-foreground">
              Submitted {formatDate(application.submitted_at)}
            </p>
          </div>
          <Badge className={cn('border', statusColors[status])}>
            {statusLabels[status]}
          </Badge>
        </div>
      </div>

      <div className="flex flex-col gap-6 p-4 md:flex-row md:p-6">
        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Applicant Info */}
          <Card>
            <CardHeader>
              <CardTitle>Applicant Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{application.applicant_email || '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{application.applicant_phone || '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Arrival: {getAnswerValue('preferred arrival date') || '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Stay: {getAnswerValue('preferred length of stay') || '-'}</span>
                </div>
              </div>
              <div className="mt-4 grid gap-2 text-sm md:grid-cols-3">
                <div>
                  <span className="text-muted-foreground">Age:</span>{' '}
                  <span className="font-medium">{getAnswerValue('age') || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Gender:</span>{' '}
                  <span className="font-medium">{getAnswerValue('gender') || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Nationality:</span>{' '}
                  <span className="font-medium">{getAnswerValue('nationality') || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Diet:</span>{' '}
                  <span className="font-medium">{getAnswerValue('diet') || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Room:</span>{' '}
                  <span className="font-medium">{getAnswerValue('room preference') || '-'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Answers by Section */}
          {Array.from(sectionedAnswers.entries()).map(([sectionTitle, answers]) => (
            <Card key={sectionTitle}>
              <CardHeader>
                <CardTitle className="text-lg">{sectionTitle}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {answers.map(answer => {
                  const value = parseAnswerValue(answer)
                  const displayValue = Array.isArray(value) ? value.join(', ') : String(value)
                  const hasRedFlag = isRedFlag(answer)
                  
                  return (
                    <div 
                      key={answer.id} 
                      className={cn(
                        'rounded-lg border p-4',
                        hasRedFlag ? 'border-destructive/50 bg-destructive/5' : 'border-border'
                      )}
                    >
                      <div className="flex items-start gap-2">
                        {hasRedFlag && (
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {answer.question_text_snapshot}
                          </p>
                          <p className={cn(
                            'mt-2 text-sm',
                            hasRedFlag ? 'text-destructive font-medium' : 'text-muted-foreground'
                          )}>
                            {displayValue || <em className="text-muted-foreground/50">No answer</em>}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sidebar */}
        <div className="w-full space-y-6 md:w-80">
          {/* Status & Score */}
          <Card>
            <CardHeader>
              <CardTitle>Review Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Status</label>
                <Select value={status} onValueChange={(v) => handleStatusChange(v as ApplicationStatus)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(statusLabels) as ApplicationStatus[]).map(s => (
                      <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Internal Score</label>
                <div className="mt-1.5 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} onClick={() => handleScoreChange(s)} className="p-1">
                      <Star className={cn(
                        'h-6 w-6 transition-colors',
                        s <= score ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30 hover:text-amber-300'
                      )} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Internal Notes</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Private notes about this application..."
                  rows={4}
                  className="mt-1.5"
                />
                <Button 
                  size="sm" 
                  onClick={handleSaveNotes} 
                  disabled={isSaving}
                  className="mt-2 gap-1.5"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save Notes'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Fit Signals */}
          <Card>
            <CardHeader>
              <CardTitle>Fit Signals</CardTitle>
              <CardDescription>Automatic analysis of key answers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {fitSignals.green.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    Green Signals
                  </div>
                  <ul className="space-y-1 text-sm text-muted-foreground">
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
                <div>
                  <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-amber-700">
                    <AlertCircle className="h-4 w-4" />
                    Yellow Signals
                  </div>
                  <ul className="space-y-1 text-sm text-muted-foreground">
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
                <div>
                  <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-red-700">
                    <AlertTriangle className="h-4 w-4" />
                    Red Signals
                  </div>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {fitSignals.red.map((signal, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                        {signal}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {fitSignals.green.length === 0 && fitSignals.yellow.length === 0 && fitSignals.red.length === 0 && (
                <p className="text-sm text-muted-foreground">No signals detected</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Decision Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Decision</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                className="w-full bg-green-600 hover:bg-green-700" 
                onClick={openAcceptDialog}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Accept & Create Resident
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
                onClick={() => handleStatusChange('waitlist')}
              >
                Add to Waitlist
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
                onClick={() => handleStatusChange('needs_more_info')}
              >
                Request More Info
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-red-300 text-red-700 hover:bg-red-50"
                onClick={() => handleStatusChange('rejected')}
              >
                Reject Application
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Accept Application Dialog */}
      <Dialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept Application & Create Resident</DialogTitle>
            <DialogDescription>
              This will accept the application and create a new resident record for {application.applicant_name}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="arrival-date">Arrival Date</Label>
              <Input
                id="arrival-date"
                type="date"
                value={arrivalDate}
                onChange={(e) => setArrivalDate(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="departure-date">Departure Date</Label>
              <Input
                id="departure-date"
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAcceptDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAcceptApplication}
              disabled={!arrivalDate || !departureDate || isAccepting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isAccepting ? 'Creating...' : 'Accept & Create Resident'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
