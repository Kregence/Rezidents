'use client'

import { useState, useEffect } from 'react'

interface StreetAdmin {
  id: string
  full_name: string
  email: string
  street_id: string
  streets?: { name: string }[]
}

interface Props {
  admins: StreetAdmin[]
  refreshKey?: number
}

export function StreetAdminsList({ admins: initialAdmins, refreshKey }: Props) {
  const [admins, setAdmins] = useState<StreetAdmin[]>(initialAdmins)

  useEffect(() => {
    if (refreshKey) {
      fetch('/api/street-admins')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setAdmins(data)
          }
        })
    }
  }, [refreshKey])

  if (admins.length === 0) {
    return <div className="text-gray-500 p-4">No street admins created yet.</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Street</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {admins.map(admin => (
            <tr key={admin.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{admin.full_name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{admin.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {admin.streets?.[0]?.name || 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}