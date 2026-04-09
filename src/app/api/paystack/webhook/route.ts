import { NextRequest, NextResponse } from 'next/server'
import { verifyPaystackSignature, parsePaystackWebhook } from '@/lib/payment/paystack'
import { updatePaymentToSuccess, getPaymentByReference } from '@/lib/payment/core'

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-paystack-signature')
    const body = await request.text()

    if (!signature || !verifyPaystackSignature(body, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = parsePaystackWebhook(body)
    if (!event) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    if (event.event === 'charge.success') {
      const reference = event.data.reference
      const payment = await getPaymentByReference(reference)

      if (payment && payment.status === 'pending') {
        await updatePaymentToSuccess(
          reference,
          event.data.reference,
          {
            event_type: event.event,
            paystack_customer_email: event.data.customer?.email,
            confirmed_via_webhook: true
          }
        )
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}