import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongoose'
import User from '@/models/User'
import { SUBSCRIPTION_PLANS } from '@/app/api/subscription/plans/route'
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { planId } = await request.json()
  const plan = SUBSCRIPTION_PLANS[planId]
  if (!plan) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

  await connectDB()
  const user = await User.findById(session.user.id)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const tranId = `pluto_${planId}_${uuidv4().split('-')[0]}_${Date.now()}`
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  const SSLCommerzPayment = (await import('sslcommerz-lts')).default
  const sslcz = new SSLCommerzPayment(
    process.env.SSLCOMMERZ_STORE_ID,
    process.env.SSLCOMMERZ_STORE_PASSWORD,
    process.env.NODE_ENV === 'production'
  )

  const data = {
    total_amount: plan.price,
    currency: plan.currency,
    tran_id: tranId,
    success_url: `${baseUrl}/api/payment/sslcommerz/success`,
    fail_url: `${baseUrl}/api/payment/sslcommerz/fail`,
    cancel_url: `${baseUrl}/api/payment/sslcommerz/cancel`,
    ipn_url: `${baseUrl}/api/payment/sslcommerz/ipn`,
    shipping_method: 'NO',
    product_name: `Pluto ${plan.name} Plan`,
    product_category: 'Digital Services',
    product_profile: 'digital-goods',
    cus_name: user.name,
    cus_email: user.email,
    cus_add1: 'Bangladesh',
    cus_city: 'Dhaka',
    cus_country: 'Bangladesh',
    cus_phone: '01700000000',
    value_a: session.user.id,  // store userId for callback
    value_b: planId,
  }

  const apiResponse = await sslcz.init(data)

  if (!apiResponse?.GatewayPageURL) {
    return NextResponse.json({ error: 'Payment gateway error. Try again.' }, { status: 500 })
  }

  return NextResponse.json({ url: apiResponse.GatewayPageURL, tranId })
}
