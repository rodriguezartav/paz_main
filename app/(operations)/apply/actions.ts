'use server'

import { createOrUpdateDraftApplication, submitDraftApplication } from '@/lib/db/queries'
import { revalidatePath } from 'next/cache'

interface AnswerData {
  question_id: string
  answer_value: any
  question_text_snapshot: string
  section_title_snapshot: string
  question_type_snapshot: string
}

export async function saveDraftApplication(applicationId: string | null, answers: AnswerData[]) {
  const application = await createOrUpdateDraftApplication(applicationId, answers)
  return application
}

export async function submitApplication(applicationId: string) {
  const application = await submitDraftApplication(applicationId)
  revalidatePath('/applications')
  return application
}
