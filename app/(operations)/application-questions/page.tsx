import { getApplicationSections } from '@/lib/db/queries'
import { QuestionsManagementClient } from './questions-management-client'

export const metadata = {
  title: 'Application Questions - Paz Operations',
  description: 'Manage application questions and sections',
}

export default async function ApplicationQuestionsPage() {
  const sections = await getApplicationSections(false) // Include inactive questions
  
  return <QuestionsManagementClient sections={sections} />
}
