'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Transaction, IssueBookFormData } from '@/types'
import { calculateDueDate, calculateFine, isOverdue } from '@/lib/helpers'

export async function issueBook(formData: IssueBookFormData, issuedBy: string) {
  const supabase = await createClient()

  // Check if book is available
  const { data: book } = await supabase
    .from('books')
    .select('available_copies')
    .eq('id', formData.book_id)
    .single()

  if (!book || book.available_copies <= 0) {
    return { success: false, error: 'Book is not available' }
  }

  // Check if user already has this book issued
  const { data: existingTransaction } = await supabase
    .from('transactions')
    .select('*')
    .eq('book_id', formData.book_id)
    .eq('user_id', formData.user_id)
    .eq('status', 'issued')
    .single()

  if (existingTransaction) {
    return { success: false, error: 'User already has this book issued' }
  }

  const dueDate = formData.due_date || calculateDueDate()

  // Create transaction
  const { error: transactionError } = await supabase
    .from('transactions')
    .insert([{
      book_id: formData.book_id,
      user_id: formData.user_id,
      issued_by: issuedBy,
      due_date: dueDate,
      status: 'issued',
      notes: formData.notes,
    }])

  if (transactionError) {
    return { success: false, error: transactionError.message }
  }

  // Update book available copies
  const { error: updateError } = await supabase
    .from('books')
    .update({ available_copies: book.available_copies - 1 })
    .eq('id', formData.book_id)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  revalidatePath('/librarian/transactions')
  revalidatePath('/librarian/books')
  revalidatePath('/member/books')
  
  return { success: true, message: 'Book issued successfully' }
}

export async function returnBook(transactionId: string, returnedBy: string) {
  const supabase = await createClient()

  // Get transaction details
  const { data: transaction, error: fetchError } = await supabase
    .from('transactions')
    .select('*, books(*)')
    .eq('id', transactionId)
    .single()

  if (fetchError || !transaction) {
    return { success: false, error: 'Transaction not found' }
  }

  const returnDate = new Date().toISOString()
  const fineAmount = calculateFine(transaction.due_date, returnDate)
  const status = isOverdue(transaction.due_date) ? 'overdue' : 'returned'

  // Update transaction
  const { error: updateError } = await supabase
    .from('transactions')
    .update({
      return_date: returnDate,
      returned_by: returnedBy,
      status: status,
      fine_amount: fineAmount,
    })
    .eq('id', transactionId)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  // Update book available copies
  const { error: bookError } = await supabase
    .from('books')
    .update({ available_copies: transaction.books.available_copies + 1 })
    .eq('id', transaction.book_id)

  if (bookError) {
    return { success: false, error: bookError.message }
  }

  // Create fine record if applicable
  if (fineAmount > 0) {
    await supabase
      .from('fines')
      .insert([{
        transaction_id: transactionId,
        user_id: transaction.user_id,
        amount: fineAmount,
        reason: `Overdue fine for "${transaction.books.title}"`,
      }])
  }

  revalidatePath('/librarian/transactions')
  revalidatePath('/librarian/books')
  revalidatePath('/member/books')
  
  return { 
    success: true, 
    message: fineAmount > 0 
      ? `Book returned with fine of ₹${fineAmount}` 
      : 'Book returned successfully' 
  }
}

export async function getUserTransactions(userId: string): Promise<Transaction[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      book:books(*),
      user:profiles!transactions_user_id_fkey(*),
      issued_by_profile:profiles!transactions_issued_by_fkey(*),
      returned_by_profile:profiles!transactions_returned_by_fkey(*)
    `)
    .eq('user_id', userId)
    .order('issue_date', { ascending: false })

  if (error || !data) {
    return []
  }

  return data as unknown as Transaction[]
}

export async function getActiveTransactions(userId?: string): Promise<Transaction[]> {
  const supabase = await createClient()

  let query = supabase
    .from('transactions')
    .select(`
      *,
      book:books(*),
      user:profiles!transactions_user_id_fkey(*),
      issued_by_profile:profiles!transactions_issued_by_fkey(*)
    `)
    .eq('status', 'issued')

  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data, error } = await query.order('issue_date', { ascending: false })

  if (error || !data) {
    return []
  }

  return data as unknown as Transaction[]
}

export async function getAllTransactions(): Promise<Transaction[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      book:books(*),
      user:profiles!transactions_user_id_fkey(*),
      issued_by_profile:profiles!transactions_issued_by_fkey(*),
      returned_by_profile:profiles!transactions_returned_by_fkey(*)
    `)
    .order('issue_date', { ascending: false })
    .limit(100)

  if (error || !data) {
    return []
  }

  return data as unknown as Transaction[]
}

export async function getOverdueTransactions(): Promise<Transaction[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      book:books(*),
      user:profiles!transactions_user_id_fkey(*)
    `)
    .eq('status', 'issued')
    .lt('due_date', new Date().toISOString())
    .order('due_date', { ascending: true })

  if (error || !data) {
    return []
  }

  return data as unknown as Transaction[]
}

export async function updateOverdueStatus() {
  const supabase = await createClient()

  const { error } = await supabase
    .from('transactions')
    .update({ status: 'overdue' })
    .eq('status', 'issued')
    .lt('due_date', new Date().toISOString())

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/librarian/transactions')
  revalidatePath('/admin/transactions')
  
  return { success: true }
}

export async function borrowBook(bookId: string) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { success: false, error: 'Authentication required' }
  }

  // Check if book is available
  const { data: book, error: bookError } = await supabase
    .from('books')
    .select('available_copies, title')
    .eq('id', bookId)
    .single()

  if (bookError || !book) {
    return { success: false, error: 'Book not found' }
  }

  if (book.available_copies <= 0) {
    return { success: false, error: 'Book is not available' }
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

  const dueDate = calculateDueDate()

  // Create transaction
  const { error: transactionError } = await supabase
    .from('transactions')
    .insert([{
      book_id: bookId,
      user_id: user.id,
      issued_by: user.id, // Self-issue
      due_date: dueDate,
      status: 'issued',
      notes: 'Self-borrowed online',
    }])

  if (transactionError) {
    return { success: false, error: transactionError.message }
  }

  // Update book available copies
  const { error: updateError } = await supabase
    .from('books')
    .update({ available_copies: book.available_copies - 1 })
    .eq('id', bookId)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  revalidatePath('/member/books')
  revalidatePath('/member/my-books')
  revalidatePath('/member')
  
  return { 
    success: true, 
    message: `Successfully borrowed "${book.title}". Due date: ${new Date(dueDate).toLocaleDateString()}` 
  }
}
