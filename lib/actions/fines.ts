'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Fine } from '@/types'

export async function getUserFines(userId: string): Promise<Fine[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('fines')
    .select(`
      *,
      transaction:transactions(*),
      user:profiles(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error || !data) {
    return []
  }

  return data as unknown as Fine[]
}

export async function getAllFines(): Promise<Fine[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('fines')
    .select(`
      *,
      transaction:transactions(*),
      user:profiles(*)
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error || !data) {
    return []
  }

  return data as unknown as Fine[]
}

export async function getUnpaidFines(userId?: string): Promise<Fine[]> {
  const supabase = await createClient()

  let query = supabase
    .from('fines')
    .select(`
      *,
      transaction:transactions(*),
      user:profiles(*)
    `)
    .eq('paid', false)

  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data, error } = await query.order('created_at', { ascending: true })

  if (error || !data) {
    return []
  }

  return data as unknown as Fine[]
}

export async function payFine(fineId: string, paymentMethod: string = 'cash') {
  const supabase = await createClient()

  const { error } = await supabase
    .from('fines')
    .update({
      paid: true,
      paid_date: new Date().toISOString(),
      payment_method: paymentMethod,
    })
    .eq('id', fineId)

  if (error) {
    return { success: false, error: error.message }
  }

  // Also update the transaction fine_paid status
  const { data: fine } = await supabase
    .from('fines')
    .select('transaction_id')
    .eq('id', fineId)
    .single()

  if (fine) {
    await supabase
      .from('transactions')
      .update({ fine_paid: true })
      .eq('id', fine.transaction_id)
  }

  revalidatePath('/member/fines')
  revalidatePath('/librarian/fines')
  revalidatePath('/admin/fines')
  
  return { success: true, message: 'Fine paid successfully' }
}

export async function getTotalUnpaidFines(userId?: string): Promise<number> {
  const supabase = await createClient()

  let query = supabase
    .from('fines')
    .select('amount')
    .eq('paid', false)

  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data, error } = await query

  if (error || !data) {
    return 0
  }

  return data.reduce((total, fine) => total + fine.amount, 0)
}
