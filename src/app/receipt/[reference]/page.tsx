import { notFound } from 'next/navigation'
import { getPaymentWithDetails } from '@/lib/payment/core'

interface Props {
  params: Promise<{ reference: string }>
}

export default async function ReceiptPage({ params }: Props) {
  const { reference } = await params
  const payment = await getPaymentWithDetails(reference)

  if (!payment || payment.status !== 'success') {
    return notFound()
  }

  const street = payment.streets as { name: string } | null
  const resident = payment.residents as { full_name: string; email: string; phone: string } | null
  const levy = payment.levies as { title: string; amount: number } | null

  const paidAt = payment.paid_at ? new Date(payment.paid_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : 'N/A'

  const amountPaid = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN'
  }).format(payment.amount)

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white border-2 border-gray-200 rounded-lg p-8">
        <div className="text-center border-b-2 border-gray-300 pb-6 mb-6">
          <h1 className="text-2xl font-bold">RECEIPT</h1>
          <p className="text-xl text-gray-600 mt-2">{street?.name || 'Rezidents'}</p>
          <p className="text-lg font-semibold mt-2">#{reference}</p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="font-bold text-gray-600">Resident Name</span>
            <span className="font-medium">{resident?.full_name || 'N/A'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="font-bold text-gray-600">Email</span>
            <span className="font-medium">{resident?.email || 'N/A'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="font-bold text-gray-600">Phone</span>
            <span className="font-medium">{resident?.phone || 'N/A'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="font-bold text-gray-600">Payment For</span>
            <span className="font-medium">{levy?.title || 'N/A'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="font-bold text-gray-600">Payment Method</span>
            <span className="font-medium">{payment.payment_method || 'Paystack'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="font-bold text-gray-600">Payment Date</span>
            <span className="font-medium">{paidAt}</span>
          </div>
          <div className="flex justify-between py-4">
            <span className="text-xl font-bold">Amount Paid</span>
            <span className="text-xl font-bold text-green-600">{amountPaid}</span>
          </div>
        </div>

        <div className="text-center mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500">
          <p>This is an official receipt for the payment made.</p>
          <p className="mt-2">Generated on {new Date().toLocaleDateString()}</p>
        </div>

        <div className="mt-8 flex justify-center gap-4 no-print">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Print / Save as PDF
          </button>
          <a
            href="/"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}