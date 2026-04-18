import mongoose from 'mongoose'

const CreatorSearchSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    platform: { type: String, enum: ['instagram', 'tiktok'], required: true },
    profileUrl: { type: String, required: true },
    username: { type: String, default: null },
    followerCount: { type: Number, default: null },
    avgViews: { type: Number, default: null },
    avgLikes: { type: Number, default: null },
    avgComments: { type: Number, default: null },
    avgShares: { type: Number, default: null },
    engagementRate: { type: Number, default: null },
    viewsToFollowerRatio: { type: Number, default: null },
    postingFrequency: { type: Number, default: null },
    totalPostsAnalyzed: { type: Number, default: null },
    rawPostsJson: { type: mongoose.Schema.Types.Mixed, default: null },
    searchType: {
      type: String,
      enum: ['single', 'comparison', 'besttime', 'fraud'],
      default: 'single',
    },
  },
  { timestamps: true }
)

export default mongoose.models.CreatorSearch || mongoose.model('CreatorSearch', CreatorSearchSchema)
