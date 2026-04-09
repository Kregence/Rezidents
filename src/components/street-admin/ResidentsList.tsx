'use client'

interface Resident {
  id: string
  full_name: string
  phone: string | null
  email: string | null
  resident_type: string
  is_active: boolean
  units?: { unit_number: string; properties?: { name: string } }
}

interface Props {
  residents: Resident[]
}

export function ResidentsList({ residents }: Props) {
  if (residents.length === 0) {
    return <div className="text-gray-500 p-4">No residents registered yet.</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {residents.map(resident => (
            <tr key={resident.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{resident.full_name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className={`px-2 py-1 text-xs rounded ${resident.resident_type === 'landlord' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                  {resident.resident_type}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{resident.phone || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{resident.email || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {resident.units?.unit_number} - {resident.units?.properties?.name || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`px-2 py-1 text-xs rounded ${resident.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {resident.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}