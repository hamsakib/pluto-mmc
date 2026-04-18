const mongoose = require('mongoose')

// Inline BotSession schema (mirrors the main app model)
const BotSessionSchema = new mongoose.Schema({
  platform: String,
  username: String,
  cookiesJson: String,
  userAgent: String,
  lastUsed: Date,
  isActive: Boolean,
  failCount: { type: Number, default: 0 },
}, { timestamps: true })

const BotSession = mongoose.models.BotSession || mongoose.model('BotSession', BotSessionSchema)

async function getActiveSession(platform) {
  const session = await BotSession.findOne({
    platform,
    isActive: true,
    failCount: { $lt: 5 },
  }).sort({ lastUsed: 1 }) // use least recently used

  if (!session) return null

  return {
    id: session._id.toString(),
    cookies: JSON.parse(session.cookiesJson),
    userAgent: session.userAgent,
  }
}

async function markSessionUsed(sessionId) {
  await BotSession.findByIdAndUpdate(sessionId, { lastUsed: new Date() })
}

async function markSessionFailed(sessionId) {
  await BotSession.findByIdAndUpdate(sessionId, {
    $inc: { failCount: 1 },
    lastUsed: new Date(),
  })
}

async function saveSession(platform, username, cookies, userAgent) {
  const cookiesJson = JSON.stringify(cookies)
  await BotSession.findOneAndUpdate(
    { platform, username },
    { platform, username, cookiesJson, userAgent, isActive: true, failCount: 0 },
    { upsert: true, new: true }
  )
}

module.exports = { getActiveSession, markSessionUsed, markSessionFailed, saveSession }
