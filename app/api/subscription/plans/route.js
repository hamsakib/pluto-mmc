import { NextResponse } from 'next/server'

export const SUBSCRIPTION_PLANS = {
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 999,
    currency: 'BDT',
    period: 'month',
    features: [
      'Unlimited Creator Profile Analysis',
      'Competitor Comparison Reports',
      'Best Time to Post Calculator',
      'Campaign ROI Calculator',
      'PDF Export for all reports',
      'Full search history',
    ],
  },
  agency: {
    id: 'agency',
    name: 'Agency',
    price: 2499,
    currency: 'BDT',
    period: 'month',
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

export async function GET() {
  return NextResponse.json(Object.values(SUBSCRIPTION_PLANS))
}
