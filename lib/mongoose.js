import mongoose from 'mongoose'

let isConnected = false

export async function connectDB() {
  if (isConnected) return

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables')
  }

  const db = await mongoose.connect(process.env.MONGODB_URI)
  isConnected = db.connections[0].readyState === 1
}
