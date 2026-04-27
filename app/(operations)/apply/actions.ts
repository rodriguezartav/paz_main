'use server'

import { createApplication } from '@/lib/db/queries'
import { revalidatePath } from 'next/cache'

interface AnswerData {
  question_id: string
  answer_value: any
  question_text_snapshot: string
  section_title_snapshot: string
  question_type_snapshot: string
}

export async function submitApplication(answers: AnswerData[]) {
  const application = await createApplication(answers)
  revalidatePath('/applications')
  return application
}
