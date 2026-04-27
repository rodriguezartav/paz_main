import { notFound } from 'next/navigation'
import { getWeeklyMealPlanById, getRecipes } from '@/lib/db/queries'
import { WeekEditorClient } from './week-editor-client'

export const metadata = {
  title: 'Edit Weekly Plan | Paz Operations',
  description: 'Edit meals and headcounts for a specific week',
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function WeekEditorPage({ params }: PageProps) {
  const { id } = await params
  
  const [plan, recipes] = await Promise.all([
    getWeeklyMealPlanById(id),
    getRecipes(),
  ])

  if (!plan) {
    notFound()
  }

  return <WeekEditorClient plan={plan} recipes={recipes} />
}
