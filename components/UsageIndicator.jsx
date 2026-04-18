'use client'

export default function UsageIndicator({ used, limit, plan }) {
  if (plan !== 'free' || limit === null) return null

  const remaining = Math.max(0, limit - used)
  const pct = limit > 0 ? (used / limit) * 100 : 100

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-[#1e1e1e] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-red-500' : pct >= 50 ? 'bg-amber-500' : 'bg-accent'}`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
      <span className="text-xs text-[#888] whitespace-nowrap">
        {remaining === 0 ? 'No free searches left' : `${remaining} of ${limit} free searches left`}
      </span>
    </div>
  )
}
