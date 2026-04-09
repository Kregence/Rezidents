import { requireRole, signOut } from '@/lib/auth'

export default async function ResidentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await requireRole(['resident'])
  
  async function handleSignOut() {
    'use server'
    await signOut()
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Resident</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{profile.full_name}</span>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Resident</span>
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