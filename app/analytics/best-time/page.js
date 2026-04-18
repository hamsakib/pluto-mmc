'use client'

import { useState } from 'react'
import { Clock, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import HeatmapChart from '@/components/analytics/HeatmapChart'
import PaywallModal from '@/components/PaywallModal'

export default function BestTimePage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [showPaywall, setShowPaywall] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!url.trim()) return
    setError('')
    setResult(null)
    setLoading(true)

    try {
      const res = await fetch('/api/analytics/best-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await res.json()

      if (res.status === 403 && data.error === 'LIMIT_REACHED') {
        setShowPaywall(true)
      } else if (!res.ok) {
        setError(data.error || 'Something went wrong.')
      } else {
        setResult(data)
      }
    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080808] pt-20 pb-16">
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-8 animate-fade-up">
          <div className="inline-flex items-center gap-1.5 text-xs text-[#888] bg-[#111] border border-[#1e1e1e] rounded-full px-3 py-1 mb-3">
            Pro plan required
          </div>
          <h1 className="text-2xl font-bold text-white">Best Time to Post</h1>
          <p className="text-[#888] text-sm mt-1">
            Analyze last 50 posts to find when your content gets the most engagement.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste Instagram or TikTok profile URL"
            className="flex-1"
            disabled={loading}
          />
          <Button type="submit" disabled={loading || !url.trim()}>
            <Clock size={14} className="mr-1.5" />
            {loading ? 'Analyzing...' : 'Analyze'}
          </Button>
        </form>

        {error && (
          <div className="bg-red-950/30 border border-red-900/40 text-red-300 rounded-xl px-4 py-3 text-sm mb-5">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center py-16 text-[#888] text-sm animate-pulse">
            Scraping 50 posts with timestamps... this may take 40–60 seconds
          </div>
        )}

        {result && !loading && (
          <div className="animate-fade-up">
            <HeatmapChart
              heatmap={result.heatmap}
              topSlots={result.topSlots}
              worstSlots={result.worstSlots}
              bestDay={result.bestDay}
              insight={result.insight}
              username={result.username}
              totalPostsAnalyzed={result.totalPostsAnalyzed}
            />
          </div>
        )}
      </div>

      {showPaywall && (
        <PaywallModal onClose={() => setShowPaywall(false)} requiredPlan="pro" toolName="best_time" />
      )}
    </div>
  )
}
