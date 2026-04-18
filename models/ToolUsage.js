import mongoose from 'mongoose'

const ToolUsageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  toolName: {
    type: String,
    enum: ['creator_analyzer', 'competitor_comparison', 'best_time', 'fraud_detector', 'roi_calculator'],
    required: true,
  },
  usedAt: { type: Date, default: Date.now, index: true },
})

export default mongoose.models.ToolUsage || mongoose.model('ToolUsage', ToolUsageSchema)
