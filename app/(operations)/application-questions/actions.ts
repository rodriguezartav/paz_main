'use server'

import { 
  createApplicationQuestion, 
  updateApplicationQuestion, 
  deleteApplicationQuestion 
} from '@/lib/db/queries'
import { revalidatePath } from 'next/cache'
import type { QuestionType } from '@/lib/types'

interface QuestionData {
  section_key: string
  section_title: string
  section_intro: string | null
  question_text: string
  question_description: string | null
  question_type: QuestionType
  options: string[]
  required: boolean
  order_index: number
  active: boolean
}

export async function createQuestionAction(data: QuestionData) {
  await createApplicationQuestion(data)
  revalidatePath('/application-questions')
  revalidatePath('/apply')
}

export async function updateQuestionAction(id: string, data: Partial<QuestionData>) {
  await updateApplicationQuestion(id, data)
  revalidatePath('/application-questions')
  revalidatePath('/apply')
}

export async function deleteQuestionAction(id: string) {
  await deleteApplicationQuestion(id)
  revalidatePath('/application-questions')
  revalidatePath('/apply')
}

export async function toggleQuestionActiveAction(id: string, active: boolean) {
  await updateApplicationQuestion(id, { active })
  revalidatePath('/application-questions')
  revalidatePath('/apply')
}
