'use client'

import PdfExportButton from './PdfExportButton'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const HOURS = Array.from({ length: 24 }, (_, i) => i)

function formatHour(h) {
  if (h === 0) return '12am'
  if (h === 12) return '12pm'
  return h < 12 ? `${h}am` : `${h - 12}pm`
}

function getColor(normalized) {
  if (normalized === 0) return 'bg-[#0d0d0d]'
  if (normalized < 0.2) return 'bg-red-950'
  if (normalized < 0.4) return 'bg-orange-950'
  if (normalized < 0.6) return 'bg-yellow-950'
  if (normalized < 0.8) return 'bg-green-900/60'
  return 'bg-green-700'
}

export default function HeatmapChart({ heatmap, topSlots, worstSlots, bestDay, insight, username, totalPostsAnalyzed }) {
  if (!heatmap) return null

  // Find max value for normalization
  let maxVal = 0
  for (const day of DAYS) {
    for (const h of HOURS) {
      if (heatmap[day]?.[h] > maxVal) maxVal = heatmap[day][h]
    }
  }

  return (
    <div id="besttime-report" className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Best Time to Post</h2>
          <p className="text-xs text-[#888]">@{username} · {totalPostsAnalyzed} posts · Timestamps in UTC</p>
        </div>
        <PdfExportButton targetId="besttime-report" filename={`best-time-${username}`} />
      </div>

      <p className="text-xs text-amber-400/80 bg-amber-950/20 border border-amber-900/30 rounded-lg px-3 py-2">
        Note: Post timestamps are in platform UTC time. Adjust for your audience&apos;s local timezone.
      </p>

      {/* Heatmap grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Hour labels */}
          <div className="flex mb-1 ml-20">
            {HOURS.filter(h => h % 3 === 0).map(h => (
              <div key={h} className="text-xs text-[#555]" style={{ width: `${100 / 8}%` }}>
                {formatHour(h)}
              </div>
            ))}
          </div>

          {DAYS.map(day => (
            <div key={day} className="flex items-center mb-0.5">
              <div className="text-xs text-[#888] w-20 shrink-0">{day.slice(0, 3)}</div>
              <div className="flex flex-1 gap-px">
                {HOURS.map(h => {
                  const val = heatmap[day]?.[h] || 0
                  const norm = maxVal > 0 ? val / maxVal : 0
                  return (
                    <div
                      key={h}
                      className={`flex-1 h-6 rounded-sm ${getColor(norm)} group relative cursor-default`}
                      title={`${day} ${formatHour(h)}: avg ${val} engagement`}
                    />
                  )
                })}
              </div>
            </div>
          ))}

          {/* Legend */}
          <div className="flex items-center gap-2 mt-3 ml-20">
            <span className="text-xs text-[#555]">Low</span>
            {['bg-red-950', 'bg-orange-950', 'bg-yellow-950', 'bg-green-900/60', 'bg-green-700'].map((c, i) => (
              <div key={i} className={`w-6 h-3 rounded-sm ${c}`} />
            ))}
            <span className="text-xs text-[#555]">High</span>
          </div>
        </div>
      </div>

      {/* Top slots */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-2">Top 3 Posting Times</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {topSlots?.map((slot, i) => (
            <div key={i} className="bg-green-950/20 border border-green-900/30 rounded-xl p-4 text-center">
              <div className="text-lg font-bold text-green-400">#{i + 1}</div>
              <div className="text-sm font-semibold text-white mt-0.5">{slot.day}</div>
              <div className="text-sm text-[#aaa]">{formatHour(slot.hour)} UTC</div>
              <div className="text-xs text-[#666] mt-1">{slot.engagement} avg engagement</div>
            </div>
          ))}
        </div>
      </div>

      {worstSlots?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white mb-2">Worst Times to Post</h3>
          <div className="flex flex-wrap gap-2">
            {worstSlots.map((slot, i) => (
              <div key={i} className="bg-red-950/20 border border-red-900/30 rounded-lg px-3 py-1.5 text-xs text-red-300">
                {slot.day} {formatHour(slot.hour)} UTC
              </div>
            ))}
          </div>
        </div>
      )}

      {bestDay && (
        <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-4">
          <span className="text-xs text-[#888]">Best Day Overall</span>
          <div className="text-lg font-bold text-white mt-1">{bestDay.day}</div>
        </div>
      )}

      {insight && (
        <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
          <p className="text-xs text-accent font-medium mb-1.5">AI Insight</p>
          <p className="text-sm text-[#ccc] leading-relaxed">{insight}</p>
        </div>
      )}
    </div>
  )
}
