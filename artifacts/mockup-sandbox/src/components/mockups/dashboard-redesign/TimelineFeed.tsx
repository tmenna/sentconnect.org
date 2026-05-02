import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Download, MoreHorizontal, Image as ImageIcon, Link as LinkIcon, Paperclip, Send } from 'lucide-react';

// Using inline styles to override Tailwind where specific exact hex colors are needed, 
// or extending Tailwind arbitrary values.
const COLORS = {
  bg: '#fafaf8',
  surface: '#ffffff',
  text: '#1a1a1a',
  muted: '#71717a',
  separator: '#e4e4e7',
  accent: '#0047A8',
};

const POSTS = [
  {
    id: 1,
    author: 'Sarah Jenkins',
    initials: 'SJ',
    time: '2 hours ago',
    location: 'Nairobi, Kenya',
    isMissionMoment: false,
    content: `This week we had the incredible opportunity to host a youth leadership workshop in the Kibera community. Over 50 young adults showed up, eager to learn and connect. We discussed topics ranging from community organizing to personal faith journeys.\n\nIt's always humbling to see how much passion these young leaders have for their neighborhoods. Please pray for continued guidance as we plan follow-up sessions next month.`,
    likes: 12,
    comments: 3,
  },
  {
    id: 2,
    author: 'David Chen',
    initials: 'DC',
    time: 'Yesterday at 4:30 PM',
    location: 'Taipei, Japan',
    isMissionMoment: true,
    content: `A true Mission Moment today! We've been working with a local university student named Lin for over six months. She's been attending our English conversation groups but was initially very hesitant to join the faith discussions.\n\nToday, after our session, she pulled me aside and shared that she's been reading the materials we provided and wants to start attending the Sunday gatherings. This is a huge step for her, and we are praising God for this breakthrough!`,
    likes: 45,
    comments: 14,
  },
  {
    id: 3,
    author: 'The Martinez Family',
    initials: 'TM',
    time: 'Oct 12, 2023',
    location: 'Bogotá, Colombia',
    isMissionMoment: false,
    content: `Update on the community center renovations: the roof is finally finished! We've had several weeks of delays due to unexpected heavy rains, but the local contracting team pushed through and did an amazing job.\n\nNow we're moving on to the interior painting and setting up the classrooms. We're hoping to open the doors by the first week of November. Thank you to everyone who contributed to the building fund.`,
    likes: 28,
    comments: 5,
  }
];

export function TimelineFeed() {
  const [activeTab, setActiveTab] = useState<'all' | 'moments'>('all');
  const [postText, setPostText] = useState('');

  const filteredPosts = activeTab === 'all' ? POSTS : POSTS.filter(p => p.isMissionMoment);

  return (
    <div 
      className="min-h-screen w-full font-sans antialiased" 
      style={{ backgroundColor: COLORS.bg, color: COLORS.text }}
    >
      {/* Top Nav - Thin Strip */}
      <header 
        className="sticky top-0 z-50 w-full border-b"
        style={{ backgroundColor: COLORS.surface, borderColor: COLORS.separator }}
      >
        <div className="mx-auto flex h-12 max-w-[680px] items-center justify-between px-4 sm:px-0">
          <div className="flex items-center gap-2">
            <div 
              className="flex h-6 w-6 items-center justify-center rounded-sm font-bold text-white text-xs"
              style={{ backgroundColor: COLORS.accent }}
            >
              SC
            </div>
            <span className="font-semibold text-sm tracking-tight">SentConnect</span>
          </div>
          <nav className="flex items-center gap-4 text-sm font-medium" style={{ color: COLORS.muted }}>
            <a href="#" className="hover:text-black transition-colors" style={{ color: COLORS.text }}>Dashboard</a>
            <a href="#" className="hover:text-black transition-colors">Directory</a>
            <a href="#" className="hover:text-black transition-colors">Resources</a>
            <div className="ml-2 h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
              ME
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-[680px] px-4 py-12 sm:px-0">
        
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Missions Feed</h1>
          <p className="text-base mb-6" style={{ color: COLORS.muted }}>
            Updates, stories, and prayer requests from the field.
          </p>

          {/* Stats - Lightweight Pills */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border px-3 py-1 text-sm bg-white" style={{ borderColor: COLORS.separator }}>
              <span style={{ color: COLORS.muted }}>Total Posts</span>
              <span className="font-medium">1,248</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border px-3 py-1 text-sm bg-white" style={{ borderColor: COLORS.separator }}>
              <span style={{ color: COLORS.muted }}>Mission Moments</span>
              <span className="font-medium">342</span>
            </div>
          </div>
        </div>

        {/* Composer */}
        <div className="mb-8">
          <div 
            className="rounded-xl border bg-white p-1 focus-within:ring-1 focus-within:ring-blue-500 transition-shadow"
            style={{ borderColor: COLORS.separator }}
          >
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="Share an update or a Mission Moment..."
              className="w-full resize-none bg-transparent p-3 text-base outline-none placeholder:text-gray-400"
              rows={3}
            />
            <div className="flex items-center justify-between border-t px-2 py-2" style={{ borderColor: COLORS.separator }}>
              <div className="flex items-center gap-1">
                <button className="rounded-md p-2 hover:bg-gray-100 text-gray-500 transition-colors">
                  <ImageIcon className="h-4 w-4" />
                </button>
                <button className="rounded-md p-2 hover:bg-gray-100 text-gray-500 transition-colors">
                  <LinkIcon className="h-4 w-4" />
                </button>
                <button className="rounded-md p-2 hover:bg-gray-100 text-gray-500 transition-colors">
                  <Paperclip className="h-4 w-4" />
                </button>
              </div>
              <button 
                className="flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: COLORS.accent }}
                disabled={!postText.trim()}
              >
                <span>Post Update</span>
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 flex items-center gap-2 border-b pb-4" style={{ borderColor: COLORS.separator }}>
          <button
            onClick={() => setActiveTab('all')}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'all' 
                ? 'text-white' 
                : 'text-gray-600 hover:bg-gray-200'
            }`}
            style={activeTab === 'all' ? { backgroundColor: COLORS.accent } : { backgroundColor: '#f4f4f5' }}
          >
            All Posts
          </button>
          <button
            onClick={() => setActiveTab('moments')}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'moments' 
                ? 'text-white' 
                : 'text-gray-600 hover:bg-gray-200'
            }`}
            style={activeTab === 'moments' ? { backgroundColor: COLORS.accent } : { backgroundColor: '#f4f4f5' }}
          >
            Mission Moments
          </button>
        </div>

        {/* Feed */}
        <div className="space-y-10">
          {filteredPosts.map((post, index) => (
            <article 
              key={post.id} 
              className={`relative ${post.isMissionMoment ? 'pl-5' : ''}`}
            >
              {/* Left Accent Line for Mission Moments */}
              {post.isMissionMoment && (
                <div 
                  className="absolute bottom-0 left-0 top-0 w-1 rounded-full" 
                  style={{ backgroundColor: COLORS.accent }}
                />
              )}

              {/* Author Metadata */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600">
                    {post.initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-base">{post.author}</span>
                      {post.isMissionMoment && (
                        <span 
                          className="rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{ backgroundColor: '#eff6ff', color: COLORS.accent }}
                        >
                          Mission Moment
                        </span>
                      )}
                    </div>
                    <div className="text-sm" style={{ color: COLORS.muted }}>
                      {post.time} {post.location && `· ${post.location}`}
                    </div>
                  </div>
                </div>
                <button className="rounded-full p-2 hover:bg-gray-100 transition-colors" style={{ color: COLORS.muted }}>
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>

              {/* Body Text */}
              <div 
                className="mb-5 whitespace-pre-wrap text-[17px] leading-[1.7]"
              >
                {post.content}
              </div>

              {/* Action Row */}
              <div className="flex items-center gap-6 text-sm font-medium" style={{ color: COLORS.muted }}>
                <button className="flex items-center gap-1.5 hover:text-black transition-colors">
                  <Heart className="h-4 w-4" />
                  <span>{post.likes}</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-black transition-colors">
                  <MessageCircle className="h-4 w-4" />
                  <span>{post.comments}</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-black transition-colors">
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </button>
                <div className="flex-1" />
                <button className="flex items-center gap-1.5 hover:text-black transition-colors">
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </button>
              </div>

              {/* Soft Separator between posts (except last) */}
              {index < filteredPosts.length - 1 && (
                <hr className="mt-10 border-t" style={{ borderColor: COLORS.separator }} />
              )}
            </article>
          ))}

          {filteredPosts.length === 0 && (
            <div className="py-12 text-center" style={{ color: COLORS.muted }}>
              No posts found.
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
