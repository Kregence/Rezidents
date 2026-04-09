import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function getStreetProperties(streetId: string) {
  const { data, error } = await supabaseAdmin
    .from('properties')
    .select('*')
    .eq('street_id', streetId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function getStreetUnits(streetId: string) {
  const { data, error } = await supabaseAdmin
    .from('units')
    .select(`
      *,
      properties (name)
    `)
    .eq('street_id', streetId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function getStreetResidents(streetId: string) {
  const { data, error } = await supabaseAdmin
    .from('residents')
    .select(`
      *,
      units (unit_number, properties (name))
    `)
    .eq('street_id', streetId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function getStreetLevies(streetId: string) {
  const { data, error } = await supabaseAdmin
    .from('levies')
    .select('*')
    .eq('street_id', streetId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function getStreetStats(streetId: string) {
  const [propertiesRes, unitsRes, residentsRes, leviesRes] = await Promise.all([
    supabaseAdmin.from('properties').select('id', { count: 'exact', head: true }).eq('street_id', streetId),
    supabaseAdmin.from('units').select('id', { count: 'exact', head: true }).eq('street_id', streetId),
    supabaseAdmin.from('residents').select('id', { count: 'exact', head: true }).eq('street_id', streetId),
    supabaseAdmin.from('levies').select('id', { count: 'exact', head: true }).eq('street_id', streetId).eq('is_active', true)
  ])

  return {
    totalProperties: propertiesRes.count || 0,
    totalUnits: unitsRes.count || 0,
    totalResidents: residentsRes.count || 0,
    totalActiveLevies: leviesRes.count || 0
  }
}

export async function createProperty(streetId: string, name: string, addressLine?: string) {
  const { data, error } = await supabaseAdmin
    .from('properties')
    .insert({ street_id: streetId, name, address_line: addressLine })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      throw new Error('A property with this name already exists on this street')
    }
    throw new Error(error.message)
  }

  revalidatePath('/street-admin')
  return data
}

export async function createUnit(streetId: string, propertyId: string, unitNumber: string, type: string) {
  const { data, error } = await supabaseAdmin
    .from('units')
    .insert({ street_id: streetId, property_id: propertyId, unit_number: unitNumber, type })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      throw new Error('This unit number already exists in the selected property')
    }
    throw new Error(error.message)
  }

  revalidatePath('/street-admin')
  return data
}

export async function createResident(
  streetId: string,
  unitId: string,
  fullName: string,
  phone: string,
  email: string | null,
  residentType: 'tenant' | 'landlord',
  moveInDate: string | null
) {
  const { data, error } = await supabaseAdmin
    .from('residents')
    .insert({
      street_id: streetId,
      unit_id: unitId,
      full_name: fullName,
      phone,
      email,
      resident_type: residentType,
      move_in_date: moveInDate
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/street-admin')
  return data
}

export async function createLevy(
  streetId: string,
  title: string,
  description: string | null,
  amount: number,
  dueDate: string | null,
  isEtagEligible: boolean
) {
  const { data, error } = await supabaseAdmin
    .from('levies')
    .insert({
      street_id: streetId,
      title,
      description,
      amount,
      due_date: dueDate,
      is_etag_eligible: isEtagEligible
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/street-admin')
  return data
}