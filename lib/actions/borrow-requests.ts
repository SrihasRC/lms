'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { BorrowRequest } from '@/types'
import { calculateDueDate } from '@/lib/helpers'

export async function createBorrowRequest(bookId: string, notes?: string) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { success: false, error: 'Authentication required' }
  }

  // Check if book exists and get info
  const { data: book, error: bookError } = await supabase
    .from('books')
    .select('id, title, available_copies')
    .eq('id', bookId)
    .single()

  if (bookError || !book) {
    return { success: false, error: 'Book not found' }
  }

  // Check if user already has an active borrow request for this book
  const { data: existingRequest } = await supabase
    .from('borrow_requests')
    .select('*')
    .eq('book_id', bookId)
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .single()

  if (existingRequest) {
    return { success: false, error: 'You already have a pending request for this book' }
  }

  // Check if user already has this book issued
  const { data: existingTransaction } = await supabase
    .from('transactions')
    .select('*')
    .eq('book_id', bookId)
    .eq('user_id', user.id)
    .eq('status', 'issued')
    .single()

  if (existingTransaction) {
    return { success: false, error: 'You already have this book borrowed' }
  }

  const requestedDueDate = calculateDueDate()

  // Create borrow request
  const { error: insertError } = await supabase
    .from('borrow_requests')
    .insert([{
      book_id: bookId,
      user_id: user.id,
      requested_due_date: requestedDueDate,
      status: 'pending',
      notes,
    }])

  if (insertError) {
    return { success: false, error: insertError.message }
  }

  revalidatePath('/member/books')
  revalidatePath('/member')
  
  return { 
    success: true, 
    message: `Borrow request submitted for "${book.title}". Please wait for librarian approval.` 
  }
}

export async function cancelBorrowRequest(requestId: string) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { success: false, error: 'Authentication required' }
  }

  // Verify the request belongs to the user
  const { data: request, error: fetchError } = await supabase
    .from('borrow_requests')
    .select('*')
    .eq('id', requestId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !request) {
    return { success: false, error: 'Request not found' }
  }

  if (request.status !== 'pending') {
    return { success: false, error: 'Only pending requests can be cancelled' }
  }

  // Update request status
  const { error: updateError } = await supabase
    .from('borrow_requests')
    .update({ status: 'cancelled' })
    .eq('id', requestId)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  revalidatePath('/member')
  
  return { success: true, message: 'Borrow request cancelled' }
}

export async function getUserBorrowRequests(userId?: string): Promise<BorrowRequest[]> {
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
    .from('borrow_requests')
    .select(`
      *,
      book:books(*),
      user:profiles!borrow_requests_user_id_fkey(*),
      reviewed_by_profile:profiles!borrow_requests_reviewed_by_fkey(*)
    `)
    .eq('user_id', userId)
    .order('request_date', { ascending: false })

  if (error || !data) {
    return []
  }

  return data as unknown as BorrowRequest[]
}

export async function getPendingBorrowRequests(): Promise<BorrowRequest[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('borrow_requests')
    .select(`
      *,
      book:books(*),
      user:profiles!borrow_requests_user_id_fkey(*)
    `)
    .eq('status', 'pending')
    .order('request_date', { ascending: true })

  if (error || !data) {
    return []
  }

  return data as unknown as BorrowRequest[]
}

export async function getAllBorrowRequests(): Promise<BorrowRequest[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('borrow_requests')
    .select(`
      *,
      book:books(*),
      user:profiles!borrow_requests_user_id_fkey(*),
      reviewed_by_profile:profiles!borrow_requests_reviewed_by_fkey(*)
    `)
    .order('request_date', { ascending: false })
    .limit(100)

  if (error || !data) {
    return []
  }

  return data as unknown as BorrowRequest[]
}

export async function approveBorrowRequest(requestId: string) {
  const supabase = await createClient()

  // Get current user (librarian)
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { success: false, error: 'Authentication required' }
  }

  // Get request details
  const { data: request, error: fetchError } = await supabase
    .from('borrow_requests')
    .select('*, book:books(*)')
    .eq('id', requestId)
    .single()

  if (fetchError || !request) {
    return { success: false, error: 'Request not found' }
  }

  if (request.status !== 'pending') {
    return { success: false, error: 'Only pending requests can be approved' }
  }

  // Check if book is still available
  if (request.book.available_copies <= 0) {
    return { success: false, error: 'Book is no longer available' }
  }

  // Start a transaction-like operation
  // 1. Create transaction (issue book)
  const { error: transactionError } = await supabase
    .from('transactions')
    .insert([{
      book_id: request.book_id,
      user_id: request.user_id,
      issued_by: user.id,
      due_date: request.requested_due_date,
      status: 'issued',
      notes: `Approved from borrow request`,
    }])

  if (transactionError) {
    return { success: false, error: transactionError.message }
  }

  // 2. Update book available copies
  const { error: updateBookError } = await supabase
    .from('books')
    .update({ available_copies: request.book.available_copies - 1 })
    .eq('id', request.book_id)

  if (updateBookError) {
    return { success: false, error: updateBookError.message }
  }

  // 3. Update request status
  const { error: updateRequestError } = await supabase
    .from('borrow_requests')
    .update({ 
      status: 'approved',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', requestId)

  if (updateRequestError) {
    return { success: false, error: updateRequestError.message }
  }

  revalidatePath('/librarian/requests')
  revalidatePath('/librarian/transactions')
  revalidatePath('/member/books')
  
  return { 
    success: true, 
    message: `Borrow request approved. Book "${request.book.title}" issued to member.` 
  }
}

export async function rejectBorrowRequest(requestId: string, reason?: string) {
  const supabase = await createClient()

  // Get current user (librarian)
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { success: false, error: 'Authentication required' }
  }

  // Get request details
  const { data: request, error: fetchError } = await supabase
    .from('borrow_requests')
    .select('*')
    .eq('id', requestId)
    .single()

  if (fetchError || !request) {
    return { success: false, error: 'Request not found' }
  }

  if (request.status !== 'pending') {
    return { success: false, error: 'Only pending requests can be rejected' }
  }

  // Update request status
  const { error: updateError } = await supabase
    .from('borrow_requests')
    .update({ 
      status: 'rejected',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      rejection_reason: reason || 'Request rejected by librarian',
    })
    .eq('id', requestId)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  revalidatePath('/librarian/requests')
  
  return { success: true, message: 'Borrow request rejected' }
}
