'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ResidentCard } from '@/components/residents/resident-card'
import { CheckInForm } from '@/components/residents/check-in-form'
import { PaymentCard } from '@/components/residents/payment-card'
import { residents, payments } from '@/lib/data'

export default function ResidentsPage() {
  const [activeTab, setActiveTab] = useState('current')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Residents</h1>
        <p className="text-muted-foreground">Manage residents and check-ins</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="current">Current Residents</TabsTrigger>
          <TabsTrigger value="checkin">Self-Service Check-In</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        {/* Current Residents */}
        <TabsContent value="current" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {residents.map((resident) => {
              const payment = payments.find(p => p.residentId === resident.id)
              return (
                <ResidentCard 
                  key={resident.id} 
                  resident={resident} 
                  payment={payment}
                />
              )
            })}
          </div>
        </TabsContent>

        {/* Self-Service Check-In */}
        <TabsContent value="checkin">
          <CheckInForm />
        </TabsContent>

        {/* Payments */}
        <TabsContent value="payments" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {residents.map((resident) => {
              const payment = payments.find(p => p.residentId === resident.id)
              if (!payment) return null
              return (
                <PaymentCard 
                  key={resident.id} 
                  resident={resident} 
                  payment={payment}
                />
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
