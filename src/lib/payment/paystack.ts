import crypto from 'crypto'

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!

export interface PaystackInitializeResponse {
  status: boolean
  message: string
  data: {
    authorization_url: string
    reference: string
    access_code: string
  }
}

export async function initializePaystackTransaction(
  email: string,
  amount: number,
  reference: string,
  callbackUrl: string,
  metadata?: Record<string, unknown>
): Promise<{ authorizationUrl: string }> {
  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PAYSTACK_SECRET}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      amount: amount * 100,
      reference,
      callback_url: callbackUrl,
      metadata: metadata || {}
    })
  })

  const data: PaystackInitializeResponse = await response.json()

  if (!data.status) {
    throw new Error(data.message || 'Failed to initialize payment')
  }

  return { authorizationUrl: data.data.authorization_url }
}

export function verifyPaystackSignature(payload: string, signature: string): boolean {
  const secret = process.env.PAYSTACK_WEBHOOK_SECRET!
  const hash = crypto.createHmac('sha512', secret).update(payload).digest('hex')
  return hash === signature
}

export interface PaystackWebhookEvent {
  event: string
  data: {
    reference: string
    status: string
    amount: number
    currency: string
    transaction_metadata: Record<string, unknown>
    customer: {
      email: string
    }
  }
}

export function parsePaystackWebhook(body: string): PaystackWebhookEvent | null {
  try {
    return JSON.parse(body) as PaystackWebhookEvent
  } catch {
    return null
  }
}