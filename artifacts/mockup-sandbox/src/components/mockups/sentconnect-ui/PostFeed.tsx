import React, { useState } from 'react';
import { Image as ImageIcon, MapPin, Star, Heart, MessageCircle, MoreHorizontal } from 'lucide-react';

interface Post {
  id: string;
  author: {
    name: string;
    initials: string;
    avatarColor: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
  hasPhoto?: boolean;
  isHighlighted?: boolean;
  reachCount?: number;
}

const POSTS: Post[] = [
  {
    id: '1',
    author: { name: 'James Osei', initials: 'JO', avatarColor: 'bg-blue-100 text-blue-700' },
    content: 'Just finished our first community outreach meeting in Accra. The response was overwhelming. Many families showed up despite the heavy rain this morning.',
    timestamp: '2h ago',
    likes: 24,
    comments: 5,
    hasPhoto: true,
    isHighlighted: true,
    reachCount: 12
  },
  {
    id: '2',
    author: { name: 'Maria Santos', initials: 'MS', avatarColor: 'bg-emerald-100 text-emerald-700' },
    content: 'The youth group in Manila is growing so fast! We had 40 students attend our leadership workshop today. We are praying for wisdom as we guide these future leaders.',
    timestamp: '5h ago',
    likes: 56,
    comments: 12,
    isLiked: true
  },
  {
    id: '3',
    author: { name: 'David Kim', initials: 'DK', avatarColor: 'bg-purple-100 text-purple-700' },
    content: 'Arrived safely in Bogotá. The team here has been incredibly welcoming. Started planning the medical clinic for next week. Please pray for logistics to come together smoothly.',
    timestamp: '1d ago',
    likes: 18,
    comments: 2
  }
];

export function PostFeed() {
  const [postText, setPostText] = useState('');
  const [posts, setPosts] = useState(POSTS);

  const toggleLike = (id: string) => {
    setPosts(posts.map(p => 
      p.id === id 
        ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
        : p
    ));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 font-sans">
      <div className="mx-auto max-w-[680px] px-4 space-y-6">
        
        {/* Composer */}
        <div className="bg-white rounded-[16px] border border-gray-200 shadow-sm shadow-gray-100/50 p-4">
          <div className="flex gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600 shrink-0">
              ME
            </div>
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="Share an update…"
              className="w-full resize-none outline-none pt-2 text-[15px] placeholder:text-gray-400 min-h-[60px]"
            />
          </div>
          <div className="h-[1px] bg-gray-100 mb-3" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-gray-50 text-slate-500 transition-colors">
                <ImageIcon size={16} />
                <span className="text-xs font-medium">Photo</span>
              </button>
              <button className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-gray-50 text-slate-500 transition-colors">
                <MapPin size={16} />
                <span className="text-xs font-medium">Location</span>
              </button>
              <button className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-gray-50 text-slate-500 transition-colors">
                <Star size={16} />
                <span className="text-xs font-medium">Highlight</span>
              </button>
            </div>
            <button 
              disabled={!postText.trim()}
              className="bg-[#0f0f13] text-white px-4 h-[34px] rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              Post
            </button>
          </div>
        </div>

        {/* Feed */}
        <div className="space-y-4">
          {posts.map((post) => (
            <div 
              key={post.id} 
              className={`bg-white rounded-[12px] border border-gray-200 shadow-sm shadow-gray-100/50 p-4 ${post.isHighlighted ? 'border-l-[2px] border-l-amber-500' : ''}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${post.author.avatarColor}`}>
                    {post.author.initials}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 text-[14px]">{post.author.name}</span>
                    {post.reachCount && (
                      <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-[10px] font-medium leading-none">
                        {post.reachCount} people reached
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-[11px] text-gray-500">{post.timestamp}</span>
              </div>
              
              <div className="text-[14px] text-gray-700 leading-relaxed mb-3 line-clamp-3">
                {post.content}
              </div>

              {post.hasPhoto && (
                <div className="w-full h-[200px] bg-gray-50 rounded-lg mb-3 flex items-center justify-center border border-gray-100">
                  <ImageIcon size={24} className="text-gray-300" />
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => toggleLike(post.id)}
                    className={`flex items-center gap-1.5 text-sm transition-colors ${post.isLiked ? 'text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <Heart size={16} className={post.isLiked ? 'fill-current' : ''} />
                    <span className="font-medium">{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                    <MessageCircle size={16} />
                    <span className="font-medium">{post.comments}</span>
                  </button>
                </div>
                <button className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
