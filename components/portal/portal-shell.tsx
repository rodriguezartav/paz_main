'use client'

import { PortalSidebar } from './portal-sidebar'
import { PortalMobileNav } from './portal-mobile-nav'

interface PortalShellProps {
  children: React.ReactNode
}

export function PortalShell({ children }: PortalShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      {/* Desktop Sidebar */}
      <PortalSidebar />
      
      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0">
        <div className="mx-auto max-w-4xl px-4 py-6">
          {children}
        </div>
      </main>
      
      {/* Mobile Bottom Navigation */}
      <PortalMobileNav />
    </div>
  )
}
