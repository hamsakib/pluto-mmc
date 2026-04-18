import { connectDB } from '@/lib/mongoose'
import User from '@/models/User'
import { NextResponse } from 'next/server'

// One-time route to promote an existing user to admin by email.
// Requires ADMIN_SEED_SECRET header to prevent misuse.
// DELETE or disable this file after first use.
export async function POST(req) {
  const secret = req.headers.get('x-admin-seed-secret')
  if (!secret || secret !== process.env.ADMIN_SEED_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { email } = await req.json()
  if (!email) {
    return NextResponse.json({ error: 'email required' }, { status: 400 })
  }

  await connectDB()
  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { role: 'admin' },
    { new: true }
  ).select('name email role')

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true, user })
}
