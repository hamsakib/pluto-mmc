'use client'

import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import PdfExportButton from './PdfExportButton'

function fmt(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n?.toLocaleString() ?? '—'
}

const COLOR_MAP = {
  green:  { ring: 'ring-green-500',  text: 'text-green-400',  bg: 'bg-green-950/30',  border: 'border-green-900/40' },
  yellow: { ring: 'ring-yellow-500', text: 'text-yellow-400', bg: 'bg-yellow-950/30', border: 'border-yellow-900/40' },
  orange: { ring: 'ring-orange-500', text: 'text-orange-400', bg: 'bg-orange-950/30', border: 'border-orange-900/40' },
  red:    { ring: 'ring-red-500',    text: 'text-red-400',    bg: 'bg-red-950/30',    border: 'border-red-900/40' },
}

export default function FraudReport({ data }) {
  if (!data) return null
  const {
    username, platform, score, riskLevel, riskColor,
    flags, passes, followerCount, engagementRate,
    engagedAudienceEstimate, totalPostsAnalyzed, verdict, disclaimer,
  } = data

  const colors = COLOR_MAP[riskColor] || COLOR_MAP.green

  return (
    <div id="fraud-report" className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Fraud Detection Report</h2>
          <p className="text-xs text-[#888] capitalize">@{username} · {platform} · {totalPostsAnalyzed} posts analyzed</p>
        </div>
        <PdfExportButton targetId="fraud-report" filename={`fraud-${username}`} />
      </div>

      {/* Score gauge */}
      <div className="flex flex-col items-center py-6">
        <div className={`relative w-36 h-36 rounded-full ring-8 ${colors.ring} flex flex-col items-center justify-center bg-[#0d0d0d]`}>
          <span className={`text-4xl font-black ${colors.text}`}>{score}</span>
          <span className="text-xs text-[#888]">/ 100</span>
        </div>
        <div className={`mt-3 text-sm font-semibold ${colors.text}`}>{riskLevel}</div>
        <div className="text-xs text-[#666] mt-1">Risk Score</div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-4 text-center">
          <div className="text-xs text-[#888] mb-1">Followers</div>
          <div className="font-bold text-white">{fmt(followerCount)}</div>
        </div>
        <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-4 text-center">
          <div className="text-xs text-[#888] mb-1">Engagement Rate</div>
          <div className="font-bold text-white">{engagementRate}%</div>
        </div>
        <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-4 text-center">
          <div className="text-xs text-[#888] mb-1">Est. Real Audience</div>
          <div className="font-bold text-white">{fmt(engagedAudienceEstimate)}</div>
        </div>
      </div>

      {/* Red flags */}
      {flags.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-1.5">
            <AlertTriangle size={14} className="text-red-400" /> Red Flags ({flags.length})
          </h3>
          <div className="space-y-2">
            {flags.map((flag, i) => (
              <div key={i} className="flex items-start gap-3 bg-red-950/20 border border-red-900/30 rounded-xl p-3">
                <XCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-red-300">{flag.signal}</div>
                  <div className="text-xs text-[#999] mt-0.5">{flag.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Healthy signals */}
      {passes.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-1.5">
            <CheckCircle size={14} className="text-green-400" /> Healthy Signals ({passes.length})
          </h3>
          <div className="space-y-2">
            {passes.map((pass, i) => (
              <div key={i} className="flex items-start gap-3 bg-green-950/20 border border-green-900/30 rounded-xl p-3">
                <CheckCircle size={16} className="text-green-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-green-300">{pass.signal}</div>
                  <div className="text-xs text-[#999] mt-0.5">{pass.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI verdict */}
      {verdict && (
        <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
          <p className="text-xs text-accent font-medium mb-1.5">AI Verdict</p>
          <p className="text-sm text-[#ccc] leading-relaxed">{verdict}</p>
        </div>
      )}

      {disclaimer && (
        <p className="text-xs text-[#555] text-center italic">{disclaimer}</p>
      )}
    </div>
  )
}
