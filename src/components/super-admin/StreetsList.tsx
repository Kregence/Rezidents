'use client'

import { useState, useEffect } from 'react'

interface Street {
  id: string
  name: string
  slug: string
  created_at: string
}

interface Props {
  streets: Street[]
  refreshKey?: number
}

export function StreetsList({ streets: initialStreets, refreshKey }: Props) {
  const [streets, setStreets] = useState<Street[]>(initialStreets)

  useEffect(() => {
    if (refreshKey) {
      fetch('/api/streets')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setStreets(data)
          }
        })
    }
  }, [refreshKey])

  if (streets.length === 0) {
    return <div className="text-gray-500 p-4">No streets created yet.</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {streets.map(street => (
            <tr key={street.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{street.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{street.slug}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(street.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}