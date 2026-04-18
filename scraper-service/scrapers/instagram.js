const { chromium } = require('playwright')
const { randomUA, randomViewport, randomDelay, applyStealthScripts } = require('../lib/antiDetection')
const { getActiveSession, markSessionUsed, markSessionFailed } = require('../lib/sessions')

// Instagram scraper using stored bot account sessions
// Intercepts GraphQL API calls for reliable data extraction
async function scrapeInstagram(profileUrl, postCount = 20) {
  const session = await getActiveSession('instagram')
  if (!session) {
    throw { code: 'NO_SESSION', message: 'No active Instagram bot session. Add one via /sessions/add.' }
  }

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled'],
  })

  const context = await browser.newContext({
    userAgent: session.userAgent || randomUA(),
    viewport: randomViewport(),
    locale: 'en-US',
    timezoneId: 'Asia/Dhaka',
  })

  // Restore bot session cookies
  await context.addCookies(session.cookies)

  const page = await context.newPage()
  await applyStealthScripts(page)

  const collectedPosts = []
  let profileData = null

  // Intercept Instagram GraphQL API responses
  page.on('response', async (response) => {
    const url = response.url()
    if (!url.includes('/graphql/query') && !url.includes('graphql/query')) return
    try {
      const json = await response.json()
      const userData = json?.data?.user
      if (!userData) return

      if (!profileData && userData.edge_followed_by) {
        profileData = {
          username: userData.username,
          displayName: userData.full_name,
          followerCount: userData.edge_followed_by?.count || 0,
          followingCount: userData.edge_follow?.count || 0,
          bio: userData.biography || '',
          profileImage: userData.profile_pic_url_hd || userData.profile_pic_url || null,
          isPrivate: userData.is_private,
        }
      }

      const edges = userData?.edge_owner_to_timeline_media?.edges || []
      for (const edge of edges) {
        const node = edge.node
        if (collectedPosts.length >= postCount) break
        collectedPosts.push({
          url: `https://www.instagram.com/p/${node.shortcode}/`,
          type: node.__typename === 'GraphVideo' ? 'video' : node.__typename === 'GraphSidecar' ? 'carousel' : 'image',
          timestamp: new Date(node.taken_at_timestamp * 1000).toISOString(),
          likes: node.edge_media_preview_like?.count || 0,
          comments: node.edge_media_to_comment?.count || 0,
          views: node.video_view_count || null,
          caption: node.edge_media_to_caption?.edges?.[0]?.node?.text || '',
        })
      }
    } catch {
      // Ignore non-JSON responses
    }
  })

  try {
    // Extract username from URL
    const usernameMatch = profileUrl.match(/instagram\.com\/([^/?#]+)/)
    if (!usernameMatch) throw { code: 'INVALID_URL', message: 'Invalid Instagram URL' }
    const username = usernameMatch[1]

    await randomDelay(500, 1500)
    await page.goto(`https://www.instagram.com/${username}/`, {
      waitUntil: 'networkidle',
      timeout: 30000,
    })
    await randomDelay(2000, 4000)

    // Check for private account
    const privateText = await page.locator('text=This Account is Private').isVisible().catch(() => false)
    if (privateText || profileData?.isPrivate) {
      throw { code: 'PRIVATE_ACCOUNT', message: 'This account is private.' }
    }

    // Check for not found
    const notFound = await page.locator('text=Sorry, this page').isVisible().catch(() => false)
    if (notFound) throw { code: 'NOT_FOUND', message: 'Profile not found.' }

    // Check for bot block
    const blocked = await page.locator('text=We restrict certain activity').isVisible().catch(() => false)
    if (blocked) {
      await markSessionFailed(session.id)
      throw { code: 'BOT_BLOCKED', message: 'Bot detection triggered. Try again in a few minutes.' }
    }

    // Scroll to load more posts
    let scrollAttempts = 0
    while (collectedPosts.length < postCount && scrollAttempts < 10) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      await randomDelay(1500, 3000)
      scrollAttempts++
    }

    await markSessionUsed(session.id)

    if (!profileData) throw { code: 'NO_DATA', message: 'Could not extract profile data.' }
    if (!collectedPosts.length) throw { code: 'NO_POSTS', message: 'No public posts found.' }

    return {
      success: true,
      platform: 'instagram',
      ...profileData,
      profileUrl,
      posts: collectedPosts.slice(0, postCount),
      scrapedAt: new Date().toISOString(),
    }
  } finally {
    await browser.close()
  }
}

module.exports = { scrapeInstagram }
