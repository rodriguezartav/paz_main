'use client'

import { useState } from 'react'
import { SidebarNav } from './sidebar-nav'
import { MobileBottomNav } from './mobile-bottom-nav'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [activeSection, setActiveSection] = useState<string>('residents')

  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      {/* Desktop Sidebar */}
      <SidebarNav 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      
      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0">
        <div className="mx-auto max-w-6xl px-4 py-6">
          {children}
        </div>
      </main>
      
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
    </div>
  )
}
