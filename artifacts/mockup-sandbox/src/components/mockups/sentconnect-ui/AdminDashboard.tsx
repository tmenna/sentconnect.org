import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Settings,
  Bell,
  Heart,
  MessageCircle,
  MoreVertical,
  Search,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

// Mock Data
const stats = [
  { label: 'Total Posts', value: '1,248' },
  { label: 'Team Members', value: '42' },
  { label: 'Countries', value: '14' },
];

const mockPosts = [
  {
    id: 1,
    author: 'Maria Santos',
    avatar: 'MS',
    content: 'Just finished our first community health clinic in the northern district. Over 150 families attended. The local volunteers were incredible!',
    timestamp: '2 hours ago',
    likes: 24,
    comments: 5
  },
  {
    id: 2,
    author: 'David Kim',
    avatar: 'DK',
    content: 'Setting up the new educational center materials today. Thanks to everyone who donated books and supplies. The kids are going to love this new space.',
    timestamp: '5 hours ago',
    likes: 41,
    comments: 12
  },
  {
    id: 3,
    author: 'Sarah Jenkins',
    avatar: 'SJ',
    content: 'Prayer request for our safe travel tomorrow as we head up into the mountain villages. The roads are rough after the recent rains.',
    timestamp: '1 day ago',
    likes: 89,
    comments: 22
  },
  {
    id: 4,
    author: 'James Osei',
    avatar: 'JO',
    content: 'Monthly team meeting notes have been uploaded to the shared drive. Great progress this month on our core initiatives!',
    timestamp: '2 days ago',
    likes: 15,
    comments: 1
  }
];

const mockTeam = [
  { id: 1, name: 'James Osei', role: 'admin', status: 'Active', joined: 'Oct 12, 2023', initials: 'JO' },
  { id: 2, name: 'Maria Santos', role: 'field_user', status: 'Active', joined: 'Nov 05, 2023', initials: 'MS' },
  { id: 3, name: 'David Kim', role: 'field_user', status: 'Active', joined: 'Jan 15, 2024', initials: 'DK' },
  { id: 4, name: 'Sarah Jenkins', role: 'field_user', status: 'Offline', joined: 'Feb 22, 2024', initials: 'SJ' },
];

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('updates');

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 flex" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar - 200px width */}
      <aside className="w-[200px] border-r border-[#F1F5F9] flex flex-col flex-shrink-0 bg-white">
        <div className="h-16 flex items-center px-6 border-b border-[#F1F5F9]">
          <span className="font-semibold text-sm tracking-tight">Calvary Community</span>
        </div>
        
        <nav className="flex-1 py-4 flex flex-col gap-1">
          <button 
            onClick={() => setActiveTab('updates')}
            className={`flex items-center px-6 py-2.5 text-[13px] transition-colors relative w-full text-left
              ${activeTab === 'updates' ? 'text-slate-900 font-medium' : 'text-slate-500 hover:text-slate-900'}`}
          >
            {activeTab === 'updates' && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#8705FA]" />}
            <LayoutDashboard className="w-4 h-4 mr-3" />
            Updates
          </button>
          <button 
            onClick={() => setActiveTab('team')}
            className={`flex items-center px-6 py-2.5 text-[13px] transition-colors relative w-full text-left
              ${activeTab === 'team' ? 'text-slate-900 font-medium' : 'text-slate-500 hover:text-slate-900'}`}
          >
            {activeTab === 'team' && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#8705FA]" />}
            <Users className="w-4 h-4 mr-3" />
            Team
          </button>
          <button 
            onClick={() => setActiveTab('branding')}
            className={`flex items-center px-6 py-2.5 text-[13px] transition-colors relative w-full text-left
              ${activeTab === 'branding' ? 'text-slate-900 font-medium' : 'text-slate-500 hover:text-slate-900'}`}
          >
            {activeTab === 'branding' && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#8705FA]" />}
            <Settings className="w-4 h-4 mr-3" />
            Branding
          </button>
        </nav>

        <div className="p-4 border-t border-[#F1F5F9]">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-slate-100 text-xs text-slate-600">JO</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-[13px] font-medium leading-none">James Osei</span>
              <span className="text-[11px] text-slate-500 mt-1">Admin</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Header */}
        <header className="h-16 border-b border-[#F1F5F9] flex items-center justify-between px-8 bg-white">
          <h1 className="text-[15px] font-medium">Dashboard Overview</h1>
          <div className="flex items-center gap-4 text-slate-400">
            <Search className="w-4 h-4 hover:text-slate-900 cursor-pointer transition-colors" />
            <Bell className="w-4 h-4 hover:text-slate-900 cursor-pointer transition-colors" />
          </div>
        </header>

        <div className="p-8 max-w-5xl w-full mx-auto flex-1 flex flex-col">
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            {stats.map((stat) => (
              <div key={stat.label} className="border border-[#F1F5F9] rounded-xl p-5 flex flex-col gap-1 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">{stat.label}</span>
                <span className="text-2xl font-semibold tracking-tight">{stat.value}</span>
              </div>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1">
            {activeTab === 'updates' && (
              <div className="flex flex-col gap-4">
                {mockPosts.map(post => (
                  <div key={post.id} className="group border border-[#F1F5F9] rounded-xl p-5 flex items-start gap-4 hover:shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-shadow">
                    <Avatar className="h-10 w-10 border border-[#F1F5F9]">
                      <AvatarFallback className="bg-slate-50 text-[13px] font-medium text-slate-700">{post.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[14px] font-semibold">{post.author}</span>
                        <span className="text-[12px] text-slate-400">{post.timestamp}</span>
                      </div>
                      <p className="text-[13px] text-slate-600 leading-relaxed mb-3 pr-8 truncate">
                        {post.content}
                      </p>
                      <div className="flex items-center gap-4 text-slate-400">
                        <div className="flex items-center gap-1.5 hover:text-slate-900 transition-colors cursor-pointer">
                          <Heart className="w-3.5 h-3.5" />
                          <span className="text-[12px] font-medium">{post.likes}</span>
                        </div>
                        <div className="flex items-center gap-1.5 hover:text-slate-900 transition-colors cursor-pointer">
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span className="text-[12px] font-medium">{post.comments}</span>
                        </div>
                      </div>
                    </div>
                    <button className="text-slate-300 hover:text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'team' && (
              <div className="border border-[#F1F5F9] rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                <table className="w-full text-[13px] text-left">
                  <thead className="bg-[#F8FAFC]/50 text-slate-500 font-medium">
                    <tr>
                      <th className="px-6 py-3 border-b border-[#F1F5F9] font-medium w-[40%]">Name</th>
                      <th className="px-6 py-3 border-b border-[#F1F5F9] font-medium">Role</th>
                      <th className="px-6 py-3 border-b border-[#F1F5F9] font-medium">Status</th>
                      <th className="px-6 py-3 border-b border-[#F1F5F9] font-medium text-right">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9]">
                    {mockTeam.map(member => (
                      <tr key={member.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-7 w-7">
                              <AvatarFallback className="bg-slate-100 text-[11px] text-slate-600">{member.initials}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-slate-900">{member.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-slate-600 font-mono text-[12px]">{member.role}</td>
                        <td className="px-6 py-3.5">
                          <span className="flex items-center gap-1.5 text-slate-600">
                            <span className={`w-1.5 h-1.5 rounded-full ${member.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                            {member.status}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right text-slate-500">{member.joined}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'branding' && (
              <div className="max-w-2xl">
                <h2 className="text-lg font-medium mb-6">Organization Branding</h2>
                <div className="space-y-8">
                  <div className="flex items-start gap-8 border-b border-[#F1F5F9] pb-8">
                    <div className="w-48 text-[13px] text-slate-600 font-medium">Logo</div>
                    <div className="flex-1 flex gap-4">
                      <div className="h-24 w-24 border border-[#F1F5F9] rounded-xl flex items-center justify-center bg-slate-50 text-slate-400">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm" className="w-fit text-[12px] h-8">Upload Logo</Button>
                        <span className="text-[11px] text-slate-400">Recommended: 512x512px PNG</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-8 pb-8">
                    <div className="w-48 text-[13px] text-slate-600 font-medium">Brand Color</div>
                    <div className="flex-1 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full border border-[#F1F5F9] shadow-sm flex items-center justify-center bg-[#8705FA]">
                        <CheckCircle2 className="w-4 h-4 text-white opacity-80" />
                      </div>
                      <div className="text-[13px] font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded border border-[#F1F5F9]">
                        #8705FA
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
