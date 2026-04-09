'use client'

interface Property {
  id: string
  name: string
  address_line: string | null
  created_at: string
}

interface Props {
  properties: Property[]
}

export function PropertiesList({ properties }: Props) {
  if (properties.length === 0) {
    return <div className="text-gray-500 p-4">No properties added yet.</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {properties.map(property => (
            <tr key={property.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{property.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{property.address_line || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(property.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}