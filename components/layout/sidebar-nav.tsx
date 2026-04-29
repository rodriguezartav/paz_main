'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, Carrot, ChefHat, UtensilsCrossed, UserCircle, Building2, BedDouble, ClipboardList, FileText, Settings, LayoutDashboard, CalendarDays, Calendar, KeyRound, LogOut, DollarSign, Receipt, CalendarCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { logout } from '@/app/login/actions'
import { cn } from '@/lib/utils'
import Image from 'next/image'

const navSections = [
  {
    title: 'Overview',
    icon: LayoutDashboard,
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
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
    title: 'People',
    icon: UserCircle,
    items: [
      { href: '/residents', label: 'Residents', icon: Users },
      { href: '/bills', label: 'Bills', icon: Receipt },
      { href: '/apply', label: 'Apply', icon: ClipboardList },
      { href: '/applications', label: 'Applications', icon: FileText },
      { href: '/application-questions', label: 'Questions', icon: Settings },
      { href: '/users', label: 'Users', icon: KeyRound },
    ],
  },
  {
    title: 'Buildings',
    icon: Building2,
    items: [
      { href: '/buildings', label: 'Manage Buildings', icon: Building2 },
      { href: '/rooms', label: 'Rooms', icon: BedDouble },
      { href: '/rates', label: 'Guest Rates', icon: DollarSign },
      { href: '/activities', label: 'Activities', icon: CalendarCheck },
    ],
  },
]

interface SidebarNavProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export function SidebarNav({ activeSection, onSectionChange }: SidebarNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  
  const handleLogout = async () => {
    await logout()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="hidden w-64 border-r border-border bg-sidebar md:block">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="border-b border-border pl-10 py-1">
          <Link href="/" className="block">
            
            <Image
            src="/logo.png"
            alt="Paz Operations"
            width={100}
            height={30}
            className="mb-2 h-auto w-auto max-w-[100px]"
            priority
          />
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
                      const isActive = item.href === '/' || item.href === '/dashboard' 
                        ? pathname === '/' || pathname === '/dashboard'
                        : pathname.startsWith(item.href)
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
        <div className="border-t border-border p-4 space-y-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
          <p className="text-xs text-muted-foreground px-4">
            Off-grid rainforest living
          </p>
        </div>
      </div>
    </aside>
  )
}
