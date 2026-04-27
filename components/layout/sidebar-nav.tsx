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
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href)
              const Icon = item.icon
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => onSectionChange(item.label.toLowerCase())}
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
