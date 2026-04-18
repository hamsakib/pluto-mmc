import { connectDB } from './mongoose'
import ToolUsage from '@/models/ToolUsage'
import Subscription from '@/models/Subscription'
import User from '@/models/User'

export const TOOL_LIMITS = {
  creator_analyzer:      { free: 2,        pro: Infinity, agency: Infinity },
  competitor_comparison: { free: 0,        pro: Infinity, agency: Infinity },
  best_time:             { free: 0,        pro: Infinity, agency: Infinity },
  fraud_detector:        { free: 0,        pro: 0,        agency: Infinity },
  roi_calculator:        { free: Infinity, pro: Infinity, agency: Infinity },
}

export async function getUserPlan(userId) {
  await connectDB()
  const user = await User.findById(userId).select('plan')
  return user?.plan || 'free'
}

export async function getUsageCount(userId, toolName) {
  await connectDB()
  return ToolUsage.countDocuments({ userId, toolName })
}

export async function checkUsageLimit(userId, toolName) {
  const plan = await getUserPlan(userId)
  const limit = TOOL_LIMITS[toolName]?.[plan] ?? 0

  if (limit === Infinity) return { allowed: true, remaining: null, plan }

  const used = await getUsageCount(userId, toolName)
  const remaining = Math.max(0, limit - used)
  return { allowed: remaining > 0, remaining, limit, used, plan }
}

export async function recordUsage(userId, toolName) {
  await connectDB()
  await ToolUsage.create({ userId, toolName })
}

export async function getUsageSummary(userId) {
  await connectDB()
  const plan = await getUserPlan(userId)
  const tools = Object.keys(TOOL_LIMITS)
  const summary = {}

  for (const tool of tools) {
    const limit = TOOL_LIMITS[tool][plan]
    if (limit === Infinity) {
      summary[tool] = { limit: null, used: 0, remaining: null, unlimited: true, plan }
    } else {
      const used = await getUsageCount(userId, tool)
      summary[tool] = { limit, used, remaining: Math.max(0, limit - used), unlimited: false, plan }
    }
  }

  return summary
}
