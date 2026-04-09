'use client'

interface ResidentRecord {
  full_name: string
  phone: string | null
  email: string | null
  resident_type: string
  move_in_date: string | null
  is_active: boolean
  units?: {
    unit_number: string
    properties?: {
      name: string
    }
  }
}

interface Street {
  name: string
}

interface Props {
  resident: ResidentRecord
  street: Street | null
}

export function ProfileSummary({ resident, street }: Props) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Profile Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-500">Full Name</label>
          <p className="text-gray-900">{resident.full_name}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500">Phone</label>
          <p className="text-gray-900">{resident.phone || '-'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500">Email</label>
          <p className="text-gray-900">{resident.email || '-'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500">Resident Type</label>
          <p className="text-gray-900 capitalize">{resident.resident_type}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500">Unit</label>
          <p className="text-gray-900">{resident.units?.unit_number || '-'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500">Property</label>
          <p className="text-gray-900">{resident.units?.properties?.name || '-'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500">Street</label>
          <p className="text-gray-900">{street?.name || '-'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500">Move-in Date</label>
          <p className="text-gray-900">
            {resident.move_in_date ? new Date(resident.move_in_date).toLocaleDateString() : '-'}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500">Status</label>
          <p className="text-gray-900">
            <span className={`px-2 py-1 text-xs rounded ${resident.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {resident.is_active ? 'Active' : 'Inactive'}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}