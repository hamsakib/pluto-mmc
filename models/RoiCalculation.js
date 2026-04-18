import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

const RoiCalculationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    inputsJson: { type: mongoose.Schema.Types.Mixed, required: true },
    resultsJson: { type: mongoose.Schema.Types.Mixed, required: true },
    shareToken: { type: String, unique: true, default: () => uuidv4() },
  },
  { timestamps: true }
)

export default mongoose.models.RoiCalculation || mongoose.model('RoiCalculation', RoiCalculationSchema)
