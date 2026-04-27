import { getDashboardResidents, getPendingApplicationsCount, getRoomOccupancyForDateRange, getRecipes, getMealPlansForDateRange } from '@/lib/db/queries'
import { DashboardClient } from './dashboard-client'

export const metadata = {
  title: 'Dashboard - Paz Operations',
  description: 'Overview of Paz Corcovado operations',
}

export default async function DashboardPage() {
  // Get date range for next 7 days
  const today = new Date()
  const startDate = today.toISOString().split('T')[0]
  const endDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  
  const [residents, pendingApplications, roomData, recipes, mealPlans] = await Promise.all([
    getDashboardResidents(startDate, endDate),
    getPendingApplicationsCount(),
    getRoomOccupancyForDateRange(startDate, endDate),
    getRecipes(),
    getMealPlansForDateRange(startDate, endDate),
  ])
  
  return (
    <DashboardClient
      residents={residents}
      pendingApplications={pendingApplications}
      rooms={roomData.rooms}
      recipes={recipes}
      mealPlans={mealPlans}
      startDate={startDate}
      endDate={endDate}
    />
  )
}
