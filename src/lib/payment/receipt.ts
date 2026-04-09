import { getPaymentWithDetails } from './core'

export async function generateReceiptHtml(reference: string): Promise<string | null> {
  const payment = await getPaymentWithDetails(reference)
  
  if (!payment || payment.status !== 'success') {
    return null
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

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Receipt - ${reference}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
    .receipt-number { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
    .street-name { font-size: 18px; color: #555; }
    .details { margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
    .detail-label { font-weight: bold; color: #555; }
    .detail-value { color: #333; }
    .total { font-size: 20px; font-weight: bold; margin-top: 20px; text-align: right; }
    .footer { text-align: center; margin-top: 40px; color: #777; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="receipt-number">Receipt #${reference}</div>
    <div class="street-name">${street?.name || 'Rezidents'}</div>
  </div>
  <div class="details">
    <div class="detail-row">
      <span class="detail-label">Resident Name</span>
      <span class="detail-value">${resident?.full_name || 'N/A'}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Email</span>
      <span class="detail-value">${resident?.email || 'N/A'}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Phone</span>
      <span class="detail-value">${resident?.phone || 'N/A'}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Payment For</span>
      <span class="detail-value">${levy?.title || 'N/A'}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Payment Method</span>
      <span class="detail-value">${payment.payment_method || 'Paystack'}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Payment Date</span>
      <span class="detail-value">${paidAt}</span>
    </div>
    <div class="total">
      <div>Amount Paid: ${amountPaid}</div>
    </div>
  </div>
  <div class="footer">
    <p>This is an official receipt for the payment made.</p>
    <p>Generated on ${new Date().toLocaleDateString()}</p>
  </div>
</body>
</html>
  `.trim()
}