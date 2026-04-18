const { chromium } = require('playwright')
const { randomUA, randomViewport, randomDelay, applyStealthScripts } = require('../lib/antiDetection')
const { getActiveSession, markSessionUsed, markSessionFailed } = require('../lib/sessions')

async function scrapeTikTok(profileUrl, postCount = 20) {
  const session = await getActiveSession('tiktok')
  if (!session) {
    throw { code: 'NO_SESSION', message: 'No active TikTok bot session. Add one via /sessions/add.' }
  }

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled'],
  })

  const context = await browser.newContext({
    userAgent: session.userAgent || randomUA(),
    viewport: randomViewport(),
    locale: 'en-US',
  })

  await context.addCookies(session.cookies)

  const page = await context.newPage()
  await applyStealthScripts(page)

  const collectedPosts = []
  let profileData = null

  // Intercept TikTok API responses
  page.on('response', async (response) => {
    const url = response.url()
    if (!url.includes('/api/post/item_list') && !url.includes('aweme/v1/web/user/profile')) return
    try {
      const json = await response.json()

      // Profile endpoint
      if (json?.userInfo) {
        const u = json.userInfo
        profileData = {
          username: u.user?.uniqueId,
          displayName: u.user?.nickname,
          followerCount: u.stats?.followerCount || 0,
          followingCount: u.stats?.followingCount || 0,
          bio: u.user?.signature || '',
          profileImage: u.user?.avatarLarger || null,
          isPrivate: u.user?.privateAccount || false,
        }
      }

      // Posts endpoint
      if (json?.itemList) {
        for (const item of json.itemList) {
          if (collectedPosts.length >= postCount) break
          collectedPosts.push({
            url: `https://www.tiktok.com/@${profileData?.username}/video/${item.id}`,
            type: 'video',
            timestamp: new Date(item.createTime * 1000).toISOString(),
            likes: item.stats?.diggCount || 0,
            comments: item.stats?.commentCount || 0,
            views: item.stats?.playCount || 0,
            shares: item.stats?.shareCount || 0,
            caption: item.desc || '',
          })
        }
      }
    } catch {
      // Ignore
    }
  })

  try {
    const usernameMatch = profileUrl.match(/tiktok\.com\/@([^/?#]+)/)
    if (!usernameMatch) throw { code: 'INVALID_URL', message: 'Invalid TikTok URL' }
    const username = usernameMatch[1]

    await randomDelay(500, 1500)
    await page.goto(`https://www.tiktok.com/@${username}`, {
      waitUntil: 'networkidle',
      timeout: 30000,
    })
    await randomDelay(2000, 4000)

    // Check for private account
    const privateIndicator = await page.locator('[data-e2e="private-account-title"]').isVisible().catch(() => false)
    if (privateIndicator || profileData?.isPrivate) {
      throw { code: 'PRIVATE_ACCOUNT', message: 'This account is private.' }
    }

    const notFound = await page.locator('text=Couldn\'t find this account').isVisible().catch(() => false)
    if (notFound) throw { code: 'NOT_FOUND', message: 'Profile not found.' }

    // Scroll to load posts
    let scrollAttempts = 0
    while (collectedPosts.length < postCount && scrollAttempts < 15) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      await randomDelay(1500, 3500)
      scrollAttempts++
    }

    await markSessionUsed(session.id)

    if (!profileData) throw { code: 'NO_DATA', message: 'Could not extract profile data.' }
    if (!collectedPosts.length) throw { code: 'NO_POSTS', message: 'No posts found.' }

    return {
      success: true,
      platform: 'tiktok',
      ...profileData,
      profileUrl,
      posts: collectedPosts.slice(0, postCount),
      scrapedAt: new Date().toISOString(),
    }
  } finally {
    await browser.close()
  }
}

module.exports = { scrapeTikTok }
