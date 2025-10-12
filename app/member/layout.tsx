import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { Sidebar, type SidebarItem } from '@/components/sidebar'

const sidebarItems: SidebarItem[] = [
  {
    title: 'Dashboard',
    href: '/member',
    icon: 'LayoutDashboard',
  },
  {
    title: 'Browse Books',
    href: '/member/books',
    icon: 'Library',
  },
  {
    title: 'My Books',
    href: '/member/my-books',
    icon: 'BookOpen',
  },
  {
    title: 'History',
    href: '/member/history',
    icon: 'History',
  },
  {
    title: 'Reservations',
    href: '/member/reservations',
    icon: 'BookMarked',
  },
  {
    title: 'Fines',
    href: '/member/fines',
    icon: 'DollarSign',
  },
]

export default async function MemberLayout({
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

  if (!profile || profile.role !== 'member') {
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
