'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CheckCircle2 } from 'lucide-react'

const agreements = [
  'I understand Paz is a shared living environment, not a hotel.',
  'I understand I make my own bed using the clean linens area.',
  'I understand phones are not used in public spaces.',
  'I understand Paz is substance-free in shared areas.',
  'I understand I am responsible for my own room and bathroom garbage.',
  'I understand I need health insurance.',
  'I understand surfing, hiking, sauna, ocean, rainforest, storms, branches, flooding, animals, insects, and remote travel carry risks.',
  'I understand Osa Mia S.A. does not cover medical expenses or transportation.',
  'I accept the responsibility release.',
  'I accept the required media release.'
]

const checkInSteps = [
  'Pick clean linens',
  'Pick clean towel',
  'Make your own bed',
  'Place dirty linens only in Dirty Linens area',
  'Learn kitchen, garbage, recycling, and compost rules'
]

export function CheckInForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    whatsapp: '',
    emergencyContact: '',
    arrivalDate: '',
    departureDate: '',
    nationality: '',
    gender: '',
    age: '',
    diet: ''
  })
  const [agreementsAccepted, setAgreementsAccepted] = useState<boolean[]>(new Array(agreements.length).fill(false))
  const [stepsCompleted, setStepsCompleted] = useState<boolean[]>(new Array(checkInSteps.length).fill(false))
  const [isSubmitted, setIsSubmitted] = useState(false)

  const allAgreementsAccepted = agreementsAccepted.every(Boolean)
  const allStepsCompleted = stepsCompleted.every(Boolean)
  const isFormValid = formData.fullName && formData.email && formData.gender && formData.diet && allAgreementsAccepted && allStepsCompleted

  const handleAgreementChange = (index: number, checked: boolean) => {
    const newAgreements = [...agreementsAccepted]
    newAgreements[index] = checked
    setAgreementsAccepted(newAgreements)
  }

  const handleStepChange = (index: number, checked: boolean) => {
    const newSteps = [...stepsCompleted]
    newSteps[index] = checked
    setStepsCompleted(newSteps)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isFormValid) {
      setIsSubmitted(true)
    }
  }

  if (isSubmitted) {
    return (
      <Card className="mx-auto max-w-2xl border-border bg-card">
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-paz-green/20">
            <CheckCircle2 className="h-8 w-8 text-paz-green" />
          </div>
          <h2 className="text-2xl font-semibold text-card-foreground">Welcome to Paz!</h2>
          <p className="text-muted-foreground">
            Your check-in is complete. Settle into the rhythm of the land.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="mx-auto max-w-2xl border-border bg-card">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-card-foreground">Welcome to Paz</CardTitle>
          <CardDescription className="text-base">
            Complete your check-in before settling into the rhythm of the land.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-card-foreground">Basic Information</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Your full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  placeholder="Name and phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="arrivalDate">Arrival Date</Label>
                <Input
                  id="arrivalDate"
                  type="date"
                  value={formData.arrivalDate}
                  onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="departureDate">Departure Date</Label>
                <Input
                  id="departureDate"
                  type="date"
                  value={formData.departureDate}
                  onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Personal Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-card-foreground">Personal Details</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality</Label>
                <Input
                  id="nationality"
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  placeholder="Your nationality"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="Your age"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="diet">Diet</Label>
                <Select value={formData.diet} onValueChange={(value) => setFormData({ ...formData, diet: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select diet" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eats_all">Eats All</SelectItem>
                    <SelectItem value="vegetarian">Vegetarian</SelectItem>
                    <SelectItem value="vegan">Vegan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Stay Agreement */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-card-foreground">Stay Agreement</h3>
            <div className="space-y-3 rounded-lg bg-muted/50 p-4">
              {agreements.map((agreement, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Checkbox
                    id={`agreement-${index}`}
                    checked={agreementsAccepted[index]}
                    onCheckedChange={(checked) => handleAgreementChange(index, checked as boolean)}
                  />
                  <Label 
                    htmlFor={`agreement-${index}`} 
                    className="text-sm font-normal leading-relaxed text-card-foreground"
                  >
                    {agreement}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Check-In Steps */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-card-foreground">Check-In Steps</h3>
            <div className="space-y-3 rounded-lg bg-muted/50 p-4">
              {checkInSteps.map((step, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Checkbox
                    id={`step-${index}`}
                    checked={stepsCompleted[index]}
                    onCheckedChange={(checked) => handleStepChange(index, checked as boolean)}
                  />
                  <Label 
                    htmlFor={`step-${index}`} 
                    className="text-sm font-normal text-card-foreground"
                  >
                    {step}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={!isFormValid}
          >
            Complete Check-In
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}
