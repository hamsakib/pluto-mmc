import mongoose from 'mongoose'

const SubscriptionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    plan: { type: String, enum: ['pro', 'agency'], required: true },
    status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' },
    sslTransactionId: { type: String, required: true, unique: true },
    sslValId: { type: String, default: null },
    amountPaid: { type: Number, required: true },
    currency: { type: String, default: 'BDT' },
    validFrom: { type: Date, default: Date.now },
    validUntil: { type: Date, required: true },
  },
  { timestamps: true }
)

export default mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema)
