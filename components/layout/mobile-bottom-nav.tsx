'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, Carrot, ChefHat } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/residents', label: 'Residents', icon: Users },
  { href: '/ingredients', label: 'Ingredients', icon: Carrot },
  { href: '/recipes', label: 'Recipes', icon: ChefHat },
]

interface MobileBottomNavProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export function MobileBottomNav({ activeSection, onSectionChange }: MobileBottomNavProps) {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-sidebar md:hidden">
      <ul className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon
          
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                onClick={() => onSectionChange(item.label.toLowerCase())}
                className={cn(
                  'flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors',
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
