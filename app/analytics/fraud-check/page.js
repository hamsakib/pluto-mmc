'use client'

import { useState } from 'react'
import { ShieldAlert, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import FraudReport from '@/components/analytics/FraudReport'
import PaywallModal from '@/components/PaywallModal'

export default function FraudCheckPage() {
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
      const res = await fetch('/api/analytics/fraud-check', {
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
            Agency plan only
          </div>
          <h1 className="text-2xl font-bold text-white">Fake Follower Detector</h1>
          <p className="text-[#888] text-sm mt-1">
            Detect fake followers and engagement fraud before you recommend a creator to your client.
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
            <ShieldAlert size={14} className="mr-1.5" />
            {loading ? 'Scanning...' : 'Scan Profile'}
          </Button>
        </form>

        {error && (
          <div className="bg-red-950/30 border border-red-900/40 text-red-300 rounded-xl px-4 py-3 text-sm mb-5">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center py-16 text-[#888] text-sm animate-pulse">
            Scanning 30 posts for engagement patterns... this may take 30–45 seconds
          </div>
        )}

        {result && !loading && (
          <div className="animate-fade-up">
            <FraudReport data={result} />
          </div>
        )}
      </div>

      {showPaywall && (
        <PaywallModal onClose={() => setShowPaywall(false)} requiredPlan="agency" toolName="fraud_detector" />
      )}
    </div>
  )
}
