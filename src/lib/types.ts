export type AppRole = 'super_admin' | 'street_admin' | 'resident'

export interface Profile {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  role: AppRole
  street_id: string | null
  created_at: string
  updated_at: string
}

export interface Street {
  id: string
  name: string
  slug: string
  logo_url: string | null
  created_at: string
  updated_at: string
}

export interface UserWithRole extends Profile {
  street?: Street | null
}