import { notFound } from 'next/navigation'
import { getStreetBySlug, getActiveLevies, getResidentsByStreet } from '@/lib/payment/core'
import { PaymentForm } from './PaymentForm'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function PaymentPage({ params }: Props) {
  const { slug } = await params
  const street = await getStreetBySlug(slug)

  if (!street) {
    return notFound()
  }

  const [levies, residents] = await Promise.all([
    getActiveLevies(street.id),
    getResidentsByStreet(street.id)
  ])

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Make a Payment</h1>
          <p className="text-xl text-gray-600 mt-2">{street.name}</p>
        </div>

        {levies.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600">No active payment options available for this street.</p>
          </div>
        ) : residents.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600">No registered residents found for this street.</p>
          </div>
        ) : (
          <PaymentForm street={street} levies={levies} residents={residents} />
        )}
      </div>
    </div>
  )
}