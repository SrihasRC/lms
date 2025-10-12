import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { Sidebar, type SidebarItem } from '@/components/sidebar'

const sidebarItems: SidebarItem[] = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: 'LayoutDashboard',
  },
  {
    title: 'Books',
    href: '/admin/books',
    icon: 'Book',
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: 'Users',
  },
  {
    title: 'Transactions',
    href: '/admin/transactions',
    icon: 'ArrowRightLeft',
  },
  {
    title: 'Reservations',
    href: '/admin/reservations',
    icon: 'BookMarked',
  },
  {
    title: 'Fines',
    href: '/admin/fines',
    icon: 'IndianRupee',
  },
]

export default async function AdminLayout({
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

  if (!profile || profile.role !== 'admin') {
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
