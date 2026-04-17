import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ToolCard from '@/components/ToolCard'
import { Sparkles, Hash, Megaphone, Video, AtSign, FileText } from 'lucide-react'

export const metadata = {
  title: 'Tools — Pluto',
}

const tools = [
  {
    id: 'caption',
    icon: Sparkles,
    title: 'Instagram Caption Generator',
    description: 'Generate scroll-stopping captions for any post.',
    placeholder: 'e.g. New product launch, summer vibe...',
  },
  {
    id: 'hashtag',
    icon: Hash,
    title: 'Hashtag Generator',
    description: 'Get a curated set of hashtags to maximize reach.',
    placeholder: 'e.g. Fitness, lifestyle, motivation...',
  },
  {
    id: 'adcopy',
    icon: Megaphone,
    title: 'Ad Copy Generator',
    description: 'High-converting ad copy for Facebook & Instagram.',
    placeholder: 'e.g. Clothing brand, limited time offer...',
  },
  {
    id: 'script',
    icon: Video,
    title: 'Video Script Generator',
    description: 'Short-form scripts for Reels and TikToks.',
    placeholder: 'e.g. Product reveal, tutorial, story...',
  },
  {
    id: 'bio',
    icon: AtSign,
    title: 'Bio Generator',
    description: 'Craft the perfect social media bio in seconds.',
    placeholder: 'e.g. Fitness coach, online store, photographer...',
  },
  {
    id: 'blog',
    icon: FileText,
    title: 'Blog Intro Generator',
    description: 'Compelling intros that hook readers instantly.',
    placeholder: 'e.g. 5 ways to grow on Instagram in 2025...',
  },
]

export default async function ToolsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <div className="min-h-screen pt-14">
      <div className="mx-auto max-w-4xl px-4 py-12">
        {/* Header */}
        <div className="mb-10 animate-fade-up">
          <h1 className="mb-2 text-3xl font-bold text-white">
            Your Tools
          </h1>
          <p className="text-[#666]">
            Click any tool to expand it and generate content.{' '}
            <span className="text-accent">AI coming soon.</span>
          </p>
        </div>

        {/* Tools grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {tools.map((tool) => (
            <ToolCard
              key={tool.id}
              icon={tool.icon}
              title={tool.title}
              description={tool.description}
              placeholder={tool.placeholder}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
