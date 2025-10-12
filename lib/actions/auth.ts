'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { LoginFormData, RegisterFormData } from '@/types'

export async function login(formData: LoginFormData) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  // Get user role to redirect appropriately
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'User not found after login' }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.error('Profile fetch error:', profileError)
    return { success: false, error: `Profile error: ${profileError.message}` }
  }

  if (!profile) {
    return { success: false, error: 'Profile not found. Please contact administrator.' }
  }

  revalidatePath('/', 'layout')
  redirect(`/${profile.role}`)
}

export async function register(formData: RegisterFormData) {
  const supabase = await createClient()

  // Sign up the user
  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        full_name: formData.full_name,
        role: formData.role || 'member',
        phone: formData.phone,
        address: formData.address,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
    },
  })

  if (error) {
    return { success: false, error: error.message }
  }

  // Check if email confirmation is required
  if (data.user && !data.session) {
    return { 
      success: true, 
      message: 'Registration successful! Please check your email to verify your account before logging in.' 
    }
  }

  return { 
    success: true, 
    message: 'Registration successful! You can now log in.' 
  }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function getCurrentUser() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

export async function updateProfile(userId: string, data: Partial<RegisterFormData>) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: data.full_name,
      phone: data.phone,
      address: data.address,
    })
    .eq('id', userId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true, message: 'Profile updated successfully' }
}
