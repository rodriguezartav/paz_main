import { getWeeklyMealPlans, getWeeklyMenuTemplates, getRecipes } from '@/lib/db/queries'
import { WeeklyCalendarClient } from './weekly-calendar-client'

export const metadata = {
  title: 'Weekly Calendar | Paz Operations',
  description: 'Manage weekly meal plans and headcounts',
}

export default async function WeeklyCalendarPage() {
  const [plans, templates, recipes] = await Promise.all([
    getWeeklyMealPlans(),
    getWeeklyMenuTemplates(),
    getRecipes(),
  ])

  return (
    <WeeklyCalendarClient 
      initialPlans={plans} 
      templates={templates}
      recipes={recipes}
    />
  )
}
