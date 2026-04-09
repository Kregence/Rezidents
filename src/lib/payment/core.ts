import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface Street {
  id: string
  name: string
  slug: string
  logo_url: string | null
}

export interface Levy {
  id: string
  title: string
  description: string | null
  amount: number
  due_date: string | null
  is_active: boolean
  is_etag_eligible: boolean
}

export interface Resident {
  id: string
  full_name: string
  phone: string | null
  email: string | null
  unit_id: string
  units?: { unit_number: string; properties?: { name: string } }
}

export interface Payment {
  id: string
  street_id: string
  resident_id: string
  levy_id: string
  amount: number
  payment_method: string
  reference: string
  status: string
  paystack_reference: string | null
  paid_at: string | null
  metadata: Record<string, unknown>
}

export async function getStreetBySlug(slug: string): Promise<Street | null> {
  const { data, error } = await supabaseAdmin
    .from('streets')
    .select('id, name, slug, logo_url')
    .eq('slug', slug)
    .single()

  if (error || !data) return null
  return data as Street
}

export async function getActiveLevies(streetId: string): Promise<Levy[]> {
  const { data, error } = await supabaseAdmin
    .from('levies')
    .select('id, title, description, amount, due_date, is_active, is_etag_eligible')
    .eq('street_id', streetId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) return []
  return data as Levy[]
}

export async function getResidentsByStreet(streetId: string): Promise<Resident[]> {
  const { data, error } = await supabaseAdmin
    .from('residents')
    .select('id, full_name, phone, email, unit_id, units (unit_number, properties (name))')
    .eq('street_id', streetId)
    .eq('is_active', true)
    .order('full_name', { ascending: true })

  if (error) return []
  return data as unknown as Resident[]
}

export async function getLevyById(levyId: string, streetId: string): Promise<Levy | null> {
  const { data, error } = await supabaseAdmin
    .from('levies')
    .select('id, title, description, amount, due_date, is_active, is_etag_eligible')
    .eq('id', levyId)
    .eq('street_id', streetId)
    .eq('is_active', true)
    .single()

  if (error || !data) return null
  return data as Levy
}

export async function getResidentById(residentId: string, streetId: string): Promise<Resident | null> {
  const { data, error } = await supabaseAdmin
    .from('residents')
    .select('id, full_name, phone, email, unit_id, units (unit_number, properties (name))')
    .eq('id', residentId)
    .eq('street_id', streetId)
    .eq('is_active', true)
    .single()

  if (error || !data) return null
  return data as unknown as Resident
}

export function generatePaymentReference(): string {
  const timestamp = Date.now().toString(36)
  const random = crypto.randomBytes(6).toString('hex')
  return `RZD-${timestamp}-${random}`.toUpperCase()
}

export async function createPendingPayment(
  streetId: string,
  residentId: string,
  levyId: string,
  amount: number,
  payerEmail: string,
  payerName: string,
  payerPhone: string
): Promise<Payment> {
  const reference = generatePaymentReference()

  const { data, error } = await supabaseAdmin
    .from('payments')
    .insert({
      street_id: streetId,
      resident_id: residentId,
      levy_id: levyId,
      amount,
      payment_method: 'paystack',
      reference,
      status: 'pending',
      metadata: {
        payer_email: payerEmail,
        payer_name: payerName,
        payer_phone: payerPhone,
        created_at: new Date().toISOString()
      }
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as Payment
}

export async function getPaymentByReference(reference: string): Promise<Payment | null> {
  const { data, error } = await supabaseAdmin
    .from('payments')
    .select('*')
    .eq('reference', reference)
    .single()

  if (error || !data) return null
  return data as Payment
}

export async function updatePaymentToSuccess(
  reference: string,
  paystackReference: string,
  metadata: Record<string, unknown>
): Promise<void> {
  const payment = await getPaymentByReference(reference)
  if (!payment) return

  if (payment.status === 'success') {
    return
  }

  const { error } = await supabaseAdmin
    .from('payments')
    .update({
      status: 'success',
      paystack_reference: paystackReference,
      paid_at: new Date().toISOString(),
      metadata: {
        ...payment.metadata,
        ...metadata,
        confirmed_at: new Date().toISOString()
      }
    })
    .eq('reference', reference)
    .eq('status', 'pending')

  if (error) {
    throw new Error(error.message)
  }

  if (payment.levy_id) {
    const levy = await supabaseAdmin
      .from('levies')
      .select('is_etag_eligible')
      .eq('id', payment.levy_id)
      .single()

    if (levy.data?.is_etag_eligible) {
      await supabaseAdmin
        .from('etag_eligibility')
        .upsert({
          street_id: payment.street_id,
          resident_id: payment.resident_id,
          levy_id: payment.levy_id,
          is_eligible: true,
          evaluated_at: new Date().toISOString()
        }, {
          onConflict: 'resident_id,levy_id'
        })
    }
  }
}

export async function getPaymentWithDetails(reference: string) {
  const { data, error } = await supabaseAdmin
    .from('payments')
    .select(`
      *,
      streets (name, slug),
      residents (full_name, email, phone),
      levies (title, amount)
    `)
    .eq('reference', reference)
    .single()

  if (error || !data) return null
  return data
}