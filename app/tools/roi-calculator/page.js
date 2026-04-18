'use client'

import { useState, useEffect, useCallback } from 'react'
import { Share2, Calculator, TrendingUp, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import PdfExportButton from '@/components/analytics/PdfExportButton'

function fmt(n) {
  if (n == null) return '—'
  return Math.round(n).toLocaleString('en-BD')
}

function StatCard({ label, value, sub, highlight }) {
  return (
    <div className={`bg-[#111] border rounded-xl p-4 ${highlight ? 'border-accent/40 bg-accent/5' : 'border-[#1e1e1e]'}`}>
      <div className="text-xs text-[#888] mb-1">{label}</div>
      <div className={`text-lg font-bold ${highlight ? 'text-accent' : 'text-white'}`}>{value}</div>
      {sub && <div className="text-xs text-[#555] mt-0.5">{sub}</div>}
    </div>
  )
}

export default function ROICalculatorPage() {
  const [inputs, setInputs] = useState({
    influencerFee: '',
    avgViews: '',
    ctr: '2',
    conversionRate: '1',
    productPrice: '',
  })
  const [result, setResult] = useState(null)
  const [tip, setTip] = useState(null)
  const [calcId, setCalcId] = useState(null)
  const [shareUrl, setShareUrl] = useState(null)
  const [sharingLoading, setSharingLoading] = useState(false)
  const [profileUrl, setProfileUrl] = useState('')
  const [autoFillLoading, setAutoFillLoading] = useState(false)

  const set = (key, val) => setInputs(prev => ({ ...prev, [key]: val }))

  const calculate = useCallback(async () => {
    const { influencerFee, avgViews, ctr, conversionRate, productPrice } = inputs
    if (!influencerFee || !avgViews || !productPrice) return

    const body = {
      influencerFee: parseFloat(influencerFee),
      avgViews: parseFloat(avgViews),
      ctr: parseFloat(ctr) || 2,
      conversionRate: parseFloat(conversionRate) || 1,
      productPrice: parseFloat(productPrice),
    }

    const res = await fetch('/api/tools/roi-calculator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.ok) {
      const data = await res.json()
      setResult(data.results)
      setTip(data.tip)
      // extract calcId from response body if returned
    }
  }, [inputs])

  // Debounce: recalculate 400ms after any input change
  useEffect(() => {
    const t = setTimeout(calculate, 400)
    return () => clearTimeout(t)
  }, [calculate])

  // Auto-fill from profile
  async function handleAutoFill(e) {
    e.preventDefault()
    if (!profileUrl.trim()) return
    setAutoFillLoading(true)
    try {
      const res = await fetch('/api/analytics/creator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: profileUrl.trim() }),
      })
      const data = await res.json()
      if (res.ok && data.analytics?.avgViews) {
        set('avgViews', String(data.analytics.avgViews))
      } else {
        alert(data.error || 'Could not auto-fill. Enter views manually.')
      }
    } finally {
      setAutoFillLoading(false)
    }
  }

  async function handleShare() {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl)
      alert('Link copied!')
      return
    }
    if (!calcId) {
      alert('Save a calculation first by entering all fields.')
      return
    }
    setSharingLoading(true)
    try {
      const res = await fetch('/api/tools/roi-calculator', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calcId }),
      })
      const data = await res.json()
      if (data.shareToken) {
        const url = `${window.location.origin}/tools/roi-calculator?token=${data.shareToken}`
        setShareUrl(url)
        navigator.clipboard.writeText(url)
        alert('Share link copied to clipboard!')
      }
    } finally {
      setSharingLoading(false)
    }
  }

  // Load shared calculation from token
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token')
    if (!token) return
    fetch(`/api/tools/roi-calculator?token=${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.inputs) {
          setInputs({
            influencerFee: String(data.inputs.influencerFee),
            avgViews: String(data.inputs.avgViews),
            ctr: String(data.inputs.ctr),
            conversionRate: String(data.inputs.conversionRate),
            productPrice: String(data.inputs.productPrice),
          })
          setResult(data.results)
          setTip(data.results?.tip)
        }
      })
  }, [])

  const isPositive = result?.isPositive

  return (
    <div className="min-h-screen bg-[#080808] pt-20 pb-16">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-8 animate-fade-up">
          <h1 className="text-2xl font-bold text-white">Campaign ROI Calculator</h1>
          <p className="text-[#888] text-sm mt-1">
            Calculate your influencer campaign ROI instantly. Free for everyone — no account needed.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input form */}
          <div className="space-y-4">
            <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-white">Campaign Details</h2>

              <div className="space-y-1.5">
                <Label>Influencer Fee (BDT)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 50000"
                  value={inputs.influencerFee}
                  onChange={(e) => set('influencerFee', e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Average Views per Post</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="e.g. 25000"
                    value={inputs.avgViews}
                    onChange={(e) => set('avgViews', e.target.value)}
                    className="flex-1"
                  />
                  <div className="flex gap-1 shrink-0">
                    <Input
                      placeholder="Profile URL (auto-fill)"
                      value={profileUrl}
                      onChange={(e) => setProfileUrl(e.target.value)}
                      className="w-36 text-xs"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleAutoFill}
                      disabled={autoFillLoading || !profileUrl.trim()}
                    >
                      {autoFillLoading ? '...' : 'Fill'}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Click Through Rate (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={inputs.ctr}
                    onChange={(e) => set('ctr', e.target.value)}
                    placeholder="2"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Conversion Rate (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={inputs.conversionRate}
                    onChange={(e) => set('conversionRate', e.target.value)}
                    placeholder="1"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Product Price (BDT)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 1200"
                  value={inputs.productPrice}
                  onChange={(e) => set('productPrice', e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleShare} disabled={sharingLoading} className="flex-1">
                <Share2 size={13} className="mr-1.5" />
                {shareUrl ? 'Link copied!' : 'Share Results'}
              </Button>
              {result && <PdfExportButton targetId="roi-report" filename="roi-calculator" />}
            </div>
          </div>

          {/* Results */}
          <div id="roi-report">
            {result ? (
              <div className="space-y-4 animate-fade-up">
                {/* Big ROI */}
                <div className={`rounded-2xl p-6 text-center border ${
                  isPositive
                    ? 'bg-green-950/20 border-green-900/40'
                    : 'bg-red-950/20 border-red-900/40'
                }`}>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    {isPositive ? <TrendingUp className="text-green-400" size={20} /> : <TrendingDown className="text-red-400" size={20} />}
                    <span className="text-xs font-medium text-[#888]">Return on Investment</span>
                  </div>
                  <div className={`text-4xl font-black ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {result.roiPercent > 0 ? '+' : ''}{result.roiPercent}%
                  </div>
                  <div className={`text-sm mt-1 ${isPositive ? 'text-green-300' : 'text-red-300'}`}>
                    {isPositive ? `Net Profit: ৳${fmt(result.netProfit)}` : `Net Loss: ৳${fmt(Math.abs(result.netProfit))}`}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <StatCard label="Est. Reach" value={fmt(result.estimatedReach)} sub="avg views" />
                  <StatCard label="Est. Clicks" value={fmt(result.estimatedClicks)} sub="at CTR rate" />
                  <StatCard label="Est. Conversions" value={fmt(result.estimatedConversions)} sub="purchases" />
                  <StatCard label="Est. Revenue" value={`৳${fmt(result.estimatedRevenue)}`} sub="gross revenue" />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <StatCard label="Cost per View" value={`৳${result.costPerView}`} />
                  <StatCard label="Cost per Click" value={`৳${result.costPerClick}`} />
                  <StatCard label="Cost per Conv." value={`৳${result.costPerConversion}`} />
                </div>

                <div className="bg-amber-950/20 border border-amber-900/30 rounded-xl p-4">
                  <div className="text-xs text-amber-400 font-medium mb-1">Break-even Point</div>
                  <div className="text-sm text-white font-bold">{fmt(result.breakEvenViews)} views needed</div>
                  <div className="text-xs text-[#666] mt-0.5">to cover the influencer fee</div>
                </div>

                {tip && (
                  <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
                    <p className="text-xs text-accent font-medium mb-1.5">AI Tip</p>
                    <p className="text-sm text-[#ccc] leading-relaxed">{tip}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center bg-[#111] border border-[#1e1e1e] rounded-2xl p-10 text-center">
                <div>
                  <Calculator size={32} className="text-[#333] mx-auto mb-3" />
                  <p className="text-[#555] text-sm">Fill in the form to see your ROI instantly</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
