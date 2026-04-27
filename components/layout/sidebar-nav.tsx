'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, Carrot, ChefHat, UtensilsCrossed, UserCircle, Building2, BedDouble, ClipboardList, FileText, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navSections = [
  {
    title: 'Kitchen',
    icon: UtensilsCrossed,
    items: [
      { href: '/ingredients', label: 'Ingredients', icon: Carrot },
      { href: '/recipes', label: 'Recipes', icon: ChefHat },
    ],
  },
  {
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
    title: 'Buildings',
    icon: Building2,
    items: [
      { href: '/buildings', label: 'Manage Buildings', icon: Building2 },
      { href: '/rooms', label: 'Rooms', icon: BedDouble },
    ],
  },
]

interface SidebarNavProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export function SidebarNav({ activeSection, onSectionChange }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <aside className="hidden w-64 border-r border-border bg-sidebar md:block">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="border-b border-border p-6">
          <Link href="/" className="block">
            <h1 className="text-xl font-semibold text-foreground">Paz Operations</h1>
            <p className="text-sm text-muted-foreground">Corcovado</p>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-6">
            {navSections.map((section) => {
              const SectionIcon = section.icon
              
              return (
                <div key={section.title}>
                  {/* Section Header */}
                  <div className="mb-2 flex items-center gap-2 px-3">
                    <SectionIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {section.title}
                    </span>
                  </div>
                  
                  {/* Section Items */}
                  <ul className="space-y-1">
                    {section.items.map((item) => {
                      const isActive = pathname.startsWith(item.href)
                      const Icon = item.icon
                      
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => onSectionChange(item.label.toLowerCase())}
                            className={cn(
                              'flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
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
              )
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-4">
          <p className="text-xs text-muted-foreground">
            Off-grid rainforest living
          </p>
        </div>
      </div>
    </aside>
  )
}
