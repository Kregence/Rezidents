import { getStreets, getStreetAdmins, getDashboardStats } from '@/lib/super-admin/actions'
import { CreateStreetForm } from '@/components/super-admin/CreateStreetForm'
import { CreateStreetAdminForm } from '@/components/super-admin/CreateStreetAdminForm'
import { StreetsList } from '@/components/super-admin/StreetsList'
import { StreetAdminsList } from '@/components/super-admin/StreetAdminsList'

export const dynamic = 'force-dynamic'

export default async function SuperAdminPage() {
  const [streets, streetAdmins, stats] = await Promise.all([
    getStreets(),
    getStreetAdmins(),
    getDashboardStats()
  ])

  return (
    <div className="p-6 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-indigo-600">{stats.totalStreets}</div>
          <div className="text-sm text-gray-600">Total Streets</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{stats.totalStreetAdmins}</div>
          <div className="text-sm text-gray-600">Street Admins</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">{stats.totalResidents}</div>
          <div className="text-sm text-gray-600">Total Residents</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Create Street</h2>
          <CreateStreetForm />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Create Street Admin</h2>
          <CreateStreetAdminForm />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">All Streets ({streets.length})</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <StreetsList streets={streets} />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Street Admins ({streetAdmins.length})</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <StreetAdminsList admins={streetAdmins} />
        </div>
      </div>
    </div>
  )
}