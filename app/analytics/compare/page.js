'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, BarChart2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ComparisonReport from '@/components/analytics/ComparisonReport'
import PaywallModal from '@/components/PaywallModal'

export default function CompareProfilesPage() {
  const [urls, setUrls] = useState(['', ''])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [showPaywall, setShowPaywall] = useState(false)
  const [plan, setPlan] = useState(null)

  useEffect(() => {
    fetch('/api/subscription/status').then(r => r.json()).then(d => setPlan(d.plan))
  }, [])

  function setUrl(i, val) {
    setUrls(prev => prev.map((u, idx) => idx === i ? val : u))
  }

  function addUrl() {
    if (urls.length < 3) setUrls(prev => [...prev, ''])
  }

  function removeUrl(i) {
    if (urls.length > 2) setUrls(prev => prev.filter((_, idx) => idx !== i))
  }

  async function handleCompare(e) {
    e.preventDefault()
    const filled = urls.filter(u => u.trim())
    if (filled.length < 2) return setError('Enter at least 2 profile URLs.')
    setError('')
    setResult(null)
    setLoading(true)

    try {
      const res = await fetch('/api/analytics/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: filled }),
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
          <h1 className="text-2xl font-bold text-white">Competitor Comparison</h1>
          <p className="text-[#888] text-sm mt-1">
            Compare 2–3 profiles side by side. See who wins on every metric.
          </p>
        </div>

        <form onSubmit={handleCompare} className="space-y-3 mb-6">
          {urls.map((u, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={u}
                onChange={(e) => setUrl(i, e.target.value)}
                placeholder={`Profile ${i + 1} URL (Instagram or TikTok)`}
                className="flex-1"
                disabled={loading}
              />
              {urls.length > 2 && (
                <button type="button" onClick={() => removeUrl(i)} className="text-[#555] hover:text-red-400 p-2">
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))}

          <div className="flex gap-3">
            {urls.length < 3 && (
              <button type="button" onClick={addUrl} className="flex items-center gap-1.5 text-xs text-[#888] hover:text-white transition-colors">
                <Plus size={13} /> Add third profile
              </button>
            )}
            <Button type="submit" disabled={loading} className="ml-auto">
              <BarChart2 size={14} className="mr-1.5" />
              {loading ? 'Comparing...' : 'Compare'}
            </Button>
          </div>
        </form>

        {error && (
          <div className="bg-red-950/30 border border-red-900/40 text-red-300 rounded-xl px-4 py-3 text-sm mb-5">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center py-16 text-[#888] text-sm animate-pulse">
            Scraping {urls.filter(u => u.trim()).length} profiles... this may take 30–60 seconds
          </div>
        )}

        {result && !loading && (
          <div className="animate-fade-up">
            <ComparisonReport profiles={result.profiles} summary={result.summary} />
          </div>
        )}
      </div>

      {showPaywall && (
        <PaywallModal onClose={() => setShowPaywall(false)} requiredPlan="pro" toolName="competitor_comparison" />
      )}
    </div>
  )
}
