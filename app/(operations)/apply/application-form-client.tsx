'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ApplicationSection, ApplicationQuestion, RateRule, ResidentPriceModifier, ResidentType, RateRoomType } from '@/lib/types'
import { saveDraftApplication, submitApplication } from './actions'
import { ChevronLeft, ChevronRight, Send, CheckCircle2, Loader2, Save, DollarSign, Calendar, Home, Users } from 'lucide-react'
import { calculateRate, isRateCalculationError, formatCurrency } from '@/lib/utils/rate-calculator'

interface ApplicationFormClientProps {
  sections: ApplicationSection[]
  rates: RateRule[]
  modifiers: ResidentPriceModifier[]
}

export function ApplicationFormClient({ sections, rates, modifiers }: ApplicationFormClientProps) {
  const router = useRouter()
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [applicationId, setApplicationId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const currentSection = sections[currentSectionIndex]
  const progress = ((currentSectionIndex + 1) / sections.length) * 100
  const isLastSection = currentSectionIndex === sections.length - 1

  // Helper to find question by partial text match
  const findQuestionByText = useCallback((searchText: string) => {
    for (const section of sections) {
      for (const question of section.questions) {
        if (question.question_text.toLowerCase().includes(searchText.toLowerCase())) {
          return question
        }
      }
    }
    return null
  }, [sections])

  // Get answers for rate calculation
  const rateInputs = useMemo(() => {
    // Find relevant questions
    const applicationTypeQuestion = findQuestionByText('application type') || findQuestionByText('are you applying as')
    const roomPreferenceQuestion = findQuestionByText('room preference')
    const arrivalDateQuestion = findQuestionByText('preferred arrival date')
    const departureDateQuestion = findQuestionByText('preferred departure date')

    const applicationType = applicationTypeQuestion ? answers[applicationTypeQuestion.id] : null
    const roomPreference = roomPreferenceQuestion ? answers[roomPreferenceQuestion.id] : null
    const arrivalDate = arrivalDateQuestion ? answers[arrivalDateQuestion.id] : null
    const departureDate = departureDateQuestion ? answers[departureDateQuestion.id] : null

    return { applicationType, roomPreference, arrivalDate, departureDate }
  }, [answers, findQuestionByText])

  // Calculate nights and rate
  const rateCalculation = useMemo(() => {
    const { applicationType, roomPreference, arrivalDate, departureDate } = rateInputs

    if (!applicationType || !roomPreference || !arrivalDate || !departureDate) {
      return null
    }

    // Calculate nights
    const arrival = new Date(arrivalDate)
    const departure = new Date(departureDate)
    const nights = Math.ceil((departure.getTime() - arrival.getTime()) / (1000 * 60 * 60 * 24))

    if (nights <= 0) {
      return null
    }

    // Map application type answer to ResidentType
    let residentType: ResidentType = 'resident'
    const typeStr = applicationType.toLowerCase()
    if (typeStr.includes('volunteer')) {
      residentType = 'volunteer'
    } else if (typeStr.includes('retreat')) {
      residentType = 'retreat'
    }

    // Map room preference to RateRoomType
    let roomType: RateRoomType = 'double'
    const roomStr = roomPreference.toLowerCase()
    if (roomStr.includes('private')) {
      roomType = 'private'
    } else if (roomStr.includes('quad') || roomStr.includes('shared')) {
      roomType = 'quad'
    }

    const result = calculateRate(
      { nights, roomType, residentType },
      rates,
      modifiers
    )

    return { result, nights, arrivalDate, departureDate, residentType, roomType }
  }, [rateInputs, rates, modifiers])

  const updateAnswer = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
    // Clear error when user starts typing
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[questionId]
        return newErrors
      })
    }
  }

  const toggleMultipleChoice = (questionId: string, option: string) => {
    const current = answers[questionId] || []
    const newValue = current.includes(option)
      ? current.filter((o: string) => o !== option)
      : [...current, option]
    updateAnswer(questionId, newValue)
  }

  const validateCurrentSection = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    for (const question of currentSection.questions) {
      if (question.required) {
        const answer = answers[question.id]
        
        if (answer === undefined || answer === null || answer === '') {
          newErrors[question.id] = 'This field is required'
        } else if (Array.isArray(answer) && answer.length === 0) {
          newErrors[question.id] = 'Please select at least one option'
        } else if (question.question_type === 'email' && answer) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(answer)) {
            newErrors[question.id] = 'Please enter a valid email address'
          }
        }
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Build answers array for saving
  const buildAnswersArray = useCallback(() => {
    return sections.flatMap(section =>
      section.questions.map(question => ({
        question_id: question.id,
        answer_value: answers[question.id] ?? '',
        question_text_snapshot: question.question_text,
        section_title_snapshot: section.title,
        question_type_snapshot: question.question_type
      }))
    )
  }, [sections, answers])

  // Save current progress
  const saveProgress = async () => {
    setIsSaving(true)
    try {
      const answersToSave = buildAnswersArray()
      const application = await saveDraftApplication(applicationId, answersToSave)
      setApplicationId(application.id)
      setLastSaved(new Date())
    } catch (error) {
      console.error('Failed to save progress:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleNext = async () => {
    if (validateCurrentSection()) {
      // Save progress when moving to next section
      await saveProgress()
      
      if (currentSectionIndex < sections.length - 1) {
        setCurrentSectionIndex(prev => prev + 1)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }

  const handlePrevious = async () => {
    if (currentSectionIndex > 0) {
      // Save progress when going back
      await saveProgress()
      setCurrentSectionIndex(prev => prev - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSubmit = async () => {
    if (!validateCurrentSection()) return
    
    setIsSubmitting(true)
    
    try {
      // First save the final state
      const answersToSave = buildAnswersArray()
      const application = await saveDraftApplication(applicationId, answersToSave)
      
      // Then submit
      await submitApplication(application.id)
      setIsSubmitted(true)
    } catch (error) {
      console.error('Failed to submit application:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderQuestion = (question: ApplicationQuestion) => {
    const value = answers[question.id]
    const error = errors[question.id]
    
    return (
      <div key={question.id} className="space-y-3">
        <div>
          <Label className="text-base font-medium text-foreground">
            {question.question_text}
            {question.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          {question.question_description && (
            <p className="text-sm text-muted-foreground mt-1">{question.question_description}</p>
          )}
        </div>
        
        {/* Short Text */}
        {question.question_type === 'short_text' && (
          <Input
            value={value || ''}
            onChange={(e) => updateAnswer(question.id, e.target.value)}
            placeholder="Your answer..."
            className={cn(error && 'border-destructive')}
          />
        )}
        
        {/* Long Text */}
        {question.question_type === 'long_text' && (
          <Textarea
            value={value || ''}
            onChange={(e) => updateAnswer(question.id, e.target.value)}
            placeholder="Your answer..."
            rows={4}
            className={cn(error && 'border-destructive')}
          />
        )}
        
        {/* Email */}
        {question.question_type === 'email' && (
          <Input
            type="email"
            value={value || ''}
            onChange={(e) => updateAnswer(question.id, e.target.value)}
            placeholder="email@example.com"
            className={cn(error && 'border-destructive')}
          />
        )}
        
        {/* Phone */}
        {question.question_type === 'phone' && (
          <Input
            type="tel"
            value={value || ''}
            onChange={(e) => updateAnswer(question.id, e.target.value)}
            placeholder="+1 234 567 8900"
            className={cn(error && 'border-destructive')}
          />
        )}
        
        {/* Number */}
        {question.question_type === 'number' && (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => updateAnswer(question.id, e.target.value)}
            placeholder="0"
            className={cn('w-32', error && 'border-destructive')}
          />
        )}
        
        {/* Date */}
        {question.question_type === 'date' && (
          <Input
            type="date"
            value={value || ''}
            onChange={(e) => updateAnswer(question.id, e.target.value)}
            className={cn('w-48', error && 'border-destructive')}
          />
        )}
        
        {/* Single Choice - Use Select for many options, Radio for few */}
        {question.question_type === 'single_choice' && question.options.length > 10 && (
          <Select
            value={value || ''}
            onValueChange={(v) => updateAnswer(question.id, v)}
          >
            <SelectTrigger className={cn('w-full', error && 'border-destructive')}>
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {question.options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        
        {question.question_type === 'single_choice' && question.options.length <= 10 && (
          <RadioGroup
            value={value || ''}
            onValueChange={(v) => updateAnswer(question.id, v)}
            className="space-y-2"
          >
            {question.options.map((option) => (
              <div key={option} className="flex items-center space-x-3">
                <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                <Label 
                  htmlFor={`${question.id}-${option}`} 
                  className="font-normal cursor-pointer"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}
        
        {/* Multiple Choice */}
        {question.question_type === 'multiple_choice' && (
          <div className="space-y-2">
            {question.options.map((option) => (
              <div key={option} className="flex items-center space-x-3">
                <Checkbox
                  id={`${question.id}-${option}`}
                  checked={(value || []).includes(option)}
                  onCheckedChange={() => toggleMultipleChoice(question.id, option)}
                />
                <Label 
                  htmlFor={`${question.id}-${option}`} 
                  className="font-normal cursor-pointer"
                >
                  {option}
                </Label>
              </div>
            ))}
          </div>
        )}
        
        {/* Checkbox (single agreement) */}
        {(question.question_type === 'checkbox' || question.question_type === 'agreement') && (
          <div className="flex items-start space-x-3">
            <Checkbox
              id={question.id}
              checked={value || false}
              onCheckedChange={(checked) => updateAnswer(question.id, checked)}
            />
            <Label 
              htmlFor={question.id} 
              className="font-normal cursor-pointer leading-relaxed"
            >
              I agree
            </Label>
          </div>
        )}
        
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    )
  }

  // Submitted state
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="mx-auto max-w-2xl">
          <Card className="border-primary/20">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-6 rounded-full bg-primary/10 p-4">
                <CheckCircle2 className="h-12 w-12 text-primary" />
              </div>
              <h2 className="mb-3 text-2xl font-semibold text-foreground">
                Thank You for Applying
              </h2>
              <p className="mb-6 max-w-md text-muted-foreground leading-relaxed">
                Thank you for applying to Paz Corcovado. We will review your application 
                and contact you through WhatsApp or email.
              </p>
              <Button 
                variant="outline" 
                onClick={() => router.push('/residents')}
              >
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 border-b border-border bg-sidebar/95 backdrop-blur supports-[backdrop-filter]:bg-sidebar/80">
        <div className="px-4 py-4 md:px-8">
          <div className="mx-auto max-w-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-foreground md:text-2xl">Apply to Paz Corcovado</h1>
                <p className="mt-0.5 text-sm text-muted-foreground hidden sm:block">
                  Please answer thoughtfully. This helps us understand if Paz is right for you.
                </p>
              </div>
              {lastSaved && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Save className="h-3 w-3" />
                  <span className="hidden sm:inline">Saved {lastSaved.toLocaleTimeString()}</span>
                </div>
              )}
            </div>

            {/* Rate Preview Banner */}
            {rateCalculation && !isRateCalculationError(rateCalculation.result) && (
              <div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span className="capitalize">{rateCalculation.residentType}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Home className="h-4 w-4" />
                      <span className="capitalize">{rateCalculation.roomType}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{rateCalculation.nights} nights</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-semibold text-primary">
                        {formatCurrency(rateCalculation.result.totalCost)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({formatCurrency(rateCalculation.result.finalRate)}/night)
                      </span>
                    </div>
                    {rateCalculation.result.modifier && (
                      <Badge variant="secondary" className="text-xs">
                        {rateCalculation.result.modifier.adjustment_value}% discount
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="border-b border-border bg-background px-4 py-4 md:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Section {currentSectionIndex + 1} of {sections.length}
            </span>
            <span className="font-medium text-foreground">{currentSection.title}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Form Content */}
      <div className="px-4 py-8 md:px-8">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{currentSection.title}</CardTitle>
              {currentSection.intro && (
                <CardDescription className="text-base leading-relaxed whitespace-pre-line">
                  {currentSection.intro}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-8">
              {currentSection.questions.map(renderQuestion)}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentSectionIndex === 0 || isSaving}
              className="gap-2"
            >
              {isSaving && currentSectionIndex > 0 ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
              Previous
            </Button>

            {isLastSection ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || isSaving}
                className="gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Application
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={isSaving} className="gap-2">
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Section Navigation Pills */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {sections.map((section, index) => (
              <button
                key={section.key}
                onClick={async () => {
                  if (index < currentSectionIndex) {
                    await saveProgress()
                    setCurrentSectionIndex(index)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  } else if (index > currentSectionIndex && validateCurrentSection()) {
                    await saveProgress()
                    setCurrentSectionIndex(index)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }
                }}
                disabled={isSaving}
                className={cn(
                  'h-2.5 w-2.5 rounded-full transition-colors',
                  index === currentSectionIndex
                    ? 'bg-primary'
                    : index < currentSectionIndex
                    ? 'bg-primary/50'
                    : 'bg-muted-foreground/30'
                )}
                aria-label={`Go to section ${index + 1}: ${section.title}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
