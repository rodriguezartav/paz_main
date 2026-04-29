'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, UtensilsCrossed, CalendarCheck, BookOpen, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/portal', label: 'Home', icon: Home },
  { href: '/portal/menu', label: 'Menu', icon: UtensilsCrossed },
  { href: '/portal/activities', label: 'Activities', icon: CalendarCheck },
  { href: '/portal/guidelines', label: 'Guidelines', icon: BookOpen },
  { href: '/dashboard', label: 'Staff', icon: LayoutDashboard },
]

export function PortalMobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-sidebar md:hidden">
      <ul className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = item.href === '/portal' 
            ? pathname === '/portal'
            : pathname.startsWith(item.href)
          const Icon = item.icon
          
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  'flex w-full flex-col items-center gap-1 py-3 text-xs font-medium transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
