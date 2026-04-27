'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Users, Carrot, ChefHat, UtensilsCrossed, UserCircle, X, Building2, BedDouble, ClipboardList, FileText, Settings, LayoutDashboard, CalendarDays, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

const navSections = [
  {
    id: 'overview',
    title: 'Overview',
    icon: LayoutDashboard,
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    id: 'kitchen',
    title: 'Kitchen',
    icon: UtensilsCrossed,
    items: [
      { href: '/ingredients', label: 'Ingredients', icon: Carrot },
      { href: '/recipes', label: 'Recipes', icon: ChefHat },
      { href: '/meal-planner', label: 'Meal Planner', icon: CalendarDays },
      { href: '/weekly-calendar', label: 'Weekly Calendar', icon: Calendar },
    ],
  },
  {
    id: 'people',
    title: 'People',
    icon: UserCircle,
    items: [
      { href: '/residents', label: 'Residents', icon: Users },
      { href: '/apply', label: 'Apply', icon: ClipboardList },
      { href: '/applications', label: 'Applications', icon: FileText },
      { href: '/application-questions', label: 'Questions', icon: Settings },
    ],
  },
  {
    id: 'buildings',
    title: 'Buildings',
    icon: Building2,
    items: [
      { href: '/buildings', label: 'Manage Buildings', icon: Building2 },
      { href: '/rooms', label: 'Rooms', icon: BedDouble },
    ],
  },
]

interface MobileBottomNavProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export function MobileBottomNav({ activeSection, onSectionChange }: MobileBottomNavProps) {
  const pathname = usePathname()
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  // Find which section is currently active based on pathname
  const getActiveSectionId = () => {
    for (const section of navSections) {
      for (const item of section.items) {
        if (pathname.startsWith(item.href)) {
          return section.id
        }
      }
    }
    return null
  }

  const activeSectionId = getActiveSectionId()

  const handleSectionClick = (sectionId: string) => {
    if (expandedSection === sectionId) {
      setExpandedSection(null)
    } else {
      setExpandedSection(sectionId)
    }
  }

  const handleItemClick = (label: string) => {
    onSectionChange(label.toLowerCase())
    setExpandedSection(null)
  }

  return (
    <>
      {/* Expanded Section Overlay */}
      {expandedSection && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setExpandedSection(null)}
        />
      )}

      {/* Expanded Section Menu */}
      {expandedSection && (
        <div className="fixed bottom-16 left-0 right-0 z-50 border-t border-border bg-sidebar p-4 md:hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-foreground">
              {navSections.find(s => s.id === expandedSection)?.title}
            </span>
            <button 
              onClick={() => setExpandedSection(null)}
              className="rounded-full p-1 hover:bg-sidebar-accent"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
          <ul className="space-y-1">
            {navSections
              .find(s => s.id === expandedSection)
              ?.items.map((item) => {
                const isActive = pathname.startsWith(item.href)
                const Icon = item.icon
                
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => handleItemClick(item.label)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground hover:bg-sidebar-accent'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  </li>
                )
              })}
          </ul>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-sidebar md:hidden">
        <ul className="flex items-center justify-around">
          {navSections.map((section) => {
            const isActive = activeSectionId === section.id
            const isExpanded = expandedSection === section.id
            const Icon = section.icon
            
            return (
              <li key={section.id} className="flex-1">
                <button
                  onClick={() => handleSectionClick(section.id)}
                  className={cn(
                    'flex w-full flex-col items-center gap-1 py-3 text-xs font-medium transition-colors',
                    isActive || isExpanded
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {section.title}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )
}
