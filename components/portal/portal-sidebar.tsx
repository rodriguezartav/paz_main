'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, UtensilsCrossed, CalendarCheck, BookOpen, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

const navItems = [
  { href: '/portal', label: 'Home', icon: Home },
  { href: '/portal/menu', label: 'This Week\'s Menu', icon: UtensilsCrossed },
  { href: '/portal/activities', label: 'Activities', icon: CalendarCheck },
  { href: '/portal/guidelines', label: 'House Guidelines', icon: BookOpen },
]

export function PortalSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-64 border-r border-border bg-sidebar md:block">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="border-b border-border px-6 py-4">
          <Link href="/portal" className="block">
            <Image
              src="/logo.png"
              alt="Paz Corcovado"
              width={120}
              height={36}
              className="h-auto w-auto max-w-[120px]"
              priority
            />
          </Link>
        </div>

       

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = item.href === '/portal' 
                ? pathname === '/portal'
                : pathname.startsWith(item.href)
              const Icon = item.icon
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
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
        </nav>

        {/* Staff Link */}
        <div className="border-t border-border p-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
          >
            <LayoutDashboard className="h-5 w-5" />
            Staff Dashboard
          </Link>
        </div>
      </div>
    </aside>
  )
}
