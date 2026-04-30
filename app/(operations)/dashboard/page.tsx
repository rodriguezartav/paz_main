import { getDashboardResidents, getPendingApplicationsCount, getRoomOccupancyForDateRange, getRecipes, getMealPlansForDateRange } from '@/lib/db/queries'
import { DashboardClient } from './dashboard-client'

export const metadata = {
  title: 'Dashboard - Paz Operations',
  description: 'Overview of Paz Corcovado operations',
}

// Costa Rica timezone (GMT-6)
const TIMEZONE = 'America/Costa_Rica'

function getTodayInTimezone(): Date {
  const dateStr = new Date().toLocaleDateString('en-CA', { timeZone: TIMEZONE })
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function formatDateYMD(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default async function DashboardPage() {
  // Get date range for next 7 days in Costa Rica timezone
  const today = getTodayInTimezone()
  const startDate = formatDateYMD(today)
  const endDateObj = new Date(today)
  endDateObj.setDate(today.getDate() + 7)
  const endDate = formatDateYMD(endDateObj)
  
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
