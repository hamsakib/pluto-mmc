'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react'

export default function ToolCard({ title, description, icon: Icon, placeholder }) {
  const [open, setOpen] = useState(false)
  const [topic, setTopic] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGenerate = () => {
    if (!topic.trim()) return
    setLoading(true)
    setTimeout(() => {
      setOutput('This is a demo output. Real AI coming soon.')
      setLoading(false)
    }, 900)
  }

  return (
    <Card className="hover:border-[#2a2a2a] transition-all duration-200 hover:shadow-lg hover:shadow-black/30">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Icon size={18} />
            </div>
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription className="mt-0.5">{description}</CardDescription>
            </div>
          </div>
          <button
            onClick={() => setOpen(!open)}
            className="text-[#555] hover:text-white transition-colors ml-2 flex-shrink-0"
            aria-label={open ? 'Collapse' : 'Try it'}
          >
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </CardHeader>

      {open && (
        <CardContent>
          <div className="space-y-3 pt-3 border-t border-[#1a1a1a]">
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={placeholder || 'Enter your topic...'}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
            <Button
              onClick={handleGenerate}
              disabled={loading || !topic.trim()}
              className="w-full gap-2"
            >
              <Sparkles size={14} />
              {loading ? 'Generating...' : 'Generate'}
            </Button>
            {output && (
              <div className="rounded-xl bg-[#0a0a0a] border border-[#1e1e1e] p-4 text-sm text-[#aaa] leading-relaxed">
                {output}
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
