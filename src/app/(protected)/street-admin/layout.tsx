import { requireRole, signOut } from '@/lib/auth'
import { getStreetAdminContext } from '@/lib/street-admin/context'

export default async function StreetAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await requireRole(['street_admin'])
  const ctx = await getStreetAdminContext().catch(() => ({ street: { name: '' } }))
  
  async function handleSignOut() {
    'use server'
    await signOut()
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Street Admin</h1>
            <p className="text-sm text-gray-600">{ctx.street?.name || 'Loading...'}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{profile.full_name}</span>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Street Admin</span>
            <form action={handleSignOut}>
              <button
                type="submit"
                className="text-sm text-red-600 hover:text-red-800"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}