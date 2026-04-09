import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function createStreet(name: string, slug: string) {
  const { data, error } = await supabaseAdmin
    .from('streets')
    .insert({ name, slug })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      throw new Error('A street with this slug already exists')
    }
    throw new Error(error.message)
  }

  revalidatePath('/super-admin')
  return data
}

export async function createStreetAdmin(
  fullName: string,
  email: string,
  password: string,
  streetId: string
) {
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName }
  })

  if (authError) {
    if (authError.message.includes('already been registered')) {
      throw new Error('A user with this email already exists')
    }
    throw new Error(authError.message)
  }

  if (!authData.user) {
    throw new Error('Failed to create user')
  }

  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: authData.user.id,
      full_name: fullName,
      email,
      role: 'street_admin',
      street_id: streetId
    })

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
    throw new Error(profileError.message)
  }

  revalidatePath('/super-admin')
  return { id: authData.user.id, email }
}

export async function getStreets() {
  const { data, error } = await supabaseAdmin
    .from('streets')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function getStreetAdmins() {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select(`
      *,
      streets:name (name)
    `)
    .eq('role', 'street_admin')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function getDashboardStats() {
  const [streetsRes, adminsRes, residentsRes] = await Promise.all([
    supabaseAdmin.from('streets').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'street_admin'),
    supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'resident')
  ])

  return {
    totalStreets: streetsRes.count || 0,
    totalStreetAdmins: adminsRes.count || 0,
    totalResidents: residentsRes.count || 0
  }
}