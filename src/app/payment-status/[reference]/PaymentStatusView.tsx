'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Payment {
  id: string
  reference: string
  status: string
  amount: number
  paid_at: string | null
  metadata: Record<string, unknown>
  residents?: { full_name: string }
  levies?: { title: string }
}

interface Props {
  payment: Payment
  streetName: string
}

export function PaymentStatusView({ payment: initialPayment, streetName }: Props) {
  const [payment, setPayment] = useState(initialPayment)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const refreshStatus = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/payments/${payment.reference}`)
      if (res.ok) {
        const data = await res.json()
        setPayment(data)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (payment.status === 'pending') {
      const interval = setInterval(refreshStatus, 5000)
      return () => clearInterval(interval)
    }
  }, [payment.status])

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount)
  }

  const getStatusColor = () => {
    switch (payment.status) {
      case 'success': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getStatusMessage = () => {
    switch (payment.status) {
      case 'success': return 'Payment Successful!'
      case 'failed': return 'Payment Failed'
      default: return 'Payment Pending'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-8">
      <div className="text-center mb-6">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${getStatusColor()} mb-4`}>
          {payment.status === 'success' ? (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : payment.status === 'failed' ? (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-8 h-8 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{getStatusMessage()}</h1>
        <p className="text-gray-600 mt-2">{streetName}</p>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Reference</span>
            <span className="font-medium">{payment.reference}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Amount</span>
            <span className="font-medium">{formatAmount(payment.amount)}</span>
          </div>
          {payment.paid_at && (
            <div className="flex justify-between">
              <span className="text-gray-600">Paid On</span>
              <span className="font-medium">
                {new Date(payment.paid_at).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {payment.status === 'pending' && (
        <div className="mt-6 text-center">
          <p className="text-gray-600 mb-4">
            Waiting for payment confirmation. This page will automatically update.
          </p>
          <button
            onClick={refreshStatus}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Check Now'}
          </button>
        </div>
      )}

      {payment.status === 'success' && (
        <div className="mt-6 space-y-4">
          <a
            href={`/api/receipts/${payment.reference}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Download Receipt
          </a>
          <a
            href="/"
            className="block w-full text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Back to Home
          </a>
        </div>
      )}

      {payment.status === 'failed' && (
        <div className="mt-6">
          <a
            href="/"
            className="block w-full text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Try Again
          </a>
        </div>
      )}
    </div>
  )
}