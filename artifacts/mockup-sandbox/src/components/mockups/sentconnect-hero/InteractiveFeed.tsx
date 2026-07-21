import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, MoreHorizontal, Image as ImageIcon, Smile, Send, MapPin } from 'lucide-react';

// Types
type Post = {
  id: string;
  author: {
    name: string;
    initials: string;
    avatarColor: string;
  };
  location: string;
  time: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  isLiked: boolean;
};

// Initial Data
const INITIAL_POSTS: Post[] = [
  {
    id: '0',
    author: { name: 'Grace Adeyemi', initials: 'GA', avatarColor: 'bg-rose-500' },
    location: 'Jos, Nigeria',
    time: '1h ago',
    content: 'For two weeks in January, we gathered 18 young leaders from five different villages. These leaders wake before dawn to study. They argued passionately over Scripture. One young woman, Adaeze, is leading a fellowship of 34 women in her village.',
    likes: 19,
    comments: 4,
    isLiked: false,
  },
  {
    id: '1',
    author: { name: 'Maria Gonzalez', initials: 'MG', avatarColor: 'bg-emerald-500' },
    location: 'Kigali, Rwanda',
    time: '2h ago',
    content: 'Praise God for an amazing youth outreach! The kids loved the new soccer gear. We shared a simple message about hope and community, and the response was overwhelming. Thank you for making this possible.',
    image: 'url(/__mockup/images/youth-program.png) center/cover no-repeat',
    likes: 12,
    comments: 3,
    isLiked: false,
  },
  {
    id: '2',
    author: { name: 'James Okafor', initials: 'JO', avatarColor: 'bg-blue-500' },
    location: 'Chiang Mai, Thailand',
    time: '5h ago',
    content: 'Met with local pastors today to plan the upcoming leadership training seminar. They are so hungry for resources and fellowship. Please pray for wisdom as we finalize the curriculum.',
    likes: 24,
    comments: 5,
    isLiked: true,
  },
  {
    id: '3',
    author: { name: 'David Kim', initials: 'DK', avatarColor: 'bg-violet-500' },
    location: 'Nairobi, Rwanda',
    time: '1d ago',
    content: 'Our first day of the rural medical clinic was exhausting but incredibly rewarding. We treated over 100 patients and prayed with many families. The need is great, but we are so thankful for the opportunity to serve.',
    image: 'url(/__mockup/images/medical-outreach.png) center/cover no-repeat',
    likes: 31,
    comments: 8,
    isLiked: false,
  }
];

export function InteractiveFeed() {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [composerText, setComposerText] = useState('');
  const [composerStep, setComposerStep] = useState<'idle' | 'typing' | 'attaching' | 'publishing'>('idle');
  const feedRef = useRef<HTMLDivElement>(null);
  
  // Simulation Loop
  useEffect(() => {
    let isActive = true;
    
    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
    
    const runSimulation = async () => {
      while (isActive) {
        await sleep(3000);
        
        // Randomly like a post
        if (Math.random() > 0.5) {
          setPosts(prev => {
            const newPosts = [...prev];
            const targetIdx = Math.floor(Math.random() * (newPosts.length > 3 ? 3 : newPosts.length));
            if (!newPosts[targetIdx].isLiked) {
              newPosts[targetIdx] = {
                ...newPosts[targetIdx],
                likes: newPosts[targetIdx].likes + 1,
                isLiked: true
              };
            }
            return newPosts;
          });
        }

        // Auto scroll down slightly
        if (feedRef.current && composerStep === 'idle') {
          feedRef.current.scrollBy({ top: 100, behavior: 'smooth' });
        }

        await sleep(4000);
        
        // Start composing a new post
        setComposerStep('typing');
        const textToType = "We safely arrived this week and are partnering with a local church and community leaders to launch a clean water project outside Addis Ababa. The new well will provide safe drinking water for hundreds of people. Please keep the project and our team in your prayers.";
        for (let i = 0; i <= textToType.length; i += 3) {
          if (!isActive) return;
          setComposerText(textToType.substring(0, i));
          await sleep(20 + Math.random() * 30);
        }
        setComposerText(textToType);
        
        await sleep(1000);
        setComposerStep('attaching');
        
        await sleep(1500);
        setComposerStep('publishing');
        
        await sleep(800);
        
        // Add new post
        const newPost: Post = {
          id: Date.now().toString(),
          author: { name: 'Sarah Jenkins', initials: 'SJ', avatarColor: 'bg-amber-500' },
          location: 'Addis Ababa, Ethiopia',
          time: 'Just now',
          content: textToType,
          image: 'url(/__mockup/images/addis-well.png) center/cover no-repeat',
          likes: 0,
          comments: 0,
          isLiked: false,
        };
        
        setPosts(prev => [newPost, ...prev]);
        setComposerText('');
        setComposerStep('idle');
        
        // Scroll to top
        if (feedRef.current) {
          feedRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        await sleep(5000);
      }
    };
    
    runSimulation();
    
    return () => { isActive = false; };
  }, []);

  const handleLike = (id: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          likes: p.isLiked ? p.likes - 1 : p.likes + 1,
          isLiked: !p.isLiked
        };
      }
      return p;
    }));
  };

  return (
    <div className="w-[390px] h-[844px] bg-[#F8FAFC] flex flex-col font-sans overflow-hidden border border-slate-200 shadow-2xl rounded-[40px] mx-auto relative ring-8 ring-slate-100">
      {/* Header */}
      <div className="bg-[#1085FD] text-white pt-12 pb-4 px-5 flex flex-col z-10 shrink-0 shadow-sm relative">
        <div className="flex justify-between items-center mb-1">
          <div className="text-[11px] font-bold tracking-wider uppercase opacity-80">SentConnect</div>
          <div className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
            calvary.sentconnect.org
          </div>
        </div>
        <div className="text-xl font-bold">Missions Feed</div>
      </div>

      {/* Feed Area */}
      <div 
        ref={feedRef}
        className="flex-1 overflow-y-auto no-scrollbar pb-20 relative"
      >
        <div className="p-4 space-y-4">
          
          {/* Composer */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 relative">
            <div className="flex gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold shrink-0 text-sm">
                SJ
              </div>
              <div className="flex-1">
                <div className="h-10 text-slate-600 text-[15px] outline-none w-full bg-transparent pt-2">
                  {composerText || <span className="text-slate-400">Share an update...</span>}
                  {composerStep === 'typing' && (
                    <motion.span 
                      animate={{ opacity: [1, 0] }} 
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      className="inline-block w-0.5 h-4 bg-blue-500 ml-1 translate-y-1"
                    />
                  )}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {(composerStep === 'attaching' || composerStep === 'publishing') && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 120 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-3 rounded-xl overflow-hidden"
                >
                  <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' }} />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="flex gap-2 text-slate-400">
                <button className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors"><ImageIcon size={18} /></button>
                <button className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors"><Smile size={18} /></button>
              </div>
              <button 
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full font-semibold text-sm transition-colors ${
                  composerText.length > 0 
                    ? 'bg-[#1085FD] text-white' 
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {composerStep === 'publishing' ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <>Post <Send size={14} /></>
                )}
              </button>
            </div>
          </div>

          {/* Posts */}
          <AnimatePresence initial={false}>
            {posts.map((post) => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-3">
                    <div className={`w-10 h-10 rounded-full ${post.author.avatarColor} flex items-center justify-center text-white font-bold shrink-0 text-sm`}>
                      {post.author.initials}
                    </div>
                    <div>
                      <div className="font-bold text-[#0F172A] text-[15px]">{post.author.name}</div>
                      <div className="flex items-center gap-1 text-[12px] text-slate-500 mt-0.5">
                        <MapPin size={10} />
                        {post.location} • {post.time}
                      </div>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={20} /></button>
                </div>

                <p className="text-[#334155] text-[15px] leading-relaxed mb-3">
                  {post.content}
                </p>

                {post.image && (
                  <div 
                    className="w-full h-48 rounded-xl mb-3 border border-slate-100"
                    style={{ background: post.image }}
                  />
                )}

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-slate-500">
                  <button 
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-1.5 transition-colors text-sm font-medium ${post.isLiked ? 'text-pink-500' : 'hover:text-slate-700'}`}
                  >
                    <motion.div
                      animate={post.isLiked ? { scale: [1, 1.3, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      <Heart size={18} className={post.isLiked ? 'fill-current' : ''} />
                    </motion.div>
                    {post.likes}
                  </button>
                  <button className="flex items-center gap-1.5 hover:text-slate-700 text-sm font-medium transition-colors">
                    <MessageCircle size={18} />
                    {post.comments}
                  </button>
                  <button className="flex items-center gap-1.5 hover:text-slate-700 text-sm font-medium transition-colors">
                    <Share2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

        </div>
      </div>
      
      {/* Bottom Nav Mockup */}
      <div className="absolute bottom-0 left-0 right-0 h-[80px] bg-white border-t border-slate-100 flex items-start justify-around pt-3 px-6 pb-6 shadow-[0_-10px_20px_rgba(0,0,0,0.02)] z-10">
        <div className="flex flex-col items-center gap-1 text-[#1085FD]">
          <div className="w-6 h-6 rounded bg-[#1085FD]/10 flex items-center justify-center">
            <div className="w-3.5 h-3.5 rounded-sm border-2 border-[#1085FD]" />
          </div>
          <span className="text-[10px] font-semibold">Feed</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-slate-400">
          <div className="w-6 h-6 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          <span className="text-[10px] font-medium">Explore</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-slate-400">
          <div className="w-6 h-6 flex items-center justify-center relative">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
            <div className="absolute top-0.5 right-0.5 w-2 h-2 bg-pink-500 rounded-full border border-white" />
          </div>
          <span className="text-[10px] font-medium">Alerts</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-slate-400">
          <div className="w-6 h-6 flex items-center justify-center">
             <div className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center overflow-hidden">
               <div className="w-full h-full bg-slate-200" />
             </div>
          </div>
          <span className="text-[10px] font-medium">Profile</span>
        </div>
      </div>
      
      {/* Home Indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-800/20 rounded-full z-20" />
    </div>
  );
}
