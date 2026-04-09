export function SummaryCards({ stats }: { stats: { totalProperties: number; totalUnits: number; totalResidents: number; totalActiveLevies: number } }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="text-2xl font-bold text-indigo-600">{stats.totalProperties}</div>
        <div className="text-sm text-gray-600">Properties</div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="text-2xl font-bold text-blue-600">{stats.totalUnits}</div>
        <div className="text-sm text-gray-600">Units</div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="text-2xl font-bold text-green-600">{stats.totalResidents}</div>
        <div className="text-sm text-gray-600">Residents</div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="text-2xl font-bold text-orange-600">{stats.totalActiveLevies}</div>
        <div className="text-sm text-gray-600">Active Levies</div>
      </div>
    </div>
  )
}