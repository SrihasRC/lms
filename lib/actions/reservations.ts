'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Reservation } from '@/types'
import { RESERVATION_EXPIRY_DAYS } from '@/lib/constants'

export async function createReservation(bookId: string, userId: string) {
  const supabase = await createClient()

  // Check if book is available
  const { data: book } = await supabase
    .from('books')
    .select('available_copies')
    .eq('id', bookId)
    .single()

  if (book && book.available_copies > 0) {
    return { success: false, error: 'Book is currently available. Please borrow it directly.' }
  }

  // Check if user already has a pending reservation for this book
  const { data: existingReservation } = await supabase
    .from('reservations')
    .select('*')
    .eq('book_id', bookId)
    .eq('user_id', userId)
    .eq('status', 'pending')
    .single()

  if (existingReservation) {
    return { success: false, error: 'You already have a pending reservation for this book' }
  }

  // Get current queue position
  const { count } = await supabase
    .from('reservations')
    .select('*', { count: 'exact', head: true })
    .eq('book_id', bookId)
    .eq('status', 'pending')

  const queuePosition = (count || 0) + 1

  // Calculate expiry date
  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + RESERVATION_EXPIRY_DAYS)

  // Create reservation
  const { error } = await supabase
    .from('reservations')
    .insert([{
      book_id: bookId,
      user_id: userId,
      queue_position: queuePosition,
      expiry_date: expiryDate.toISOString(),
    }])

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/member/books')
  revalidatePath('/member/reservations')
  revalidatePath('/librarian/reservations')
  
  return { success: true, message: `Book reserved successfully. Queue position: ${queuePosition}` }
}

export async function cancelReservation(reservationId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('reservations')
    .update({ status: 'cancelled' })
    .eq('id', reservationId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/member/reservations')
  revalidatePath('/librarian/reservations')
  
  return { success: true, message: 'Reservation cancelled successfully' }
}

export async function fulfillReservation(reservationId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('reservations')
    .update({ 
      status: 'fulfilled',
      fulfilled_date: new Date().toISOString(),
    })
    .eq('id', reservationId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/librarian/reservations')
  
  return { success: true, message: 'Reservation fulfilled successfully' }
}

export async function getUserReservations(userId: string): Promise<Reservation[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('reservations')
    .select(`
      *,
      book:books(*),
      user:profiles(*)
    `)
    .eq('user_id', userId)
    .order('reservation_date', { ascending: false })

  if (error || !data) {
    return []
  }

  return data as unknown as Reservation[]
}

export async function getAllReservations(): Promise<Reservation[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('reservations')
    .select(`
      *,
      book:books(*),
      user:profiles(*)
    `)
    .order('reservation_date', { ascending: false })
    .limit(100)

  if (error || !data) {
    return []
  }

  return data as unknown as Reservation[]
}

export async function getPendingReservations(bookId?: string): Promise<Reservation[]> {
  const supabase = await createClient()

  let query = supabase
    .from('reservations')
    .select(`
      *,
      book:books(*),
      user:profiles(*)
    `)
    .eq('status', 'pending')

  if (bookId) {
    query = query.eq('book_id', bookId)
  }

  const { data, error } = await query.order('queue_position', { ascending: true })

  if (error || !data) {
    return []
  }

  return data as unknown as Reservation[]
}

export async function updateExpiredReservations() {
  const supabase = await createClient()

  const { error } = await supabase
    .from('reservations')
    .update({ status: 'expired' })
    .eq('status', 'pending')
    .lt('expiry_date', new Date().toISOString())

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/librarian/reservations')
  revalidatePath('/member/reservations')
  
  return { success: true }
}
