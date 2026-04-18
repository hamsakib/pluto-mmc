'use client'

import { Trophy } from 'lucide-react'
import PdfExportButton from './PdfExportButton'

function fmt(n) {
  if (n == null) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

function getWinner(profiles, key, higherIsBetter = true) {
  let best = profiles[0]
  for (const p of profiles) {
    if (higherIsBetter ? (p[key] > best[key]) : (p[key] < best[key])) {
      best = p
    }
  }
  return best.username
}

const METRICS = [
  { key: 'followerCount', label: 'Followers', higher: true },
  { key: 'avgViews', label: 'Avg Views', higher: true },
  { key: 'avgLikes', label: 'Avg Likes', higher: true },
  { key: 'avgComments', label: 'Avg Comments', higher: true },
  { key: 'engagementRate', label: 'Engagement Rate', higher: true, suffix: '%' },
  { key: 'viewsToFollowerRatio', label: 'Views / Follower', higher: true, suffix: '%' },
  { key: 'postingFrequency', label: 'Posts / Week', higher: true },
]

export default function ComparisonReport({ profiles, summary }) {
  if (!profiles?.length) return null

  return (
    <div id="comparison-report" className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Competitor Comparison</h2>
          <p className="text-xs text-[#888]">{profiles.length} profiles analyzed</p>
        </div>
        <PdfExportButton targetId="comparison-report" filename="competitor-comparison" />
      </div>

      {/* Profile headers */}
      <div className="grid gap-3" style={{ gridTemplateColumns: `120px repeat(${profiles.length}, 1fr)` }}>
        <div />
        {profiles.map((p) => (
          <div key={p.username} className="bg-[#111] border border-[#1e1e1e] rounded-xl p-3 text-center">
            <div className="font-semibold text-white text-sm">@{p.username}</div>
            <div className="text-xs text-[#888] capitalize">{p.platform}</div>
          </div>
        ))}
      </div>

      {/* Metrics rows */}
      {METRICS.map(({ key, label, higher, suffix }) => {
        const winner = getWinner(profiles, key, higher)
        return (
          <div
            key={key}
            className="grid gap-3 items-center"
            style={{ gridTemplateColumns: `120px repeat(${profiles.length}, 1fr)` }}
          >
            <div className="text-xs text-[#888]">{label}</div>
            {profiles.map((p) => {
              const isWinner = p.username === winner && p[key] != null
              return (
                <div
                  key={p.username}
                  className={`rounded-xl p-3 text-center border transition-colors ${
                    isWinner
                      ? 'bg-green-950/30 border-green-900/50'
                      : 'bg-[#0d0d0d] border-[#1a1a1a]'
                  }`}
                >
                  <span className={`text-sm font-semibold ${isWinner ? 'text-green-400' : 'text-[#aaa]'}`}>
                    {fmt(p[key])}{suffix || ''}
                  </span>
                  {isWinner && <Trophy size={12} className="inline-block ml-1 text-green-400 mb-0.5" />}
                </div>
              )
            })}
          </div>
        )
      })}

      {summary && (
        <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
          <p className="text-xs text-accent font-medium mb-1.5">AI Summary</p>
          <p className="text-sm text-[#ccc] leading-relaxed">{summary}</p>
        </div>
      )}
    </div>
  )
}
