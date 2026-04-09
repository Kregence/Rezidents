import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { AppRole } from './types'

export async function getUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  return user
}

export async function getProfile(): Promise<import('@/lib/types').Profile | null> {
  const supabase = await createClient()
  const user = await getUser()
  
  if (!user) {
    return null
  }
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  if (error || !profile) {
    return null
  }
  
  return profile as import('@/lib/types').Profile
}

export async function requireAuth() {
  const profile = await getProfile()
  
  if (!profile) {
    redirect('/login')
  }
  
  return profile
}

export async function requireRole(roles: AppRole[]) {
  const profile = await requireAuth()
  
  if (!roles.includes(profile.role)) {
    redirect('/unauthorized')
  }
  
  return profile
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export function getRoleRedirectUrl(role: AppRole): string {
  switch (role) {
    case 'super_admin':
      return '/super-admin'
    case 'street_admin':
      return '/street-admin'
    case 'resident':
      return '/resident'
    default:
      return '/login'
  }
}