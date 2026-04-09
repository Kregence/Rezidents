'use client'

interface Unit {
  id: string
  unit_number: string
  type: string
  properties?: { name: string }
}

interface Props {
  units: Unit[]
}

export function UnitsList({ units }: Props) {
  if (units.length === 0) {
    return <div className="text-gray-500 p-4">No units added yet.</div>
  }

  const formatType = (type: string) => type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {units.map(unit => (
            <tr key={unit.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{unit.unit_number}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatType(unit.type)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{unit.properties?.name || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}