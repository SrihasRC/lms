'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Profile, UserRole } from '@/types'

export async function getAllUsers(role?: UserRole): Promise<Profile[]> {
  const supabase = await createClient()

  let query = supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (role) {
    query = query.eq('role', role)
  }

  const { data, error } = await query

  if (error || !data) {
    return []
  }

  return data
}

export async function getUser(userId: string): Promise<Profile | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

export async function updateUserRole(userId: string, role: UserRole) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/users')
  return { success: true, message: 'User role updated successfully' }
}

export async function deleteUser(userId: string) {
  const supabase = await createClient()

  // Note: This will cascade delete related records due to foreign key constraints
  const { error } = await supabase.auth.admin.deleteUser(userId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/users')
  return { success: true, message: 'User deleted successfully' }
}

export async function searchUsers(query: string): Promise<Profile[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .or(`full_name.ilike.%${query}%,email.ilike.%${query}%,member_id.ilike.%${query}%`)
    .limit(20)

  if (error || !data) {
    return []
  }

  return data
}

export async function getUserStats(userId: string) {
  const supabase = await createClient()

  const [
    { count: totalBorrowed },
    { count: currentlyBorrowed },
    { count: overdue },
    { data: fines }
  ] = await Promise.all([
    supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId),
    
    supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'issued'),
    
    supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'overdue'),
    
    supabase
      .from('fines')
      .select('amount, paid')
      .eq('user_id', userId)
  ])

  const totalFines = fines?.reduce((sum, fine) => sum + fine.amount, 0) || 0
  const unpaidFines = fines?.filter(f => !f.paid).reduce((sum, fine) => sum + fine.amount, 0) || 0

  return {
    totalBorrowed: totalBorrowed || 0,
    currentlyBorrowed: currentlyBorrowed || 0,
    overdue: overdue || 0,
    totalFines,
    unpaidFines,
  }
}

export async function getUserByMemberId(search: string): Promise<Profile | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .or(`member_id.eq.${search},email.eq.${search}`)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

