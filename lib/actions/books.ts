'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { BookFormData, Book, BookFilters, PaginatedResponse } from '@/types'
import { getBookCoverUrl } from '@/lib/helpers'

export async function createBook(formData: BookFormData) {
  const supabase = await createClient()

  const bookData = {
    ...formData,
    available_copies: formData.total_copies,
    cover_url: getBookCoverUrl(formData.isbn, 'L'),
  }

  const { error } = await supabase
    .from('books')
    .insert([bookData])

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/books')
  revalidatePath('/librarian/books')
  return { success: true, message: 'Book added successfully' }
}

export async function updateBook(id: string, formData: Partial<BookFormData>) {
  const supabase = await createClient()

  const updateData: Record<string, unknown> = { ...formData }
  
  if (formData.isbn) {
    updateData.cover_url = getBookCoverUrl(formData.isbn, 'L')
  }

  const { error } = await supabase
    .from('books')
    .update(updateData)
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/books')
  revalidatePath('/librarian/books')
  return { success: true, message: 'Book updated successfully' }
}

export async function deleteBook(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('books')
    .delete()
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/books')
  return { success: true, message: 'Book deleted successfully' }
}

export async function getBook(id: string): Promise<Book | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

export async function getAllBooks(
  filters?: BookFilters,
  page: number = 1,
  limit: number = 12
): Promise<PaginatedResponse<Book>> {
  const supabase = await createClient()

  let query = supabase
    .from('books')
    .select('*', { count: 'exact' })

  // Apply filters
  if (filters?.genre) {
    query = query.eq('genre', filters.genre)
  }

  if (filters?.availability === 'available') {
    query = query.gt('available_copies', 0)
  } else if (filters?.availability === 'unavailable') {
    query = query.eq('available_copies', 0)
  }

  if (filters?.year) {
    query = query.eq('publication_year', filters.year)
  }

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,author.ilike.%${filters.search}%,isbn.ilike.%${filters.search}%`)
  }

  // Apply pagination
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await query
    .order('title', { ascending: true })
    .range(from, to)

  if (error) {
    return {
      data: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
    }
  }

  return {
    data: data || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  }
}

export async function searchBooks(query: string): Promise<Book[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('books')
    .select('*')
    .or(`title.ilike.%${query}%,author.ilike.%${query}%,isbn.ilike.%${query}%,genre.ilike.%${query}%`)
    .limit(20)

  if (error || !data) {
    return []
  }

  return data
}

export async function getAvailableBooks(): Promise<Book[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('books')
    .select('*')
    .gt('available_copies', 0)
    .order('title', { ascending: true })

  if (error || !data) {
    return []
  }

  return data
}

export async function getGenres(): Promise<string[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('books')
    .select('genre')
    .order('genre', { ascending: true })

  if (error || !data) {
    return []
  }

  // Get unique genres
  const genres = [...new Set(data.map(book => book.genre))]
  return genres
}

export async function issueBook(bookId: string, userId: string) {
  const supabase = await createClient()

  // Get current user (librarian)
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Check if book is available
  const { data: book } = await supabase
    .from('books')
    .select('available_copies, title')
    .eq('id', bookId)
    .single()

  if (!book || book.available_copies <= 0) {
    return { success: false, error: 'Book is not available' }
  }

  // Check if user already has this book issued
  const { data: existingTransaction } = await supabase
    .from('transactions')
    .select('*')
    .eq('book_id', bookId)
    .eq('user_id', userId)
    .eq('status', 'issued')
    .maybeSingle()

  if (existingTransaction) {
    return { success: false, error: 'User already has this book issued' }
  }

  // Calculate due date (14 days from now)
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 14)

  // Create transaction
  const { error: transactionError } = await supabase
    .from('transactions')
    .insert([{
      book_id: bookId,
      user_id: userId,
      issued_by: user.id,
      due_date: dueDate.toISOString(),
      status: 'issued',
    }])

  if (transactionError) {
    return { success: false, error: transactionError.message }
  }

  // Update book availability
  const { error: updateError } = await supabase
    .from('books')
    .update({ available_copies: book.available_copies - 1 })
    .eq('id', bookId)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  revalidatePath('/librarian/issue')
  revalidatePath('/admin/books')
  revalidatePath('/admin/transactions')
  
  return { success: true, message: `Book "${book.title}" issued successfully` }
}
