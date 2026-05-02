import React, { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Heart, 
  MessageSquare, 
  Share, 
  Download, 
  Image as ImageIcon,
  MapPin,
  MoreHorizontal
} from "lucide-react";

// Fake data
const POSTS = [
  {
    id: "1",
    author: "Sarah Jenkins",
    initials: "SJ",
    time: "2 hours ago",
    location: "Nairobi, Kenya",
    content: "Just finished an amazing week at the youth leadership conference. The engagement from the local community leaders was beyond anything we expected. We saw over 50 young adults commit to leading community outreach programs in their respective neighborhoods.",
    likes: 24,
    comments: 5,
    isMissionMoment: true,
  },
  {
    id: "2",
    author: "David Chen",
    initials: "DC",
    time: "5 hours ago",
    content: "Please pray for safe travels as our team moves to the northern province tomorrow. The roads have been heavily affected by recent rains.",
    likes: 12,
    comments: 8,
    isMissionMoment: false,
  },
  {
    id: "3",
    author: "Elena Rodriguez",
    initials: "ER",
    time: "Yesterday",
    location: "Lima, Peru",
    content: "We finally secured the permit for the new community center! This has been a 6-month journey of paperwork and meetings. Construction starts next week.",
    likes: 89,
    comments: 14,
    isMissionMoment: true,
  }
];

export function RenderStyle() {
  const [activeTab, setActiveTab] = useState<"all" | "moments">("all");
  const [postContent, setPostContent] = useState("");

  const filteredPosts = activeTab === "all" ? POSTS : POSTS.filter(p => p.isMissionMoment);

  return (
    <div className="min-h-[100dvh] bg-[#f9fafb] font-sans text-[#111827]">
      {/* Top Nav */}
      <nav className="sticky top-0 z-50 bg-white border-b border-[#e5e7eb] px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#2563eb] rounded flex items-center justify-center text-white font-bold text-xs">
            SC
          </div>
          <span className="font-semibold text-sm tracking-tight">SentConnect</span>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <a href="#" className="text-[#111827] font-medium">Feed</a>
          <a href="#" className="text-[#6b7280] hover:text-[#111827] transition-colors">Directory</a>
          <a href="#" className="text-[#6b7280] hover:text-[#111827] transition-colors">Resources</a>
          <Avatar className="w-7 h-7 ml-2 border border-[#e5e7eb]">
            <AvatarFallback className="text-xs bg-[#f9fafb] text-[#6b7280]">JD</AvatarFallback>
          </Avatar>
        </div>
      </nav>

      <main className="max-w-[720px] mx-auto pt-12 pb-24 px-4 sm:px-0">
        
        {/* Header & Stats */}
        <div className="mb-12">
          <h1 className="text-3xl font-semibold tracking-tight text-[#111827] mb-2">Missions Feed</h1>
          <p className="text-[#6b7280] text-sm mb-6">Updates and prayer requests from the field.</p>
          
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-[#e5e7eb] bg-white text-xs font-medium text-[#6b7280]">
              <span className="text-[#111827] font-semibold mr-1.5">342</span> Total Posts
            </div>
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-[#e5e7eb] bg-white text-xs font-medium text-[#6b7280]">
              <span className="text-[#111827] font-semibold mr-1.5">89</span> Mission Moments
            </div>
          </div>
        </div>

        {/* Composer */}
        <div className="mb-10 bg-white border border-[#e5e7eb] rounded-lg p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] focus-within:ring-1 focus-within:ring-[#2563eb] focus-within:border-[#2563eb] transition-all">
          <textarea
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder="Share an update, prayer request, or mission moment..."
            className="w-full resize-none border-0 bg-transparent p-0 text-sm placeholder:text-[#9ca3af] focus:ring-0 min-h-[60px]"
          />
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#f0f0f0]">
            <div className="flex items-center gap-1">
              <button className="p-1.5 text-[#6b7280] hover:text-[#111827] hover:bg-[#f3f4f6] rounded transition-colors">
                <ImageIcon className="w-4 h-4" />
              </button>
              <button className="p-1.5 text-[#6b7280] hover:text-[#111827] hover:bg-[#f3f4f6] rounded transition-colors">
                <MapPin className="w-4 h-4" />
              </button>
            </div>
            <button 
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${
                postContent.trim() 
                  ? "bg-[#2563eb] text-white hover:bg-blue-700 shadow-sm" 
                  : "bg-[#f3f4f6] text-[#9ca3af] cursor-not-allowed"
              }`}
            >
              Post
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-[#e5e7eb] mb-8">
          <button
            onClick={() => setActiveTab("all")}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              activeTab === "all" ? "text-[#111827]" : "text-[#6b7280] hover:text-[#111827]"
            }`}
          >
            All Posts
            {activeTab === "all" && (
              <div className="absolute bottom-[-1px] left-0 right-0 h-[1.5px] bg-[#111827]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("moments")}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              activeTab === "moments" ? "text-[#111827]" : "text-[#6b7280] hover:text-[#111827]"
            }`}
          >
            Mission Moments
            {activeTab === "moments" && (
              <div className="absolute bottom-[-1px] left-0 right-0 h-[1.5px] bg-[#111827]" />
            )}
          </button>
        </div>

        {/* Feed */}
        <div className="flex flex-col">
          {filteredPosts.map((post) => (
            <div 
              key={post.id} 
              className="py-6 border-b border-[#f0f0f0] hover:bg-[#fafafa] transition-colors -mx-4 px-4 sm:-mx-6 sm:px-6"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-9 h-9 border border-[#e5e7eb]">
                    <AvatarFallback className="text-xs bg-white text-[#4b5563] font-medium">
                      {post.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-[#111827] flex items-center gap-2">
                      {post.author}
                      {post.isMissionMoment && (
                        <span className="text-[10px] font-semibold tracking-wider uppercase text-[#2563eb] bg-blue-50 px-1.5 py-0.5 rounded">
                          Moment
                        </span>
                      )}
                    </span>
                    <div className="flex items-center text-xs text-[#6b7280] gap-1.5">
                      <span>{post.time}</span>
                      {post.location && (
                        <>
                          <span>·</span>
                          <span>{post.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <button className="text-[#9ca3af] hover:text-[#111827] p-1 rounded hover:bg-[#f3f4f6] transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
              
              <p className="text-sm text-[#374151] leading-relaxed mb-4 whitespace-pre-wrap">
                {post.content}
              </p>

              <div className="flex items-center gap-4 text-[#6b7280]">
                <button className="flex items-center gap-1.5 text-xs font-medium hover:text-[#111827] transition-colors">
                  <Heart className="w-3.5 h-3.5" />
                  {post.likes}
                </button>
                <button className="flex items-center gap-1.5 text-xs font-medium hover:text-[#111827] transition-colors">
                  <MessageSquare className="w-3.5 h-3.5" />
                  {post.comments}
                </button>
                <div className="flex-1" />
                <button className="flex items-center gap-1.5 text-xs font-medium hover:text-[#111827] transition-colors">
                  <Share className="w-3.5 h-3.5" />
                  Share
                </button>
                <button className="flex items-center gap-1.5 text-xs font-medium hover:text-[#111827] transition-colors">
                  <Download className="w-3.5 h-3.5" />
                  Export
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
