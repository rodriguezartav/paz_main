'use server'

import { updateApplication, deleteApplication, createResidentFromApplication } from '@/lib/db/queries'
import { revalidatePath } from 'next/cache'
import type { ApplicationStatus, Application, Diet, Gender, ResidentType } from '@/lib/types'

export async function updateApplicationStatus(id: string, status: ApplicationStatus) {
  const updates: { status: ApplicationStatus; reviewed_at?: string } = { status }
  
  if (status !== 'pending') {
    updates.reviewed_at = new Date().toISOString()
  }
  
  await updateApplication(id, updates)
  revalidatePath('/applications')
  revalidatePath(`/applications/${id}`)
}

export async function updateApplicationScore(id: string, score: number) {
  await updateApplication(id, { internal_score: score })
  revalidatePath('/applications')
  revalidatePath(`/applications/${id}`)
}

export async function updateApplicationNotes(id: string, notes: string) {
  await updateApplication(id, { reviewer_notes: notes })
  revalidatePath('/applications')
  revalidatePath(`/applications/${id}`)
}

export async function deleteApplicationAction(id: string) {
  await deleteApplication(id)
  revalidatePath('/applications')
}

export async function acceptApplicationAndCreateResident(
  application: Application,
  arrivalDate: string,
  departureDate: string,
  agreedRate: number,
  recommendedResidentType: ResidentType
): Promise<{ residentId: string }> {
  // Parse application answers to extract resident data
  const getAnswerValue = (questionPartial: string): string | null => {
    const answer = application.answers?.find(a => 
      a.question_text_snapshot.toLowerCase().includes(questionPartial.toLowerCase())
    )
    if (!answer) return null
    try {
      const parsed = JSON.parse(String(answer.answer_value))
      return Array.isArray(parsed) ? parsed.join(', ') : String(parsed)
    } catch {
      return String(answer.answer_value)
    }
  }

  // Map diet from application
  const dietAnswer = getAnswerValue('diet')?.toLowerCase() || ''
  let diet: Diet = 'eats_all'
  if (dietAnswer.includes('vegan')) diet = 'vegan'
  else if (dietAnswer.includes('vegetarian')) diet = 'vegetarian'

  // Map gender from application
  const genderAnswer = getAnswerValue('gender')?.toLowerCase() || ''
  let gender: Gender = 'female'
  if (genderAnswer.includes('male') && !genderAnswer.includes('female')) gender = 'male'

  // Parse age
  const ageAnswer = getAnswerValue('age')
  const age = ageAnswer ? parseInt(ageAnswer, 10) : null

  // Determine resident type:
  // - If applicant selected "volunteer" in the application -> use 'volunteer'
  // - Otherwise -> use the recommendedResidentType from rate calculation (which considers stay length)
  let residentType: ResidentType = recommendedResidentType
  for (const answer of application.answers || []) {
    // Check if this is the type question by looking at question text or nested question options
    const questionText = answer.question_text_snapshot.toLowerCase()
    const hasTypeKeywords = questionText.includes('type') || questionText.includes('applying as')
    const optionsStr = answer.question?.options ? JSON.stringify(answer.question.options).toLowerCase() : ''
    const hasVolunteerResidentOptions = optionsStr.includes('volunteer') && optionsStr.includes('resident')
    
    if (hasTypeKeywords || hasVolunteerResidentOptions) {
      try {
        const parsed = JSON.parse(String(answer.answer_value))
        const typeStr = (Array.isArray(parsed) ? parsed.join(', ') : String(parsed)).toLowerCase()
        if (typeStr.includes('volunteer')) {
          residentType = 'volunteer'
        }
        // For non-volunteers, we use the recommendedResidentType (resident or retreat based on stay length)
      } catch {
        const typeStr = String(answer.answer_value).toLowerCase()
        if (typeStr.includes('volunteer')) {
          residentType = 'volunteer'
        }
      }
      break
    }
  }

  const residentData = {
    name: application.applicant_name || 'Unknown',
    email: application.applicant_email || '',
    whatsapp: application.applicant_phone || null,
    nationality: getAnswerValue('nationality') || null,
    gender,
    age: isNaN(age || 0) ? null : age,
    diet,
    resident_type: residentType,
    arrival_date: arrivalDate,
    departure_date: departureDate,
    nightly_rate: agreedRate,
    application_id: application.id,
    notes: `Created from application. ${application.reviewer_notes || ''}`.trim(),
  }

  const resident = await createResidentFromApplication(residentData)

  // Update application status to accepted
  await updateApplication(application.id, { 
    status: 'accepted',
    reviewed_at: new Date().toISOString()
  })

  revalidatePath('/applications')
  revalidatePath(`/applications/${application.id}`)
  revalidatePath('/residents')

  return { residentId: resident.id }
}
