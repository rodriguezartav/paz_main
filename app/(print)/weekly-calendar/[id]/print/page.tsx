import { notFound } from 'next/navigation'
import { getWeeklyMealPlanById } from '@/lib/db/queries'
import { PrintMenuClient } from './print-menu-client'

export const metadata = {
  title: 'Print Weekly Menu | Paz Kitchen',
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PrintMenuPage({ params }: PageProps) {
  const { id } = await params
  
  const plan = await getWeeklyMealPlanById(id)

  if (!plan) {
    notFound()
  }

  return <PrintMenuClient plan={plan} />
}
