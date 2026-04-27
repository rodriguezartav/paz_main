import { notFound } from 'next/navigation'
import { getWeeklyMenuTemplateById, getRecipes } from '@/lib/db/queries'
import { TemplateEditorClient } from './template-editor-client'

export const metadata = {
  title: 'Edit Template - Meal Planner',
  description: 'Edit weekly menu template'
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function TemplateEditorPage({ params }: PageProps) {
  const { id } = await params
  const [template, recipes] = await Promise.all([
    getWeeklyMenuTemplateById(id),
    getRecipes()
  ])
  
  if (!template) {
    notFound()
  }
  
  return <TemplateEditorClient template={template} recipes={recipes} />
}
