import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface ResidentPayment {
  id: string
  street_id: string
  resident_id: string
  levy_id: string
  amount: number
  payment_method: string
  reference: string
  status: 'pending' | 'success' | 'failed' | 'reversed'
  paystack_reference: string | null
  paid_at: string | null
  created_at: string
  levies?: {
    title: string
    amount: number
  }
}

export interface EligibilityRecord {
  id: string
  street_id: string
  resident_id: string
  levy_id: string
  is_eligible: boolean
  evaluated_at: string
  created_at: string
  levies?: {
    title: string
  }
}

export async function getResidentPayments(residentId: string): Promise<ResidentPayment[]> {
  const { data, error } = await supabaseAdmin
    .from('payments')
    .select(`
      *,
      levies (title, amount)
    `)
    .eq('resident_id', residentId)
    .order('created_at', { ascending: false })

  if (error) return []
  return data as ResidentPayment[]
}

export async function getResidentEligibility(residentId: string): Promise<EligibilityRecord[]> {
  const { data, error } = await supabaseAdmin
    .from('etag_eligibility')
    .select(`
      *,
      levies (title)
    `)
    .eq('resident_id', residentId)
    .order('evaluated_at', { ascending: false })

  if (error) return []
  return data as EligibilityRecord[]
}