import { connectDB } from '@/lib/mongoose'
import Subscription from '@/models/Subscription'
import User from '@/models/User'
import { redirect } from 'next/navigation'

// SSLCommerz POSTs form data here after successful payment
export async function POST(request) {
  const formData = await request.formData()
  const valId = formData.get('val_id')
  const tranId = formData.get('tran_id')
  const status = formData.get('status')
  const userId = formData.get('value_a')
  const planId = formData.get('value_b')
  const amount = parseFloat(formData.get('amount') || 0)

  if (!valId || status !== 'VALID') {
    redirect('/pricing?payment=failed')
  }

  try {
    const SSLCommerzPayment = (await import('sslcommerz-lts')).default
    const sslcz = new SSLCommerzPayment(
      process.env.SSLCOMMERZ_STORE_ID,
      process.env.SSLCOMMERZ_STORE_PASSWORD,
      process.env.NODE_ENV === 'production'
    )

    const validation = await sslcz.validate({ val_id: valId })
    if (validation.status !== 'VALID' && validation.status !== 'VALIDATED') {
      redirect('/pricing?payment=failed')
    }

    await connectDB()

    const validUntil = new Date()
    validUntil.setMonth(validUntil.getMonth() + 1)

    await Subscription.create({
      userId,
      plan: planId,
      status: 'active',
      sslTransactionId: tranId,
      sslValId: valId,
      amountPaid: amount,
      validUntil,
    })

    await User.findByIdAndUpdate(userId, { plan: planId })
  } catch {
    redirect('/pricing?payment=error')
  }

  redirect('/dashboard?payment=success')
}
