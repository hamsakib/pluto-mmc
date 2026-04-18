'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, Zap, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

const PLANS = [
  {
    id: 'pro',
    name: 'Pro',
    price: '৳999',
    period: '/month',
    icon: Zap,
    color: 'text-accent',
    description: 'For content marketers and brand managers',
    features: [
      'Unlimited Creator Profile Analysis',
      'Competitor Comparison Reports',
      'Best Time to Post Calculator',
      'Campaign ROI Calculator',
      'PDF Export for all reports',
      'Full search history',
    ],
  },
  {
    id: 'agency',
    name: 'Agency',
    price: '৳2,499',
    period: '/month',
    icon: Shield,
    color: 'text-purple-400',
    popular: true,
    description: 'For agencies managing multiple brand accounts',
    features: [
      'Everything in Pro',
      'Fake Follower / Fraud Detector',
      'Priority scraping queue',
      'White-label PDF reports',
      'Up to 10 team members',
      'Dedicated support',
    ],
  },
]

export default function PricingPage() {
  const { data: session } = useSession()
  const [loadingPlan, setLoadingPlan] = useState(null)
  const [currentPlan, setCurrentPlan] = useState('free')
  const paymentStatus = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('payment')
    : null

  useEffect(() => {
    if (session) {
      fetch('/api/subscription/status')
        .then(r => r.json())
        .then(d => setCurrentPlan(d.plan || 'free'))
    }
  }, [session])

  async function handleUpgrade(planId) {
    if (!session) return
    setLoadingPlan(planId)
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
        alert(data.error || 'Could not initiate payment. Try again.')
        setLoadingPlan(null)
      }
    } catch {
      alert('Something went wrong.')
      setLoadingPlan(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#080808] pt-20 pb-16">
      <div className="mx-auto max-w-4xl px-4">
        <div className="text-center mb-12 animate-fade-up">
          {paymentStatus === 'success' && (
            <div className="inline-flex items-center gap-2 bg-green-950/40 border border-green-900/40 text-green-400 rounded-full px-4 py-2 text-sm mb-6">
              <CheckCircle size={14} /> Payment successful — your plan is now active!
            </div>
          )}
          {paymentStatus === 'failed' && (
            <div className="inline-flex items-center gap-2 bg-red-950/40 border border-red-900/40 text-red-400 rounded-full px-4 py-2 text-sm mb-6">
              Payment failed or cancelled. Please try again.
            </div>
          )}

          <h1 className="text-3xl font-black text-white mb-3">
            Simple, transparent pricing
          </h1>
          <p className="text-[#888] max-w-md mx-auto">
            Start free. Upgrade when you need more power. All plans include the ROI Calculator — free forever.
          </p>
        </div>

        {/* Free plan */}
        <div className="mb-4 bg-[#0d0d0d] border border-[#1e1e1e] rounded-2xl p-5 flex items-center justify-between">
          <div>
            <div className="font-semibold text-white">Free</div>
            <div className="text-xs text-[#888] mt-0.5">2 creator profile analyses · Unlimited ROI Calculator</div>
          </div>
          <div className="text-sm text-[#555]">Current plan</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PLANS.map((plan) => {
            const Icon = plan.icon
            const isCurrent = currentPlan === plan.id

            return (
              <div
                key={plan.id}
                className={`relative bg-[#111] border rounded-2xl p-6 ${
                  plan.popular ? 'border-accent/40' : 'border-[#1e1e1e]'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}

                <div className="flex items-center gap-2 mb-1">
                  <Icon size={16} className={plan.color} />
                  <span className="font-bold text-white">{plan.name}</span>
                </div>
                <p className="text-xs text-[#888] mb-4">{plan.description}</p>

                <div className="mb-5">
                  <span className="text-3xl font-black text-white">{plan.price}</span>
                  <span className="text-[#888] text-sm">{plan.period}</span>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#aaa]">
                      <CheckCircle size={14} className="text-green-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <Button className="w-full" disabled>Current Plan</Button>
                ) : session ? (
                  <Button
                    className="w-full"
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={loadingPlan !== null}
                  >
                    {loadingPlan === plan.id ? 'Redirecting to payment...' : `Get ${plan.name}`}
                  </Button>
                ) : (
                  <Link href="/signup">
                    <Button className="w-full">Sign up to upgrade</Button>
                  </Link>
                )}
              </div>
            )
          })}
        </div>

        <p className="text-center text-xs text-[#555] mt-6">
          Secured by SSLCommerz · Monthly billing · Cancel anytime
        </p>
      </div>
    </div>
  )
}
