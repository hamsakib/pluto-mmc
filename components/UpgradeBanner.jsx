'use client'

import { Zap, X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function UpgradeBanner({ remaining, toolName, requiredPlan = 'pro' }) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  const isLastUse = remaining === 1
  const isOut = remaining === 0

  if (!isLastUse && !isOut) return null

  return (
    <div className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm border ${
      isOut
        ? 'bg-red-950/30 border-red-900/40 text-red-300'
        : 'bg-amber-950/30 border-amber-900/40 text-amber-300'
    }`}>
      <div className="flex items-center gap-2">
        <Zap size={15} className="shrink-0" />
        <span>
          {isOut
            ? "You've used all your free searches. Upgrade to continue."
            : "Last free search remaining — upgrade for unlimited access."}
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Link
          href="/pricing"
          className={`font-semibold hover:underline ${isOut ? 'text-red-200' : 'text-amber-200'}`}
        >
          Upgrade
        </Link>
        <button onClick={() => setDismissed(true)} className="opacity-50 hover:opacity-100">
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
