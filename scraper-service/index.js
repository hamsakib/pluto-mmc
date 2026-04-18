require('dotenv').config()

const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const { scrapeInstagram } = require('./scrapers/instagram')
const { scrapeTikTok } = require('./scrapers/tiktok')
const { saveSession } = require('./lib/sessions')

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

// API key authentication middleware
function requireApiKey(req, res, next) {
  const key = req.headers['x-api-key']
  if (!key || key !== process.env.SCRAPER_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  next()
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✓ MongoDB connected'))
  .catch((e) => console.error('✗ MongoDB connection failed:', e.message))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'pluto-scraper' })
})

// Main scrape endpoint
app.post('/scrape/:platform', requireApiKey, async (req, res) => {
  const { platform } = req.params
  const { url, postCount = 20 } = req.body

  if (!url) return res.status(400).json({ code: 'MISSING_URL', message: 'url is required' })
  if (!['instagram', 'tiktok'].includes(platform)) {
    return res.status(400).json({ code: 'INVALID_PLATFORM', message: 'Platform must be instagram or tiktok' })
  }

  console.log(`[${new Date().toISOString()}] Scraping ${platform}: ${url}`)

  try {
    let result
    if (platform === 'instagram') {
      result = await scrapeInstagram(url, Math.min(postCount, 50))
    } else {
      result = await scrapeTikTok(url, Math.min(postCount, 50))
    }
    res.json(result)
  } catch (err) {
    const code = err.code || 'SCRAPER_ERROR'
    const message = err.message || 'Scraping failed'
    console.error(`[${platform}] ${code}: ${message}`)

    const statusMap = {
      PRIVATE_ACCOUNT: 422,
      NOT_FOUND: 404,
      BOT_BLOCKED: 429,
      NO_POSTS: 422,
      NO_SESSION: 503,
      INVALID_URL: 400,
    }
    res.status(statusMap[code] || 500).json({ code, message })
  }
})

// Add bot session (called manually when setting up bot accounts)
// POST /sessions/add { platform, username, cookies, userAgent }
app.post('/sessions/add', requireApiKey, async (req, res) => {
  const { platform, username, cookies, userAgent } = req.body
  if (!platform || !username || !cookies) {
    return res.status(400).json({ error: 'platform, username, and cookies are required' })
  }
  try {
    await saveSession(platform, username, cookies, userAgent)
    res.json({ success: true, message: `Session saved for @${username} on ${platform}` })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.listen(PORT, () => {
  console.log(`\n🚀 Pluto Scraper Service running on port ${PORT}`)
  console.log(`   Health: http://localhost:${PORT}/health`)
  console.log(`   Endpoints: POST /scrape/instagram, POST /scrape/tiktok`)
  console.log(`   Add sessions: POST /sessions/add\n`)
})
