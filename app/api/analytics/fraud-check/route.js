import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { checkUsageLimit, recordUsage } from '@/lib/usageCheck'
import { generateInsight } from '@/lib/anthropic'
import { connectDB } from '@/lib/mongoose'
import CreatorSearch from '@/models/CreatorSearch'
import { NextResponse } from 'next/server'

function stdDev(values) {
  if (!values.length) return 0
  const mean = values.reduce((s, v) => s + v, 0) / values.length
  const variance = values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / values.length
  return Math.sqrt(variance)
}

function runFraudDetection(profile) {
  const posts = profile.posts || []
  const followers = profile.followerCount || 1
  const flags = []
  const passes = []
  let score = 0

  const avgLikes = posts.reduce((s, p) => s + (p.likes || 0), 0) / (posts.length || 1)
  const avgComments = posts.reduce((s, p) => s + (p.comments || 0), 0) / (posts.length || 1)
  const avgViews = posts.reduce((s, p) => s + (p.views || 0), 0) / (posts.length || 1)
  const engagementRate = ((avgLikes + avgComments) / followers) * 100
  const viewsToFollowerRatio = (avgViews / followers) * 100

  // Signal 1: Engagement rate below 1% for under 100k
  if (followers < 100000 && engagementRate < 1) {
    flags.push({ signal: 'Low engagement for account size', detail: `${engagementRate.toFixed(2)}% engagement (expected 2%+ for under 100k accounts)`, weight: 20 })
    score += 20
  } else {
    passes.push({ signal: 'Engagement rate', detail: `${engagementRate.toFixed(2)}% — within normal range for this follower count` })
  }

  // Signal 2: Engagement rate below 0.3% for any account
  if (engagementRate < 0.3) {
    flags.push({ signal: 'Very low engagement', detail: `${engagementRate.toFixed(2)}% engagement is extremely low for any account size`, weight: 25 })
    score += 25
  }

  // Signal 3: Views to follower ratio below 5%
  if (avgViews > 0 && viewsToFollowerRatio < 5) {
    flags.push({ signal: 'Low views to follower ratio', detail: `Only ${viewsToFollowerRatio.toFixed(1)}% of followers see posts (expected 10%+)`, weight: 15 })
    score += 15
  } else if (avgViews > 0) {
    passes.push({ signal: 'Views to follower ratio', detail: `${viewsToFollowerRatio.toFixed(1)}% — healthy reach` })
  }

  // Signal 4: Like to comment ratio extremely skewed
  const likeCommentRatio = avgComments > 0 ? avgLikes / avgComments : null
  if (likeCommentRatio && likeCommentRatio > 200) {
    flags.push({ signal: 'Suspicious like/comment ratio', detail: `${Math.round(likeCommentRatio)}:1 likes to comments ratio (normal is 10–50:1)`, weight: 20 })
    score += 20
  } else {
    passes.push({ signal: 'Like to comment ratio', detail: likeCommentRatio ? `${Math.round(likeCommentRatio)}:1 — looks natural` : 'No comment data available' })
  }

  // Signal 5: Suspiciously uniform engagement across all posts
  const engagementValues = posts.map(p => (p.likes || 0) + (p.comments || 0))
  const engMean = engagementValues.reduce((s, v) => s + v, 0) / (engagementValues.length || 1)
  const engStd = stdDev(engagementValues)
  const coefficientOfVariation = engMean > 0 ? engStd / engMean : 0
  if (coefficientOfVariation < 0.2 && posts.length >= 5) {
    flags.push({ signal: 'Unnaturally consistent engagement', detail: `Posts vary by only ${(coefficientOfVariation * 100).toFixed(0)}% — real accounts typically vary 50%+`, weight: 15 })
    score += 15
  } else {
    passes.push({ signal: 'Engagement variation', detail: `${(coefficientOfVariation * 100).toFixed(0)}% variance — looks organic` })
  }

  // Clamp score 0–100
  score = Math.min(100, score)

  let riskLevel, riskColor
  if (score <= 25) { riskLevel = 'Low Risk'; riskColor = 'green' }
  else if (score <= 50) { riskLevel = 'Moderate Risk'; riskColor = 'yellow' }
  else if (score <= 75) { riskLevel = 'High Risk'; riskColor = 'orange' }
  else { riskLevel = 'Very High Risk'; riskColor = 'red' }

  // Estimated real engaged audience (conservative: use engagement count as proxy)
  const engagedAudienceEstimate = Math.round(followers * (engagementRate / 100) * 10)

  return {
    score,
    riskLevel,
    riskColor,
    flags,
    passes,
    engagementRate: parseFloat(engagementRate.toFixed(2)),
    avgLikes: Math.round(avgLikes),
    avgComments: Math.round(avgComments),
    avgViews: Math.round(avgViews),
    followerCount: followers,
    engagedAudienceEstimate,
    totalPostsAnalyzed: posts.length,
  }
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

  const usageCheck = await checkUsageLimit(session.user.id, 'fraud_detector')
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
      body: JSON.stringify({ url, postCount: 30 }),
      signal: AbortSignal.timeout(60000),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return NextResponse.json({ error: err.message || 'Scraper error.' }, { status: res.status })
    }
    scraperData = await res.json()
  } catch {
    return NextResponse.json({ error: 'Could not reach scraper service.' }, { status: 503 })
  }

  const report = runFraudDetection(scraperData)

  const verdictPrompt = `You are a fraud analyst at a marketing agency. Write a 2-3 sentence professional verdict for this influencer's authenticity report.

Profile: @${scraperData.username} on ${platform}
Followers: ${report.followerCount.toLocaleString()}
Fraud risk score: ${report.score}/100 (${report.riskLevel})
Engagement rate: ${report.engagementRate}%
Flags triggered: ${report.flags.map(f => f.signal).join(', ') || 'None'}
Healthy signals: ${report.passes.map(p => p.signal).join(', ')}

Write a direct, data-driven verdict that helps an agency decide whether to recommend this creator to a brand. Include a recommendation on how to negotiate if they do proceed.`

  const verdict = await generateInsight(verdictPrompt).catch(() => null)

  await recordUsage(session.user.id, 'fraud_detector')

  await connectDB()
  await CreatorSearch.create({
    userId: session.user.id,
    platform,
    profileUrl: url,
    username: scraperData.username,
    followerCount: scraperData.followerCount,
    engagementRate: report.engagementRate,
    rawPostsJson: scraperData.posts,
    searchType: 'fraud',
    totalPostsAnalyzed: report.totalPostsAnalyzed,
  })

  return NextResponse.json({
    ...report,
    username: scraperData.username,
    displayName: scraperData.displayName,
    platform,
    profileUrl: url,
    verdict,
    disclaimer: 'This is an estimate based on public data patterns. Use as a guide, not a guarantee.',
  })
}
