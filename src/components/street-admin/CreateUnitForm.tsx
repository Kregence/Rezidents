'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Property {
  id: string
  name: string
}

const UNIT_TYPES = ['flat', 'duplex', 'shop', 'self_contain', 'bungalow', 'other']

export function CreateUnitForm() {
  const [propertyId, setPropertyId] = useState('')
  const [unitNumber, setUnitNumber] = useState('')
  const [type, setType] = useState('flat')
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetch('/api/street-admin/properties')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProperties(data)
        }
      })
      .catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/street-admin/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId, unitNumber, type })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create unit')
      }

      setPropertyId('')
      setUnitNumber('')
      setType('flat')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium">Add Unit</h3>
      
      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Property *</label>
        <select
          value={propertyId}
          onChange={(e) => setPropertyId(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Select property</option>
          {properties.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Unit Number *</label>
        <input
          type="text"
          value={unitNumber}
          onChange={(e) => setUnitNumber(e.target.value)}
          required
          placeholder="e.g., 101, A1"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Unit Type *</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        >
          {UNIT_TYPES.map(t => (
            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1).replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Add Unit'}
      </button>
    </form>
  )
}