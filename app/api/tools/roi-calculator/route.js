import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateInsight } from '@/lib/anthropic'
import { connectDB } from '@/lib/mongoose'
import RoiCalculation from '@/models/RoiCalculation'
import { NextResponse } from 'next/server'

function calculateROI(inputs) {
  const { influencerFee, avgViews, ctr, conversionRate, productPrice } = inputs

  const estimatedClicks = avgViews * (ctr / 100)
  const estimatedConversions = estimatedClicks * (conversionRate / 100)
  const estimatedRevenue = estimatedConversions * productPrice
  const netProfit = estimatedRevenue - influencerFee
  const roiPercent = influencerFee > 0 ? (netProfit / influencerFee) * 100 : 0
  const breakEvenViews = influencerFee > 0
    ? Math.ceil(influencerFee / (productPrice * (conversionRate / 100) * (ctr / 100)))
    : 0
  const costPerView = avgViews > 0 ? influencerFee / avgViews : 0
  const costPerClick = estimatedClicks > 0 ? influencerFee / estimatedClicks : 0
  const costPerConversion = estimatedConversions > 0 ? influencerFee / estimatedConversions : 0

  return {
    estimatedReach: Math.round(avgViews),
    estimatedClicks: Math.round(estimatedClicks),
    estimatedConversions: Math.round(estimatedConversions),
    estimatedRevenue: Math.round(estimatedRevenue),
    netProfit: Math.round(netProfit),
    roiPercent: parseFloat(roiPercent.toFixed(1)),
    breakEvenViews,
    costPerView: parseFloat(costPerView.toFixed(2)),
    costPerClick: parseFloat(costPerClick.toFixed(2)),
    costPerConversion: parseFloat(costPerConversion.toFixed(2)),
    isPositive: netProfit > 0,
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions)

  const body = await request.json()
  const { influencerFee, avgViews, ctr = 2, conversionRate = 1, productPrice } = body

  if (!influencerFee || !avgViews || !productPrice) {
    return NextResponse.json({ error: 'influencerFee, avgViews, and productPrice are required.' }, { status: 400 })
  }

  const inputs = { influencerFee, avgViews, ctr, conversionRate, productPrice }
  const results = calculateROI(inputs)

  let tip = null
  if (!results.isPositive) {
    const neededCTR = influencerFee / (avgViews * (conversionRate / 100) * productPrice) * 100
    const neededConv = influencerFee / (avgViews * (ctr / 100) * productPrice) * 100

    const tipPrompt = `A marketing campaign has negative ROI. Help them understand what would make it break even.

Fee: ৳${influencerFee.toLocaleString()}
Avg views: ${avgViews.toLocaleString()}
Current CTR: ${ctr}%, Current conversion rate: ${conversionRate}%
Product price: ৳${productPrice.toLocaleString()}
Current ROI: ${results.roiPercent}%
Break-even needs: ${neededCTR.toFixed(1)}% CTR or ${neededConv.toFixed(1)}% conversion rate

Write 2 sentences: one explaining why it's negative, one practical suggestion to improve CTR or conversion to reach break-even.`

    tip = await generateInsight(tipPrompt).catch(() => null)
  }

  if (session?.user?.id) {
    await connectDB()
    await RoiCalculation.create({
      userId: session.user.id,
      inputsJson: inputs,
      resultsJson: { ...results, tip },
    })
  }

  return NextResponse.json({ inputs, results, tip })
}

// GET by shareToken — no auth required
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 })

  await connectDB()
  const calc = await RoiCalculation.findOne({ shareToken: token })
  if (!calc) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ inputs: calc.inputsJson, results: calc.resultsJson })
}

// Save share token
export async function PATCH(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { calcId } = await request.json()
  await connectDB()
  const calc = await RoiCalculation.findOne({ _id: calcId, userId: session.user.id })
  if (!calc) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ shareToken: calc.shareToken })
}
