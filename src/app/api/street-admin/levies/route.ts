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
    const { title, description, amount, dueDate, isEtagEligible } = body

    if (!title || amount === undefined || amount === null) {
      return NextResponse.json({ error: 'Title and amount are required' }, { status: 400 })
    }

    if (typeof amount !== 'number' || amount < 0) {
      return NextResponse.json({ error: 'Amount must be a positive number' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('levies')
      .insert({
        street_id: streetId,
        title,
        description,
        amount,
        due_date: dueDate,
        is_etag_eligible: isEtagEligible || false
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
      .from('levies')
      .select('*')
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