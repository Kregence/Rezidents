import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { AppRole, Profile, Street } from '@/lib/types'

export interface ResidentRecord {
  id: string
  street_id: string
  unit_id: string
  profile_id: string | null
  full_name: string
  phone: string | null
  email: string | null
  resident_type: 'tenant' | 'landlord'
  move_in_date: string | null
  is_active: boolean
  created_at: string
  units?: {
    unit_number: string
    properties?: {
      name: string
      street_id: string
      streets?: {
        name: string
        slug: string
      }
    }
  }
}

export interface ResidentContext {
  profile: Profile
  resident: ResidentRecord | null
  street: Street | null
}

export async function getResidentContext(): Promise<ResidentContext> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    redirect('/login')
  }

  if (profile.role !== 'resident') {
    if (profile.role === 'super_admin') {
      redirect('/super-admin')
    }
    if (profile.role === 'street_admin') {
      redirect('/street-admin')
    }
    redirect('/unauthorized')
  }

  const { data: resident, error: residentError } = await supabase
    .from('residents')
    .select(`
      *,
      units (
        unit_number,
        properties (
          name,
          street_id,
          streets (name, slug)
        )
      )
    `)
    .eq('profile_id', user.id)
    .single()

  let street: Street | null = null
  if (resident?.units?.properties?.streets) {
    street = {
      id: resident.units.properties.street_id || '',
      name: resident.units.properties.streets.name,
      slug: resident.units.properties.streets.slug,
      logo_url: null,
      created_at: '',
      updated_at: ''
    }
  }

  return {
    profile,
    resident: residentError ? null : (resident as ResidentRecord),
    street
  }
}

export async function requireResident() {
  return getResidentContext()
}