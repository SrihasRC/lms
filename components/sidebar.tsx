'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import * as Icons from 'lucide-react'

export interface SidebarItem {
  title: string
  href: string
  icon: string
}

interface SidebarProps {
  items: SidebarItem[]
}

export function Sidebar({ items }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r bg-card h-[calc(100vh-4rem)] sticky top-16">
      <nav className="flex flex-col gap-1 p-4">
        {items.map((item) => {
          const IconComponent = Icons[item.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }> || Icons.Circle
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <IconComponent className="h-4 w-4" />
              {item.title}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
