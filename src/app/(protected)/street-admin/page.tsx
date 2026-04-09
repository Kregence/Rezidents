import { redirect } from 'next/navigation'
import { getStreetAdminContext } from '@/lib/street-admin/context'
import { getStreetProperties, getStreetUnits, getStreetResidents, getStreetLevies, getStreetStats } from '@/lib/street-admin/actions'
import { SummaryCards } from '@/components/street-admin/SummaryCards'
import { CreatePropertyForm } from '@/components/street-admin/CreatePropertyForm'
import { PropertiesList } from '@/components/street-admin/PropertiesList'
import { CreateUnitForm } from '@/components/street-admin/CreateUnitForm'
import { UnitsList } from '@/components/street-admin/UnitsList'
import { CreateResidentForm } from '@/components/street-admin/CreateResidentForm'
import { ResidentsList } from '@/components/street-admin/ResidentsList'
import { CreateLevyForm } from '@/components/street-admin/CreateLevyForm'
import { LeviesList } from '@/components/street-admin/LeviesList'

export const dynamic = 'force-dynamic'

export default async function StreetAdminPage() {
  const ctx = await getStreetAdminContext().catch(() => {
    redirect('/unauthorized')
  })

  if (ctx.profile.role !== 'street_admin') {
    if (ctx.profile.role === 'super_admin') {
      redirect('/super-admin')
    }
    redirect('/resident')
  }

  const [properties, units, residents, levies, stats] = await Promise.all([
    getStreetProperties(ctx.streetId),
    getStreetUnits(ctx.streetId),
    getStreetResidents(ctx.streetId),
    getStreetLevies(ctx.streetId),
    getStreetStats(ctx.streetId)
  ])

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Street Admin Dashboard</h1>
          <p className="text-gray-600">{ctx.street.name}</p>
        </div>
      </div>

      <SummaryCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Add Property</h2>
          <CreatePropertyForm />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Add Unit</h2>
          <CreateUnitForm />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Register Resident</h2>
          <CreateResidentForm />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Create Levy</h2>
          <CreateLevyForm />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Properties ({properties.length})</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <PropertiesList properties={properties} />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Units ({units.length})</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <UnitsList units={units} />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Residents ({residents.length})</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <ResidentsList residents={residents} />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Levies ({levies.length})</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <LeviesList levies={levies} />
        </div>
      </div>
    </div>
  )
}