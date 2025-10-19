import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { Sidebar, type SidebarItem } from '@/components/sidebar'

const sidebarItems: SidebarItem[] = [
  {
    title: 'Dashboard',
    href: '/librarian',
    icon: 'LayoutDashboard',
  },
  {
    title: 'Borrow Requests',
    href: '/librarian/requests',
    icon: 'FileCheck',
  },
  {
    title: 'Issue Book',
    href: '/librarian/issue',
    icon: 'BookPlus',
  },
  {
    title: 'Return Book',
    href: '/librarian/return',
    icon: 'BookCheck',
  },
  {
    title: 'Transactions',
    href: '/librarian/transactions',
    icon: 'ArrowRightLeft',
  },
  {
    title: 'Reservations',
    href: '/librarian/reservations',
    icon: 'BookMarked',
  },
  {
    title: 'Overdue Books',
    href: '/librarian/overdue',
    icon: 'AlertCircle',
  },
]

export default async function LibrarianLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'librarian') {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={profile} />
      <div className="flex">
        <Sidebar items={sidebarItems} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
