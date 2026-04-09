import { notFound } from 'next/navigation'
import { getPaymentByReference, getStreetBySlug } from '@/lib/payment/core'
import { PaymentStatusView } from './PaymentStatusView'

interface Props {
  params: Promise<{ reference: string }>
}

export default async function PaymentStatusPage({ params }: Props) {
  const { reference } = await params
  const payment = await getPaymentByReference(reference)

  if (!payment) {
    return notFound()
  }

  const street = await getStreetBySlug(payment.street_id)

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <PaymentStatusView payment={payment} streetName={street?.name || 'Unknown Street'} />
      </div>
    </div>
  )
}