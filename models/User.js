import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, default: null },
    image: { type: String, default: null },
    provider: { type: String, enum: ['email', 'google'], default: 'email' },
  },
  { timestamps: true }
)

export default mongoose.models.User || mongoose.model('User', UserSchema)
