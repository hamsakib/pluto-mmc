import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongoose'
import CreatorSearch from '@/models/CreatorSearch'
import RoiCalculation from '@/models/RoiCalculation'
import { NextResponse } from 'next/server'

const SEARCH_TYPE_MAP = {
  creator: 'single',
  compare: 'comparison',
  'best-time': 'besttime',
  'fraud-check': 'fraud',
}

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const tool = params.tool
  await connectDB()

  if (tool === 'roi-calculator') {
    const history = await RoiCalculation.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('-rawPostsJson')
    return NextResponse.json(history)
  }

  const searchType = SEARCH_TYPE_MAP[tool]
  if (!searchType) return NextResponse.json({ error: 'Unknown tool' }, { status: 400 })

  const history = await CreatorSearch.find({ userId: session.user.id, searchType })
    .sort({ createdAt: -1 })
    .limit(20)
    .select('-rawPostsJson')

  return NextResponse.json(history)
}
