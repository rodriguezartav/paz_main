'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Resident, Room, Recipe } from '@/lib/types'
import { 
  UtensilsCrossed, 
  Users, 
  BedDouble, 
  ClipboardList, 
  ChevronRight,
  Calendar,
  UserPlus,
  UserMinus,
  UserCheck
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardClientProps {
  residents: Resident[]
  pendingApplications: number
  rooms: Room[]
  recipes: Recipe[]
  startDate: string
  endDate: string
}

export function DashboardClient({
  residents,
  pendingApplications,
  rooms,
  recipes,
  startDate,
  endDate,
}: DashboardClientProps) {
  // Generate array of next 7 days
  const days: { date: Date; dateString: string; label: string }[] = []
  const today = new Date(startDate)
  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    days.push({
      date,
      dateString: date.toISOString().split('T')[0],
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    })
  }

  // Calculate residents per day
  const getResidentsForDay = (dateString: string) => {
    return residents.filter(r => {
      const arrival = r.arrival_date
      const departure = r.departure_date
      return arrival <= dateString && departure >= dateString
    })
  }

  // Calculate arrivals and departures per day
  const getArrivalsForDay = (dateString: string) => residents.filter(r => r.arrival_date === dateString)
  const getDeparturesForDay = (dateString: string) => residents.filter(r => r.departure_date === dateString)

  // Calculate total beds and occupied beds
  const totalBeds = rooms.reduce((sum, room) => sum + (room.beds?.length || 0), 0)
  const occupiedBeds = rooms.reduce((sum, room) => {
    return sum + (room.beds?.filter(bed => bed.current_assignment)?.length || 0)
  }, 0)

  // Diet counts for meal planning
  const getDietCounts = (dateString: string) => {
    const dayResidents = getResidentsForDay(dateString)
    return {
      total: dayResidents.length,
      eatsAll: dayResidents.filter(r => r.diet === 'eats_all').length,
      vegetarian: dayResidents.filter(r => r.diet === 'vegetarian').length,
      vegan: dayResidents.filter(r => r.diet === 'vegan').length,
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Overview for the next 7 days</p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today&apos;s Residents</p>
                <p className="text-2xl font-bold">{getResidentsForDay(startDate).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-500/10 p-2">
                <BedDouble className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bed Occupancy</p>
                <p className="text-2xl font-bold">{occupiedBeds}/{totalBeds}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-orange-500/10 p-2">
                <ClipboardList className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Applications</p>
                <p className="text-2xl font-bold">{pendingApplications}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-500/10 p-2">
                <UtensilsCrossed className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Recipes</p>
                <p className="text-2xl font-bold">{recipes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Meals for Next 7 Days */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <UtensilsCrossed className="h-5 w-5" />
                  Meals Planning
                </CardTitle>
                <CardDescription>Diet breakdown for next 7 days</CardDescription>
              </div>
              <Link href="/recipes">
                <Button variant="ghost" size="sm">
                  View Recipes <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {days.map((day) => {
                const diets = getDietCounts(day.dateString)
                return (
                  <div 
                    key={day.dateString} 
                    className={cn(
                      "flex items-center justify-between rounded-lg border p-3",
                      day.label === 'Today' && "bg-primary/5 border-primary/20"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className={cn(
                        "text-sm font-medium",
                        day.label === 'Today' && "text-primary"
                      )}>
                        {day.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {diets.total} people
                      </Badge>
                      {diets.eatsAll > 0 && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                          {diets.eatsAll} all
                        </Badge>
                      )}
                      {diets.vegetarian > 0 && (
                        <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                          {diets.vegetarian} veg
                        </Badge>
                      )}
                      {diets.vegan > 0 && (
                        <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                          {diets.vegan} vegan
                        </Badge>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Residents Status */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Residents Status
                </CardTitle>
                <CardDescription>Arrivals & departures for next 7 days</CardDescription>
              </div>
              <Link href="/residents">
                <Button variant="ghost" size="sm">
                  View All <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {days.map((day) => {
                const staying = getResidentsForDay(day.dateString)
                const arrivals = getArrivalsForDay(day.dateString)
                const departures = getDeparturesForDay(day.dateString)
                
                return (
                  <div 
                    key={day.dateString} 
                    className={cn(
                      "flex items-center justify-between rounded-lg border p-3",
                      day.label === 'Today' && "bg-primary/5 border-primary/20"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className={cn(
                        "text-sm font-medium",
                        day.label === 'Today' && "text-primary"
                      )}>
                        {day.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs flex items-center gap-1">
                        <UserCheck className="h-3 w-3" />
                        {staying.length}
                      </Badge>
                      {arrivals.length > 0 && (
                        <Badge className="text-xs bg-green-100 text-green-700 hover:bg-green-100 flex items-center gap-1">
                          <UserPlus className="h-3 w-3" />
                          +{arrivals.length}
                        </Badge>
                      )}
                      {departures.length > 0 && (
                        <Badge className="text-xs bg-orange-100 text-orange-700 hover:bg-orange-100 flex items-center gap-1">
                          <UserMinus className="h-3 w-3" />
                          -{departures.length}
                        </Badge>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Applications Status */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Applications
                </CardTitle>
                <CardDescription>Pending applications need review</CardDescription>
              </div>
              <Link href="/applications">
                <Button variant="ghost" size="sm">
                  View All <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-6 text-center">
              {pendingApplications > 0 ? (
                <>
                  <div className="rounded-full bg-orange-100 p-4 mb-4">
                    <ClipboardList className="h-8 w-8 text-orange-600" />
                  </div>
                  <p className="text-3xl font-bold text-foreground mb-1">{pendingApplications}</p>
                  <p className="text-sm text-muted-foreground mb-4">pending applications to review</p>
                  <Link href="/applications">
                    <Button>Review Applications</Button>
                  </Link>
                </>
              ) : (
                <>
                  <div className="rounded-full bg-green-100 p-4 mb-4">
                    <ClipboardList className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-lg font-medium text-foreground mb-1">All caught up!</p>
                  <p className="text-sm text-muted-foreground mb-4">No pending applications</p>
                </>
              )}
              <Link href="/apply" className="mt-2">
                <Button variant="outline">
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Apply Now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Room Occupancy */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BedDouble className="h-5 w-5" />
                  Room Occupancy
                </CardTitle>
                <CardDescription>Current bed assignments</CardDescription>
              </div>
              <Link href="/rooms">
                <Button variant="ghost" size="sm">
                  Manage <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rooms.slice(0, 6).map((room) => {
                const totalRoomBeds = room.beds?.length || 0
                const occupiedRoomBeds = room.beds?.filter(bed => bed.current_assignment)?.length || 0
                const occupancyPercent = totalRoomBeds > 0 ? (occupiedRoomBeds / totalRoomBeds) * 100 : 0
                
                return (
                  <div key={room.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{room.name}</span>
                      <span className="text-muted-foreground">
                        {occupiedRoomBeds}/{totalRoomBeds} beds
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all",
                          occupancyPercent === 100 ? "bg-orange-500" :
                          occupancyPercent >= 75 ? "bg-yellow-500" :
                          occupancyPercent >= 50 ? "bg-green-500" :
                          "bg-green-400"
                        )}
                        style={{ width: `${occupancyPercent}%` }}
                      />
                    </div>
                  </div>
                )
              })}
              {rooms.length > 6 && (
                <p className="text-sm text-muted-foreground text-center pt-2">
                  +{rooms.length - 6} more rooms
                </p>
              )}
              {rooms.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No rooms configured yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
