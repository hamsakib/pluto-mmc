'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ShieldCheck, Eye, EyeOff } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (searchParams.get('error') === 'unauthorized') {
      setError('Access denied. Admin privileges required.')
    }
  }, [searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    })

    setLoading(false)

    if (res?.error) {
      setError('Invalid email or password.')
    } else {
      router.push('/admin/dashboard')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-[#080808]">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-red-600/20 border border-red-600/30">
            <ShieldCheck size={20} className="text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Access</h1>
          <p className="mt-1 text-sm text-[#666]">Restricted — authorised personnel only</p>
        </div>

        <div className="rounded-2xl border border-[#1e1e1e] bg-[#111111] p-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#aaa] mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="admin@example.com"
                required
                autoComplete="email"
                className="w-full rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] px-3 py-2.5 text-sm text-white placeholder-[#444] focus:border-red-600/50 focus:outline-none focus:ring-1 focus:ring-red-600/30"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#aaa] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] px-3 py-2.5 pr-10 text-sm text-white placeholder-[#444] focus:border-red-600/50 focus:outline-none focus:ring-1 focus:ring-red-600/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#888] transition-colors"
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign in as Admin'}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-[#444]">
          Not an admin?{' '}
          <a href="/login" className="text-[#666] hover:text-[#888] transition-colors">
            Return to login
          </a>
        </p>
      </div>
    </div>
  )
}
