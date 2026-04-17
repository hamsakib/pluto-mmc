import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Zap, ArrowRight, Sparkles, Hash, Megaphone } from 'lucide-react'

export const metadata = {
  title: 'Dashboard — Pluto',
}

const quickTools = [
  { icon: Sparkles, label: 'Caption Generator', href: '/tools' },
  { icon: Hash, label: 'Hashtag Generator', href: '/tools' },
  { icon: Megaphone, label: 'Ad Copy', href: '/tools' },
]

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const firstName = session.user?.name?.split(' ')[0] || 'there'

  return (
    <div className="min-h-screen pt-14">
      <div className="mx-auto max-w-4xl px-4 py-12">
        {/* Welcome header */}
        <div className="mb-10 flex items-center gap-4 animate-fade-up">
          {session.user?.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name || 'User'}
              width={52}
              height={52}
              className="rounded-full ring-2 ring-[#2a2a2a]"
            />
          ) : (
            <div className="flex h-13 w-13 h-[52px] w-[52px] items-center justify-center rounded-full bg-accent text-lg font-bold text-white">
              {session.user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white">
              Hey, {firstName} 👋
            </h1>
            <p className="text-sm text-[#666]">{session.user?.email}</p>
          </div>
        </div>

        {/* Main CTA card */}
        <div className="mb-6 rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/10 to-transparent p-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent mb-4">
            <Zap size={18} className="text-white" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-white">Your tools are ready</h2>
          <p className="mb-5 text-sm text-[#888]">
            AI-powered content tools to grow your brand, faster.
          </p>
          <Link href="/tools">
            <Button size="lg" className="gap-2 group">
              Open Tools
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Quick access */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-[#555] uppercase tracking-wider">Quick access</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {quickTools.map((tool) => (
              <Link key={tool.label} href={tool.href}>
                <Card className="hover:border-[#2a2a2a] transition-all duration-200 cursor-pointer group hover:shadow-lg hover:shadow-black/30">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent group-hover:bg-accent/20 transition-colors flex-shrink-0">
                      <tool.icon size={15} />
                    </div>
                    <span className="text-sm text-white font-medium">{tool.label}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
