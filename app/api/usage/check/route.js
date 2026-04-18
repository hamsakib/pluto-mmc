import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUsageSummary, checkUsageLimit } from '@/lib/usageCheck'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const tool = searchParams.get('tool')

  if (tool) {
    const result = await checkUsageLimit(session.user.id, tool)
    return NextResponse.json(result)
  }

  const summary = await getUsageSummary(session.user.id)
  return NextResponse.json(summary)
}
