'use client'

import { Users, Eye, Heart, MessageCircle, TrendingUp, Calendar, Award, AlertTriangle } from 'lucide-react'
import PdfExportButton from './PdfExportButton'

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className="text-accent" />
        <span className="text-xs text-[#888]">{label}</span>
      </div>
      <div className="text-xl font-bold text-white">{value}</div>
      {sub && <div className="text-xs text-[#555] mt-0.5">{sub}</div>}
    </div>
  )
}

function fmt(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n?.toLocaleString() ?? '—'
}

export default function CreatorReport({ data, insight }) {
  if (!data) return null
  const {
    username, platform, followerCount, avgViews, avgLikes, avgComments,
    engagementRate, viewsToFollowerRatio, postingFrequency, totalPostsAnalyzed,
    bestPost, worstPost,
  } = data

  return (
    <div id="creator-report" className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">@{username}</h2>
          <p className="text-xs text-[#888] capitalize">{platform} · {totalPostsAnalyzed} posts analyzed</p>
        </div>
        <PdfExportButton targetId="creator-report" filename={`creator-${username}`} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Followers" value={fmt(followerCount)} />
        <StatCard icon={Eye} label="Avg Views" value={fmt(avgViews)} />
        <StatCard icon={Heart} label="Avg Likes" value={fmt(avgLikes)} />
        <StatCard icon={MessageCircle} label="Avg Comments" value={fmt(avgComments)} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard
          icon={TrendingUp}
          label="Engagement Rate"
          value={`${engagementRate}%`}
          sub="(likes + comments) / followers"
        />
        <StatCard
          icon={Eye}
          label="Views / Follower Ratio"
          value={`${viewsToFollowerRatio}%`}
          sub="avg views ÷ followers"
        />
        <StatCard
          icon={Calendar}
          label="Posting Frequency"
          value={postingFrequency ? `${postingFrequency}×/wk` : '—'}
          sub="posts per week"
        />
      </div>

      {(bestPost || worstPost) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {bestPost && (
            <div className="bg-green-950/20 border border-green-900/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award size={14} className="text-green-400" />
                <span className="text-xs text-green-400 font-medium">Best Performing Post</span>
              </div>
              <div className="text-sm text-[#ccc]">
                {fmt(bestPost.likes)} likes · {fmt(bestPost.comments)} comments
                {bestPost.views ? ` · ${fmt(bestPost.views)} views` : ''}
              </div>
              {bestPost.url && (
                <a href={bestPost.url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-accent hover:underline mt-1 block">
                  View post →
                </a>
              )}
            </div>
          )}
          {worstPost && (
            <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={14} className="text-red-400" />
                <span className="text-xs text-red-400 font-medium">Lowest Performing Post</span>
              </div>
              <div className="text-sm text-[#ccc]">
                {fmt(worstPost.likes)} likes · {fmt(worstPost.comments)} comments
                {worstPost.views ? ` · ${fmt(worstPost.views)} views` : ''}
              </div>
              {worstPost.url && (
                <a href={worstPost.url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-accent hover:underline mt-1 block">
                  View post →
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {insight && (
        <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
          <p className="text-xs text-accent font-medium mb-1.5">AI Insight</p>
          <p className="text-sm text-[#ccc] leading-relaxed">{insight}</p>
        </div>
      )}
    </div>
  )
}
