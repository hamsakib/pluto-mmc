'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Instagram, Facebook, CheckCircle } from 'lucide-react'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="min-h-screen pt-14">
      <div className="mx-auto max-w-4xl px-4 py-20">
        {/* Header */}
        <div className="mb-16 text-center animate-fade-up">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs text-accent">
            Get in touch
          </div>
          <h1 className="mb-4 text-4xl font-bold sm:text-5xl">
            Let's <span className="gradient-text">talk</span>
          </h1>
          <p className="text-lg text-[#666]">
            Have a project? A question? Just want to say hi? We're here.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Contact info */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-[#1e1e1e] bg-[#111111] p-6">
              <h3 className="mb-4 font-semibold text-white">Find us online</h3>
              <div className="space-y-3">
                <a
                  href="mailto:hello@plutommc.com"
                  className="flex items-center gap-3 text-sm text-[#888] hover:text-white transition-colors group"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1a1a1a] group-hover:bg-accent/10 transition-colors">
                    <Mail size={14} className="group-hover:text-accent transition-colors" />
                  </div>
                  hello@plutommc.com
                </a>
                <a
                  href="https://www.facebook.com/plutommcbd/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 text-sm text-[#888] hover:text-white transition-colors group"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1a1a1a] group-hover:bg-accent/10 transition-colors">
                    <Facebook size={14} className="group-hover:text-accent transition-colors" />
                  </div>
                  @plutommcbd
                </a>
                <a
                  href="https://www.instagram.com/plutommcbd/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 text-sm text-[#888] hover:text-white transition-colors group"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1a1a1a] group-hover:bg-accent/10 transition-colors">
                    <Instagram size={14} className="group-hover:text-accent transition-colors" />
                  </div>
                  @plutommcbd
                </a>
                <a
                  href="https://www.tiktok.com/@plutommcbd"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 text-sm text-[#888] hover:text-white transition-colors group"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1a1a1a] group-hover:bg-accent/10 transition-colors text-xs font-bold">
                    TT
                  </div>
                  @plutommcbd
                </a>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="rounded-2xl border border-[#1e1e1e] bg-[#111111] p-6">
            {sent ? (
              <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                <CheckCircle size={40} className="text-accent mb-4" />
                <h3 className="font-semibold text-white mb-1">Message sent!</h3>
                <p className="text-sm text-[#666]">We'll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <textarea
                    id="message"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us about your project..."
                    rows={4}
                    required
                    className="w-full rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] px-4 py-2.5 text-sm text-white placeholder:text-[#555] transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 resize-none"
                  />
                </div>
                <Button type="submit" className="w-full">Send message</Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
