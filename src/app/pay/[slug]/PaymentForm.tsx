'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Levy {
  id: string
  title: string
  description: string | null
  amount: number
  due_date: string | null
}

interface Resident {
  id: string
  full_name: string
  phone: string | null
  email: string | null
  unit_id: string
  units?: { unit_number: string; properties?: { name: string } }
}

interface Street {
  id: string
  name: string
  slug: string
}

export function PaymentForm({ street, levies, residents }: { street: Street; levies: Levy[]; residents: Resident[] }) {
  const [residentId, setResidentId] = useState('')
  const [levyId, setLevyId] = useState('')
  const [payerName, setPayerName] = useState('')
  const [payerEmail, setPayerEmail] = useState('')
  const [payerPhone, setPayerPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const router = useRouter()

  useEffect(() => {
    if (residentId) {
      const resident = residents.find(r => r.id === residentId)
      if (resident) {
        setPayerName(resident.full_name)
        setPayerEmail(resident.email || '')
        setPayerPhone(resident.phone || '')
      }
    }
  }, [residentId, residents])

  useEffect(() => {
    if (levyId) {
      const levy = levies.find(l => l.id === levyId)
      if (levy && !selectedLevyAmount) {
        setSelectedLevyAmount(levy.amount)
      }
    }
  }, [levyId, levies])

  const [selectedLevyAmount, setSelectedLevyAmount] = useState<number | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streetId: street.id,
          residentId,
          levyId,
          payerName,
          payerEmail,
          payerPhone
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize payment')
      }

      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Select Resident *</label>
        <select
          value={residentId}
          onChange={(e) => setResidentId(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Select resident</option>
          {residents.map(r => (
            <option key={r.id} value={r.id}>
              {r.full_name} {r.units?.unit_number ? `- ${r.units.unit_number}` : ''} {r.units?.properties?.name ? `(${r.units.properties.name})` : ''}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Select Levy *</label>
        <select
          value={levyId}
          onChange={(e) => {
            setLevyId(e.target.value)
            const levy = levies.find(l => l.id === e.target.value)
            setSelectedLevyAmount(levy?.amount || null)
          }}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Select levy</option>
          {levies.map(levy => (
            <option key={levy.id} value={levy.id}>
              {levy.title} - {formatAmount(levy.amount)} {levy.due_date ? `(Due: ${new Date(levy.due_date).toLocaleDateString()})` : ''}
            </option>
          ))}
        </select>
      </div>

      {selectedLevyAmount !== null && (
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="text-lg font-medium text-gray-900">
            Amount to Pay: {formatAmount(selectedLevyAmount)}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Full Name *</label>
        <input
          type="text"
          value={payerName}
          onChange={(e) => setPayerName(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Email *</label>
        <input
          type="email"
          value={payerEmail}
          onChange={(e) => setPayerEmail(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Phone *</label>
        <input
          type="tel"
          value={payerPhone}
          onChange={(e) => setPayerPhone(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !selectedLevyAmount}
        className="w-full px-4 py-3 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 font-medium"
      >
        {loading ? 'Processing...' : 'Proceed to Payment'}
      </button>
    </form>
  )
}