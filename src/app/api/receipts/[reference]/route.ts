import { NextRequest, NextResponse } from 'next/server'
import { getPaymentByReference } from '@/lib/payment/core'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  try {
    const { reference } = await params
    const payment = await getPaymentByReference(reference)

    if (!payment || payment.status !== 'success') {
      return NextResponse.json({ error: 'Receipt not available' }, { status: 404 })
    }

    return NextResponse.redirect(new URL(`/receipt/${reference}`, request.url))
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}