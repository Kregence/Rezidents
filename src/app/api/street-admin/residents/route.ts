import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function requireStreetAdmin() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, street_id')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'street_admin' || !profile.street_id) {
    throw new Error('Forbidden')
  }

  return profile.street_id
}

export async function POST(request: NextRequest) {
  try {
    const streetId = await requireStreetAdmin()
    const body = await request.json()
    const { unitId, fullName, phone, email, residentType, moveInDate } = body

    if (!unitId || !fullName || !residentType) {
      return NextResponse.json({ error: 'Unit, full name and resident type are required' }, { status: 400 })
    }

    if (residentType !== 'tenant' && residentType !== 'landlord') {
      return NextResponse.json({ error: 'Resident type must be tenant or landlord' }, { status: 400 })
    }

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
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      if (error.message === 'Forbidden') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const streetId = await requireStreetAdmin()
    
    const { data, error } = await supabaseAdmin
      .from('residents')
      .select(`
        *,
        units (id, unit_number, properties (id, name))
      `)
      .eq('street_id', streetId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      if (error.message === 'Forbidden') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}