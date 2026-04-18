import mongoose from 'mongoose'

const BotSessionSchema = new mongoose.Schema(
  {
    platform: { type: String, enum: ['instagram', 'tiktok'], required: true },
    username: { type: String, required: true },
    cookiesJson: { type: String, required: true },
    userAgent: { type: String, default: null },
    lastUsed: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
    failCount: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export default mongoose.models.BotSession || mongoose.model('BotSession', BotSessionSchema)
