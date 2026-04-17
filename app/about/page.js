import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Heart, Globe, Users } from 'lucide-react'

export const metadata = {
  title: 'About — Pluto',
}

const values = [
  { icon: Heart, title: 'Passion-driven', desc: 'We genuinely care about helping brands succeed.' },
  { icon: Globe, title: 'Built for growth', desc: 'Every tool is designed with scale and speed in mind.' },
  { icon: Users, title: 'Creator-first', desc: 'Made by people who understand the creator economy.' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-14">
      <div className="mx-auto max-w-3xl px-4 py-20">
        {/* Header */}
        <div className="mb-16 text-center animate-fade-up">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs text-accent">
            Our story
          </div>
          <h1 className="mb-4 text-4xl font-bold sm:text-5xl">
            We're building the{' '}
            <span className="gradient-text">future of marketing</span>
          </h1>
          <p className="text-lg text-[#666] leading-relaxed">
            Pluto was born from a simple frustration — content creation takes too long and costs too much. We're here to fix that.
          </p>
        </div>

        {/* Story */}
        <div className="mb-16 rounded-2xl border border-[#1e1e1e] bg-[#111111] p-8 space-y-4">
          <p className="text-[#aaa] leading-relaxed">
            Pluto Marketing is a digital agency and SaaS platform built for modern brands and content creators in Bangladesh and beyond. We understand the grind — deadlines, revisions, and the constant pressure to produce fresh content.
          </p>
          <p className="text-[#aaa] leading-relaxed">
            That's why we built Pluto: a platform that combines human creativity with AI efficiency. Whether you need captions, ad copy, or a full content strategy — we've got you covered.
          </p>
          <p className="text-[#aaa] leading-relaxed">
            We're sharp, we're minimal, and we move fast. Just like your content should.
          </p>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="mb-8 text-2xl font-bold text-center">What drives us</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {values.map((v) => (
              <div
                key={v.title}
                className="rounded-2xl border border-[#1e1e1e] bg-[#111111] p-5 text-center hover:border-[#2a2a2a] transition-all"
              >
                <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <v.icon size={16} />
                </div>
                <h3 className="mb-1 font-semibold text-sm text-white">{v.title}</h3>
                <p className="text-xs text-[#666]">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/signup">
            <Button size="lg" className="gap-2 group">
              Join Pluto
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
