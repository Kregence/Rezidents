import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { AppRole, Profile, Street } from '@/lib/types'

export interface StreetAdminContext {
  profile: Profile & { street?: Street | null }
  streetId: string
  street: Street
}

export async function getStreetAdminContext(): Promise<StreetAdminContext> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select(`
      *,
      streets (id, name, slug)
    `)
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    redirect('/login')
  }

  const profileWithStreet = profile as Profile & { streets: Street }

  if (profileWithStreet.role !== 'street_admin') {
    redirect('/unauthorized')
  }

  if (!profileWithStreet.street_id || !profileWithStreet.streets) {
    redirect('/unauthorized')
  }

  return {
    profile: profileWithStreet,
    streetId: profileWithStreet.street_id,
    street: profileWithStreet.streets as Street
  }
}

export async function requireStreetAdmin() {
  return getStreetAdminContext()
}