'use client'

import { useState } from 'react'
import { X, Zap, Shield, BarChart2, Clock, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

const PLANS = {
  pro: {
    name: 'Pro',
    price: '৳999',
    period: '/month',
    color: '#2B47CC',
    features: [
      'Unlimited Creator Profile Analysis',
      'Competitor Comparison Reports',
      'Best Time to Post Calculator',
      'Campaign ROI Calculator',
      'PDF Export for all reports',
    ],
  },
  agency: {
    name: 'Agency',
    price: '৳2,499',
    period: '/month',
    color: '#7c3aed',
    features: [
      'Everything in Pro',
      'Fake Follower / Fraud Detector',
      'Priority scraping queue',
      'White-label PDF reports',
      'Up to 10 team members',
      'Dedicated support',
    ],
  },
}

export default function PaywallModal({ onClose, requiredPlan = 'pro', toolName }) {
  const [loading, setLoading] = useState(null)

  const plansToShow = requiredPlan === 'agency'
    ? ['agency']
    : ['pro', 'agency']

  const toolLabels = {
    creator_analyzer: 'Creator Profile Analyzer',
    competitor_comparison: 'Competitor Comparison',
    best_time: 'Best Time to Post',
    fraud_detector: 'Fraud Detector',
  }

  async function handleUpgrade(planId) {
    setLoading(planId)
    try {
      const res = await fetch('/api/payment/sslcommerz/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Payment initiation failed. Please try again.')
        setLoading(null)
      }
    } catch {
      alert('Something went wrong. Please try again.')
      setLoading(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-[#111] border border-[#1e1e1e] rounded-2xl p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#555] hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 mb-3">
            <Zap size={22} className="text-accent" />
          </div>
          <h2 className="text-xl font-bold text-white">
            {requiredPlan === 'agency' ? 'Agency plan required' : 'Upgrade to unlock'}
          </h2>
          <p className="text-[#888] text-sm mt-1">
            {toolLabels[toolName] || 'This feature'} requires{' '}
            {requiredPlan === 'agency' ? 'an Agency subscription' : 'a paid plan'}.
          </p>
        </div>

        <div className={`grid gap-4 ${plansToShow.length === 1 ? 'grid-cols-1 max-w-sm mx-auto' : 'grid-cols-1 sm:grid-cols-2'}`}>
          {plansToShow.map((planId) => {
            const plan = PLANS[planId]
            return (
              <div
                key={planId}
                className="border border-[#2a2a2a] rounded-xl p-5 hover:border-[#333] transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-white">{plan.name}</span>
                  <span className="text-sm font-bold text-white">
                    {plan.price}<span className="text-[#888] font-normal text-xs">{plan.period}</span>
                  </span>
                </div>
                <ul className="space-y-1.5 mb-4">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-[#aaa]">
                      <CheckCircle size={13} className="text-green-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  size="sm"
                  onClick={() => handleUpgrade(planId)}
                  disabled={loading !== null}
                >
                  {loading === planId ? 'Redirecting...' : `Get ${plan.name}`}
                </Button>
              </div>
            )
          })}
        </div>

        <p className="text-center text-xs text-[#555] mt-4">
          Secured by SSLCommerz · Cancel anytime · BDT billing
        </p>
      </div>
    </div>
  )
}
