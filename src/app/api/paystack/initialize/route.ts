import { NextRequest, NextResponse } from 'next/server'
import { getStreetBySlug, getLevyById, getResidentById, createPendingPayment } from '@/lib/payment/core'
import { initializePaystackTransaction } from '@/lib/payment/paystack'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { streetSlug, residentId, levyId, payerName, payerEmail, payerPhone } = body

    if (!streetSlug || !residentId || !levyId || !payerName || !payerEmail || !payerPhone) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const street = await getStreetBySlug(streetSlug)
    if (!street) {
      return NextResponse.json({ error: 'Street not found' }, { status: 404 })
    }

    const levy = await getLevyById(levyId, street.id)
    if (!levy) {
      return NextResponse.json({ error: 'Levy not found or inactive' }, { status: 404 })
    }

    const resident = await getResidentById(residentId, street.id)
    if (!resident) {
      return NextResponse.json({ error: 'Resident not found or inactive' }, { status: 404 })
    }

    const payment = await createPendingPayment(
      street.id,
      residentId,
      levyId,
      levy.amount,
      payerEmail,
      payerName,
      payerPhone
    )

    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payment-status/${payment.reference}`

    const { authorizationUrl } = await initializePaystackTransaction(
      payerEmail,
      levy.amount,
      payment.reference,
      callbackUrl,
      {
        street_id: street.id,
        street_name: street.name,
        resident_id: residentId,
        levy_id: levyId,
        levy_title: levy.title
      }
    )

    return NextResponse.json({ authorizationUrl, reference: payment.reference })
  } catch (error) {
    console.error('Payment initialization error:', error)
    return NextResponse.json({ error: 'Failed to initialize payment' }, { status: 500 })
  }
}