import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Zap, Target, TrendingUp, Instagram, Facebook } from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'AI-Powered Tools',
    description: 'Generate captions, hashtags, and ad copy in seconds with intelligent automation.',
  },
  {
    icon: Target,
    title: 'Built for Brands',
    description: 'Designed for modern brands and creators who move fast and think sharp.',
  },
  {
    icon: TrendingUp,
    title: 'Grow Faster',
    description: 'Stop spending hours on content. Let Pluto handle the heavy lifting.',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-14 text-center overflow-hidden">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[500px] w-[500px] rounded-full bg-accent/10 blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-3xl animate-fade-up">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-sm text-accent">
            <Zap size={12} />
            <span>AI-powered marketing tools</span>
          </div>

          <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            Build smarter.{' '}
            <span className="gradient-text">Grow faster.</span>
          </h1>

          <p className="mx-auto mb-10 max-w-xl text-lg text-[#888] leading-relaxed">
            Pluto gives brands and creators the tools they need to create compelling content — fast, clean, and at scale.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup">
              <Button size="lg" className="gap-2 group">
                Get started free
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" size="lg">Learn more</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <h2 className="mb-3 text-3xl font-bold sm:text-4xl">
              Everything you need to{' '}
              <span className="gradient-text">dominate content</span>
            </h2>
            <p className="text-[#666] max-w-md mx-auto">
              Stop wasting time. Our tools are built for speed and results.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {features.map((feat) => (
              <div
                key={feat.title}
                className="rounded-2xl border border-[#1e1e1e] bg-[#111111] p-6 hover:border-[#2a2a2a] transition-all duration-200 group"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent group-hover:bg-accent/20 transition-colors">
                  <feat.icon size={20} />
                </div>
                <h3 className="mb-2 font-semibold text-white">{feat.title}</h3>
                <p className="text-sm text-[#666] leading-relaxed">{feat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <div className="rounded-2xl border border-accent/20 bg-accent/5 p-12">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Ready to level up?
            </h2>
            <p className="mb-8 text-[#888]">
              Join the brands and creators already using Pluto.
            </p>
            <Link href="/signup">
              <Button size="lg" className="gap-2 group">
                Start for free
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a] px-4 py-8">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#555]">© {new Date().getFullYear()} Pluto Marketing</p>
          <div className="flex items-center gap-4">
            <a
              href="https://www.facebook.com/plutommcbd/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-sm text-[#555] hover:text-white transition-colors"
            >
              <Facebook size={14} />
              <span>Facebook</span>
            </a>
            <a
              href="https://www.instagram.com/plutommcbd/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-sm text-[#555] hover:text-white transition-colors"
            >
              <Instagram size={14} />
              <span>Instagram</span>
            </a>
            <a
              href="https://www.tiktok.com/@plutommcbd"
              target="_blank"
              rel="noreferrer"
              className="text-sm text-[#555] hover:text-white transition-colors"
            >
              TikTok
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
