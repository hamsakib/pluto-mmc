import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongoose'
import Subscription from '@/models/Subscription'
import User from '@/models/User'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const user = await User.findById(session.user.id).select('plan')
  const activeSub = await Subscription.findOne({
    userId: session.user.id,
    status: 'active',
    validUntil: { $gte: new Date() },
  }).sort({ validUntil: -1 })

  return NextResponse.json({
    plan: user?.plan || 'free',
    subscription: activeSub
      ? {
          plan: activeSub.plan,
          validUntil: activeSub.validUntil,
          status: activeSub.status,
        }
      : null,
  })
}
