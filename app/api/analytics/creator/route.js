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

function computeAnalytics(profile) {
  const posts = profile.posts || []
  if (!posts.length) return null

  const totalLikes = posts.reduce((s, p) => s + (p.likes || 0), 0)
  const totalComments = posts.reduce((s, p) => s + (p.comments || 0), 0)
  const totalViews = posts.reduce((s, p) => s + (p.views || 0), 0)

  const avgLikes = totalLikes / posts.length
  const avgComments = totalComments / posts.length
  const avgViews = totalViews / posts.length
  const followers = profile.followerCount || 1

  const engagementRate = ((avgLikes + avgComments) / followers) * 100
  const viewsToFollowerRatio = (avgViews / followers) * 100

  // Posting frequency: posts per week based on date range
  const sorted = [...posts].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  let postingFrequency = null
  if (sorted.length >= 2) {
    const firstDate = new Date(sorted[0].timestamp)
    const lastDate = new Date(sorted[sorted.length - 1].timestamp)
    const weeks = (lastDate - firstDate) / (1000 * 60 * 60 * 24 * 7) || 1
    postingFrequency = posts.length / weeks
  }

  const byEngagement = [...posts].sort(
    (a, b) => (b.likes + b.comments) - (a.likes + a.comments)
  )

  return {
    followerCount: followers,
    avgViews: Math.round(avgViews),
    avgLikes: Math.round(avgLikes),
    avgComments: Math.round(avgComments),
    engagementRate: parseFloat(engagementRate.toFixed(2)),
    viewsToFollowerRatio: parseFloat(viewsToFollowerRatio.toFixed(2)),
    postingFrequency: postingFrequency ? parseFloat(postingFrequency.toFixed(2)) : null,
    totalPostsAnalyzed: posts.length,
    bestPost: byEngagement[0] || null,
    worstPost: byEngagement[byEngagement.length - 1] || null,
    username: profile.username,
    displayName: profile.displayName,
    profileImage: profile.profileImage,
    bio: profile.bio,
    platform: profile.platform,
    profileUrl: profile.profileUrl,
  }
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

  const usageCheck = await checkUsageLimit(session.user.id, 'creator_analyzer')
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
      body: JSON.stringify({ url, postCount: 20 }),
      signal: AbortSignal.timeout(60000),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      if (err.code === 'PRIVATE_ACCOUNT') {
        return NextResponse.json({ error: 'This account is private. We can only analyze public profiles.' }, { status: 422 })
      }
      if (err.code === 'NOT_FOUND') {
        return NextResponse.json({ error: 'Profile not found. Check the URL and try again.' }, { status: 404 })
      }
      if (err.code === 'BOT_BLOCKED') {
        return NextResponse.json({ error: 'Instagram/TikTok is temporarily limiting our requests. Please try again in 10 minutes.' }, { status: 429 })
      }
      if (err.code === 'NO_POSTS') {
        return NextResponse.json({ error: 'This account has no public posts to analyze.' }, { status: 422 })
      }
      return NextResponse.json({ error: 'Scraper error. Please try again.' }, { status: 500 })
    }

    scraperData = await res.json()
  } catch {
    return NextResponse.json({ error: 'Could not reach scraper service. Please try again.' }, { status: 503 })
  }

  const analytics = computeAnalytics(scraperData)
  if (!analytics) {
    return NextResponse.json({ error: 'No posts found to analyze.' }, { status: 422 })
  }

  const insightPrompt = `You are a social media analyst for Pluto, a marketing platform. Analyze this creator's profile and write 2-3 sentences of insight for a marketing team.

Profile: @${analytics.username} on ${analytics.platform}
Followers: ${analytics.followerCount.toLocaleString()}
Average views: ${analytics.avgViews.toLocaleString()}
Average likes: ${analytics.avgLikes.toLocaleString()}
Average comments: ${analytics.avgComments.toLocaleString()}
Engagement rate: ${analytics.engagementRate}%
Views to follower ratio: ${analytics.viewsToFollowerRatio}%
Posts per week: ${analytics.postingFrequency || 'unknown'}
Posts analyzed: ${analytics.totalPostsAnalyzed}

Write a concise professional insight about their content performance and audience engagement. Be specific and data-driven.`

  const insight = await generateInsight(insightPrompt).catch(() => null)

  await recordUsage(session.user.id, 'creator_analyzer')

  await connectDB()
  const saved = await CreatorSearch.create({
    userId: session.user.id,
    platform,
    profileUrl: url,
    username: analytics.username,
    followerCount: analytics.followerCount,
    avgViews: analytics.avgViews,
    avgLikes: analytics.avgLikes,
    avgComments: analytics.avgComments,
    engagementRate: analytics.engagementRate,
    rawPostsJson: scraperData.posts,
    searchType: 'single',
  })

  return NextResponse.json({ analytics, insight, searchId: saved._id })
}
