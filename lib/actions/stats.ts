'use server'

import { createClient } from '@/lib/supabase/server'
import type { DashboardStats } from '@/types'

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient()

  const [
    { data: books },
    { count: totalMembers },
    { count: activeTransactions },
    { count: overdueTransactions },
    { data: fines },
    { count: totalReservations }
  ] = await Promise.all([
    supabase.from('books').select('total_copies, available_copies'),
    
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'member'),
    
    supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'issued'),
    
    supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'overdue'),
    
    supabase.from('fines').select('amount, paid'),
    
    supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
  ])

  const totalBooks = books?.reduce((sum, book) => sum + book.total_copies, 0) || 0
  const availableBooks = books?.reduce((sum, book) => sum + book.available_copies, 0) || 0
  const totalFines = fines?.reduce((sum, fine) => sum + fine.amount, 0) || 0
  const unpaidFines = fines?.filter(f => !f.paid).reduce((sum, fine) => sum + fine.amount, 0) || 0

  return {
    totalBooks,
    availableBooks,
    totalMembers: totalMembers || 0,
    activeTransactions: activeTransactions || 0,
    overdueTransactions: overdueTransactions || 0,
    totalFines,
    unpaidFines,
    totalReservations: totalReservations || 0,
  }
}
