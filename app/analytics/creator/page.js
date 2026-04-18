'use client'

import { useState, useEffect } from 'react'
import { Search, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import CreatorReport from '@/components/analytics/CreatorReport'
import PaywallModal from '@/components/PaywallModal'
import UpgradeBanner from '@/components/UpgradeBanner'
import UsageIndicator from '@/components/UsageIndicator'

export default function CreatorAnalyzerPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [usage, setUsage] = useState(null)
  const [showPaywall, setShowPaywall] = useState(false)
  const [history, setHistory] = useState([])

  useEffect(() => {
    fetchUsage()
    fetchHistory()
  }, [])

  async function fetchUsage() {
    const res = await fetch('/api/usage/check?tool=creator_analyzer')
    if (res.ok) setUsage(await res.json())
  }

  async function fetchHistory() {
    const res = await fetch('/api/history/creator')
    if (res.ok) setHistory(await res.json())
  }

  async function handleAnalyze(e) {
    e.preventDefault()
    if (!url.trim()) return
    setError('')
    setResult(null)
    setLoading(true)

    try {
      const res = await fetch('/api/analytics/creator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await res.json()

      if (res.status === 403 && data.error === 'LIMIT_REACHED') {
        setShowPaywall(true)
      } else if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
      } else {
        setResult(data)
        fetchUsage()
        fetchHistory()
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
          <h1 className="text-2xl font-bold text-white">Creator Profile Analyzer</h1>
          <p className="text-[#888] text-sm mt-1">
            Analyze any public Instagram or TikTok profile. Get followers, engagement rate, top posts, and AI insight.
          </p>
        </div>

        {usage && (
          <div className="mb-4 space-y-2">
            <UsageIndicator used={usage.used} limit={usage.limit} plan={usage.plan} />
            <UpgradeBanner remaining={usage.remaining} toolName="creator_analyzer" />
          </div>
        )}

        <form onSubmit={handleAnalyze} className="flex gap-2 mb-6">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://instagram.com/username or https://tiktok.com/@username"
            className="flex-1"
            disabled={loading}
          />
          <Button type="submit" disabled={loading || !url.trim()}>
            <Search size={14} className="mr-1.5" />
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
            Scraping profile data... this may take 20–40 seconds
          </div>
        )}

        {result && !loading && (
          <div className="animate-fade-up">
            <CreatorReport data={result.analytics} insight={result.insight} />
          </div>
        )}

        {history.length > 0 && !loading && !result && (
          <div className="mt-8">
            <h2 className="text-sm font-semibold text-[#888] mb-3 flex items-center gap-1.5">
              <Clock size={13} /> Recent Searches
            </h2>
            <div className="space-y-2">
              {history.map((item) => (
                <button
                  key={item._id}
                  onClick={() => setUrl(item.profileUrl)}
                  className="w-full flex items-center justify-between bg-[#111] border border-[#1e1e1e] rounded-xl px-4 py-3 hover:border-[#2a2a2a] transition-colors text-left"
                >
                  <div>
                    <span className="text-sm text-white">@{item.username}</span>
                    <span className="text-xs text-[#555] ml-2 capitalize">{item.platform}</span>
                  </div>
                  <span className="text-xs text-[#555]">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {showPaywall && (
        <PaywallModal
          onClose={() => setShowPaywall(false)}
          requiredPlan="pro"
          toolName="creator_analyzer"
        />
      )}
    </div>
  )
}
