'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Fine } from '@/types'

export async function getUserFines(userId?: string): Promise<Fine[]> {
  const supabase = await createClient()

  // Get current user if userId not provided
  if (!userId) {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return []
    }
    userId = user.id
  }

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

  return data.reduce((sum, fine) => sum + fine.amount, 0)
}

export async function syncOverdueFines(userId?: string) {
  const supabase = await createClient()
  const { calculateFine, isOverdue } = await import('@/lib/helpers')

  // Get all active (issued) transactions
  let query = supabase
    .from('transactions')
    .select('*, books(*)')
    .eq('status', 'issued')

  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data: transactions, error } = await query

  if (error || !transactions) {
    return { success: false, error: error?.message || 'Failed to fetch transactions' }
  }

  let finesCreated = 0
  let finesUpdated = 0

  for (const transaction of transactions) {
    // Skip if not overdue
    if (!isOverdue(transaction.due_date)) {
      continue
    }

    const currentFine = calculateFine(transaction.due_date)

    // Check if a fine already exists for this transaction
    const { data: existingFines } = await supabase
      .from('fines')
      .select('*')
      .eq('transaction_id', transaction.id)
      .eq('paid', false)

    if (existingFines && existingFines.length > 0) {
      // Update existing fine amount
      const existingFine = existingFines[0]
      if (existingFine.amount !== currentFine) {
        await supabase
          .from('fines')
          .update({ 
            amount: currentFine,
            reason: `Overdue fine for "${transaction.books.title}" (${Math.floor((Date.now() - new Date(transaction.due_date).getTime()) / (1000 * 60 * 60 * 24))} days overdue)`,
          })
          .eq('id', existingFine.id)
        finesUpdated++
      }
    } else {
      // Create new fine
      await supabase
        .from('fines')
        .insert([{
          transaction_id: transaction.id,
          user_id: transaction.user_id,
          amount: currentFine,
          reason: `Overdue fine for "${transaction.books.title}" (${Math.floor((Date.now() - new Date(transaction.due_date).getTime()) / (1000 * 60 * 60 * 24))} days overdue)`,
        }])
      finesCreated++
    }

    // Update transaction fine_amount
    await supabase
      .from('transactions')
      .update({ 
        fine_amount: currentFine,
        status: 'overdue'
      })
      .eq('id', transaction.id)
  }

  revalidatePath('/member/fines')
  revalidatePath('/admin/fines')
  revalidatePath('/librarian/fines')

  return { 
    success: true, 
    finesCreated, 
    finesUpdated,
    message: `Synced fines: ${finesCreated} created, ${finesUpdated} updated` 
  }
}
