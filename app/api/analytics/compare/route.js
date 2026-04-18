import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { checkUsageLimit, recordUsage } from '@/lib/usageCheck'
import { generateInsight } from '@/lib/anthropic'
import { connectDB } from '@/lib/mongoose'
import CreatorSearch from '@/models/CreatorSearch'
import { NextResponse } from 'next/server'

function detectPlatform(url) {
  if (url.includes('instagram.com')) return 'instagram'
  if (url.includes('tiktok.com')) return 'tiktok'
  return null
}

function computeProfileStats(profile) {
  const posts = profile.posts || []
  if (!posts.length) return null

  const avgLikes = posts.reduce((s, p) => s + (p.likes || 0), 0) / posts.length
  const avgComments = posts.reduce((s, p) => s + (p.comments || 0), 0) / posts.length
  const avgViews = posts.reduce((s, p) => s + (p.views || 0), 0) / posts.length
  const followers = profile.followerCount || 1

  const sorted = [...posts].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  let postingFrequency = null
  if (sorted.length >= 2) {
    const weeks = (new Date(sorted[sorted.length - 1].timestamp) - new Date(sorted[0].timestamp)) / (1000 * 60 * 60 * 24 * 7) || 1
    postingFrequency = parseFloat((posts.length / weeks).toFixed(2))
  }

  return {
    username: profile.username,
    displayName: profile.displayName,
    profileImage: profile.profileImage,
    platform: profile.platform,
    profileUrl: profile.profileUrl,
    followerCount: followers,
    avgViews: Math.round(avgViews),
    avgLikes: Math.round(avgLikes),
    avgComments: Math.round(avgComments),
    engagementRate: parseFloat((((avgLikes + avgComments) / followers) * 100).toFixed(2)),
    viewsToFollowerRatio: parseFloat(((avgViews / followers) * 100).toFixed(2)),
    postingFrequency,
    totalPostsAnalyzed: posts.length,
  }
}

async function scrapeProfile(url, platform) {
  const res = await fetch(`${process.env.SCRAPER_SERVICE_URL}/scrape/${platform}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.SCRAPER_API_KEY || '',
    },
    body: JSON.stringify({ url, postCount: 20 }),
    signal: AbortSignal.timeout(60000),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw { code: err.code || 'SCRAPER_ERROR', url }
  }
  return res.json()
}

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { urls } = await request.json()
  if (!Array.isArray(urls) || urls.length < 2 || urls.length > 3) {
    return NextResponse.json({ error: 'Provide 2 or 3 profile URLs.' }, { status: 400 })
  }

  const usageCheck = await checkUsageLimit(session.user.id, 'competitor_comparison')
  if (!usageCheck.allowed) {
    return NextResponse.json({ error: 'LIMIT_REACHED', plan: usageCheck.plan }, { status: 403 })
  }

  if (!process.env.SCRAPER_SERVICE_URL) {
    return NextResponse.json({ error: 'Scraper service not configured.' }, { status: 503 })
  }

  const platforms = urls.map(url => detectPlatform(url))
  const invalid = platforms.findIndex(p => !p)
  if (invalid !== -1) {
    return NextResponse.json({ error: `URL ${invalid + 1} is not a valid Instagram or TikTok link.` }, { status: 400 })
  }

  const scrapedProfiles = await Promise.allSettled(
    urls.map((url, i) => scrapeProfile(url, platforms[i]))
  )

  const results = []
  for (let i = 0; i < scrapedProfiles.length; i++) {
    const r = scrapedProfiles[i]
    if (r.status === 'rejected') {
      return NextResponse.json({
        error: `Could not analyze profile ${i + 1}: ${urls[i]}. Please check the URL and try again.`,
      }, { status: 422 })
    }
    const stats = computeProfileStats(r.value)
    if (!stats) {
      return NextResponse.json({ error: `Profile ${i + 1} has no posts to analyze.` }, { status: 422 })
    }
    results.push(stats)
  }

  const summaryPrompt = `You are a social media analyst. Compare these ${results.length} creator profiles and write 2-3 sentences of competitive insight for a marketing team making influencer decisions.

${results.map((p, i) => `Profile ${i + 1}: @${p.username}
- Followers: ${p.followerCount.toLocaleString()}
- Avg views: ${p.avgViews.toLocaleString()}
- Engagement rate: ${p.engagementRate}%
- Posts per week: ${p.postingFrequency || 'unknown'}`).join('\n\n')}

Write a concise comparison highlighting the strongest performer and why. Include specific numbers.`

  const summary = await generateInsight(summaryPrompt).catch(() => null)

  await recordUsage(session.user.id, 'competitor_comparison')

  await connectDB()
  for (const p of results) {
    await CreatorSearch.create({
      userId: session.user.id,
      platform: p.platform,
      profileUrl: p.profileUrl,
      username: p.username,
      followerCount: p.followerCount,
      avgViews: p.avgViews,
      avgLikes: p.avgLikes,
      avgComments: p.avgComments,
      engagementRate: p.engagementRate,
      searchType: 'comparison',
    })
  }

  return NextResponse.json({ profiles: results, summary })
}
