import { getWeeklyMenuTemplates } from '@/lib/db/queries'
import { MealPlannerClient } from './meal-planner-client'

export const metadata = {
  title: 'Meal Planner - Paz Operations',
  description: 'Weekly menu templates for meal planning'
}

export default async function MealPlannerPage() {
  const templates = await getWeeklyMenuTemplates()
  
  return <MealPlannerClient initialTemplates={templates} />
}
