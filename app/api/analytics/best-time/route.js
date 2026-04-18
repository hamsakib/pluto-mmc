import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { checkUsageLimit, recordUsage } from '@/lib/usageCheck'
import { generateInsight } from '@/lib/anthropic'
import { connectDB } from '@/lib/mongoose'
import CreatorSearch from '@/models/CreatorSearch'
import { NextResponse } from 'next/server'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function buildHeatmap(posts) {
  // heatmap[day][hour] = { totalEngagement, count }
  const heatmap = {}
  for (const day of DAYS) {
    heatmap[day] = {}
    for (let h = 0; h < 24; h++) heatmap[day][h] = { total: 0, count: 0 }
  }

  for (const post of posts) {
    if (!post.timestamp) continue
    const date = new Date(post.timestamp)
    const day = DAYS[date.getUTCDay()]
    const hour = date.getUTCHours()
    const engagement = (post.likes || 0) + (post.comments || 0)
    heatmap[day][hour].total += engagement
    heatmap[day][hour].count += 1
  }

  // Convert to averages
  const result = {}
  for (const day of DAYS) {
    result[day] = {}
    for (let h = 0; h < 24; h++) {
      const slot = heatmap[day][h]
      result[day][h] = slot.count > 0 ? Math.round(slot.total / slot.count) : 0
    }
  }
  return result
}

function getTopSlots(heatmap, n = 3) {
  const slots = []
  for (const day of DAYS) {
    for (let h = 0; h < 24; h++) {
      slots.push({ day, hour: h, engagement: heatmap[day][h] })
    }
  }
  return slots.sort((a, b) => b.engagement - a.engagement).slice(0, n)
}

function getWorstSlots(heatmap, n = 3) {
  const slots = []
  for (const day of DAYS) {
    for (let h = 0; h < 24; h++) {
      if (heatmap[day][h] > 0) {
        slots.push({ day, hour: h, engagement: heatmap[day][h] })
      }
    }
  }
  return slots.sort((a, b) => a.engagement - b.engagement).slice(0, n)
}

function getBestDay(heatmap) {
  const dayTotals = DAYS.map(day => ({
    day,
    avg: Object.values(heatmap[day]).reduce((s, v) => s + v, 0) / 24,
  }))
  return dayTotals.sort((a, b) => b.avg - a.avg)[0]
}

function detectPlatform(url) {
  if (url.includes('instagram.com')) return 'instagram'
  if (url.includes('tiktok.com')) return 'tiktok'
  return null
}

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { url } = await request.json()
  if (!url) return NextResponse.json({ error: 'Profile URL is required' }, { status: 400 })

  const platform = detectPlatform(url)
  if (!platform) {
    return NextResponse.json({ error: 'Invalid URL. Paste an Instagram or TikTok profile URL.' }, { status: 400 })
  }

  const usageCheck = await checkUsageLimit(session.user.id, 'best_time')
  if (!usageCheck.allowed) {
    return NextResponse.json({ error: 'LIMIT_REACHED', plan: usageCheck.plan }, { status: 403 })
  }

  if (!process.env.SCRAPER_SERVICE_URL) {
    return NextResponse.json({ error: 'Scraper service not configured.' }, { status: 503 })
  }

  let scraperData
  try {
    const res = await fetch(`${process.env.SCRAPER_SERVICE_URL}/scrape/${platform}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.SCRAPER_API_KEY || '',
      },
      body: JSON.stringify({ url, postCount: 50 }),
      signal: AbortSignal.timeout(90000),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return NextResponse.json({ error: err.message || 'Scraper error.' }, { status: res.status })
    }
    scraperData = await res.json()
  } catch {
    return NextResponse.json({ error: 'Could not reach scraper service.' }, { status: 503 })
  }

  const posts = scraperData.posts || []
  if (!posts.length) {
    return NextResponse.json({ error: 'No posts found to analyze.' }, { status: 422 })
  }

  const heatmap = buildHeatmap(posts)
  const topSlots = getTopSlots(heatmap)
  const worstSlots = getWorstSlots(heatmap)
  const bestDay = getBestDay(heatmap)

  const insightPrompt = `You are a social media analyst. Analyze this posting time data and write 2-3 sentences of insight.

Profile: @${scraperData.username} on ${platform}
Best posting day: ${bestDay.day}
Top 3 time slots: ${topSlots.map(s => `${s.day} at ${s.hour}:00 UTC (avg ${s.engagement} engagement)`).join(', ')}
Worst time slots: ${worstSlots.map(s => `${s.day} at ${s.hour}:00`).join(', ')}

Note: timestamps are in UTC. Write insight about why certain times likely perform better based on the audience patterns. Be specific and practical.`

  const insight = await generateInsight(insightPrompt).catch(() => null)

  await recordUsage(session.user.id, 'best_time')

  await connectDB()
  await CreatorSearch.create({
    userId: session.user.id,
    platform,
    profileUrl: url,
    username: scraperData.username,
    followerCount: scraperData.followerCount,
    rawPostsJson: posts,
    searchType: 'besttime',
    totalPostsAnalyzed: posts.length,
  })

  return NextResponse.json({
    username: scraperData.username,
    platform,
    heatmap,
    topSlots,
    worstSlots,
    bestDay,
    totalPostsAnalyzed: posts.length,
    insight,
  })
}
