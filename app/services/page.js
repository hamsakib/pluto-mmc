import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Pen, Hash, Megaphone, Video, BarChart, Palette } from 'lucide-react'

export const metadata = {
  title: 'Services — Pluto',
}

const services = [
  {
    icon: Pen,
    title: 'Content Writing',
    description: 'Sharp, scroll-stopping captions and copy for every platform.',
    tag: 'Popular',
  },
  {
    icon: Hash,
    title: 'Hashtag Strategy',
    description: 'Data-driven hashtag sets that expand your reach organically.',
    tag: null,
  },
  {
    icon: Megaphone,
    title: 'Ad Copywriting',
    description: 'High-converting ad copy for Facebook, Instagram, and TikTok campaigns.',
    tag: 'Popular',
  },
  {
    icon: Video,
    title: 'Video Script',
    description: 'Engaging scripts for Reels, TikToks, and YouTube Shorts.',
    tag: 'New',
  },
  {
    icon: BarChart,
    title: 'Analytics Review',
    description: "Understand what's working and double down on winning content.",
    tag: null,
  },
  {
    icon: Palette,
    title: 'Brand Voice',
    description: "Define your brand's tone and maintain consistency across all content.",
    tag: null,
  },
]

export default function ServicesPage() {
  return (
    <div className="min-h-screen pt-14">
      <div className="mx-auto max-w-5xl px-4 py-20">
        {/* Header */}
        <div className="mb-16 text-center animate-fade-up">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs text-accent">
            What we offer
          </div>
          <h1 className="mb-4 text-4xl font-bold sm:text-5xl">
            Tools & services that{' '}
            <span className="gradient-text">actually work</span>
          </h1>
          <p className="text-lg text-[#666] max-w-lg mx-auto">
            No fluff, no bloat. Everything you need to create great content and grow your audience.
          </p>
        </div>

        {/* Services grid */}
        <div className="mb-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div
              key={s.title}
              className="group relative rounded-2xl border border-[#1e1e1e] bg-[#111111] p-6 hover:border-[#2a2a2a] transition-all duration-200 hover:shadow-lg hover:shadow-black/30"
            >
              {s.tag && (
                <span className="absolute right-4 top-4 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                  {s.tag}
                </span>
              )}
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent group-hover:bg-accent/20 transition-colors">
                <s.icon size={18} />
              </div>
              <h3 className="mb-2 font-semibold text-white">{s.title}</h3>
              <p className="text-sm text-[#666] leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center rounded-2xl border border-accent/20 bg-accent/5 p-10">
          <h2 className="mb-2 text-2xl font-bold">Ready to get started?</h2>
          <p className="mb-6 text-[#666]">Sign up and try our tools for free.</p>
          <Link href="/signup">
            <Button size="lg" className="gap-2 group">
              Get started
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
