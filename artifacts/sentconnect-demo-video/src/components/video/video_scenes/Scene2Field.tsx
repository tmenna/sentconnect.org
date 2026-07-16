import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  MapPin, Image as ImageIcon, Video, Heart, ThumbsUp, Send, MessageCircle,
  MoreHorizontal, Link, Pencil, Trash2, Presentation, FileText, Users, CircleUser, PenSquare
} from 'lucide-react';

const CAPTIONS: Record<number, string> = {
  1: 'James, in Nigeria, opens his Missions Feed',
  2: 'He shares what God is doing — in his own words',
  3: 'Adds photos from the field',
  4: 'Tags where it happened',
  5: 'One tap — his church back home sees it instantly',
  6: 'His church & partner organizations react with hearts & likes',
  7: 'They comment back — prayer & encouragement from home',
  8: 'Share menu — public link, edit, or export',
};

export function Scene2Field() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 5500),   // Intro headline out, app frame in
      setTimeout(() => setPhase(2), 10000),  // Typing text
      setTimeout(() => setPhase(3), 15000),  // Photo drops in
      setTimeout(() => setPhase(4), 19000),  // Location chip
      setTimeout(() => setPhase(5), 23000),  // Post -> feed card
      setTimeout(() => setPhase(6), 28000),  // Reactions
      setTimeout(() => setPhase(7), 33000),  // Comment
      setTimeout(() => setPhase(8), 38000),  // 3-dot menu opens
      setTimeout(() => setPhase(9), 42500),  // Fade out
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const posted = phase >= 5;

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -100, filter: 'blur(10px)' }}
      transition={{ duration: 0.8 }}
    >
      {/* STORY INTRO (phase 0) */}
      <AnimatePresence>
        {phase < 1 && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-16 z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -40, filter: 'blur(8px)' }}
            transition={{ duration: 0.7 }}
          >
            <motion.div
              className="text-slate-400 font-semibold tracking-widest text-sm uppercase mb-4"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              From the field
            </motion.div>
            <motion.h1
              className="text-5xl md:text-6xl font-black text-slate-900 leading-tight max-w-4xl tracking-tight"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.7 }}
            >
              Missionaries share what <span className="text-[#1085FD]">God is doing</span>
            </motion.h1>
            <motion.p
              className="text-2xl text-slate-500 font-medium mt-5 max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6, duration: 0.7 }}
            >
              — and the church back home sees it the moment it happens.
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chapter badge */}
      <motion.div
        className="absolute top-[5%] left-0 right-0 flex justify-center z-50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: phase >= 1 && phase < 9 ? 1 : 0, y: phase >= 1 ? 0 : -20 }}
        transition={{ duration: 0.8 }}
      >
        <div className="bg-[#1085FD] text-white px-10 py-3.5 rounded-full shadow-heavy">
          <span className="font-black tracking-widest text-2xl uppercase">Field User</span>
        </div>
      </motion.div>

      {/* App frame: sidebar + main */}
      <motion.div
        className="w-[85vw] h-[72vh] bg-white rounded-2xl shadow-heavy border border-slate-200 overflow-hidden flex relative"
        initial={{ y: '100vh', opacity: 0, scale: 0.95 }}
        animate={{
          y: phase >= 1 ? 0 : '100vh',
          opacity: phase >= 1 && phase < 9 ? 1 : 0,
          scale: phase >= 9 ? 0.85 : 1,
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 110 }}
      >
        {/* Sidebar — mirrors missionary dashboard */}
        <div className="w-60 border-r border-slate-200 bg-white flex flex-col py-6 px-4 flex-shrink-0">
          <div className="px-3 mb-6">
            <div className="font-black text-xl text-slate-900">Missions Feed</div>
            <div className="text-sm text-slate-500">Africa Inland Mission</div>
          </div>
          <div className="flex flex-col gap-1 text-[15px]">
            <div className="px-3 py-2.5 rounded-lg font-semibold flex items-center gap-3 bg-[#EEF4FF] text-slate-900">
              <FileText className="w-5 h-5" />
              My Posts
            </div>
            <div className="px-3 py-2.5 rounded-lg font-medium flex items-center gap-3 text-slate-500">
              <Users className="w-5 h-5" />
              Team Posts
            </div>
            <div className="px-3 py-2.5 rounded-lg font-medium flex items-center gap-3 text-slate-500">
              <CircleUser className="w-5 h-5" />
              Profile
            </div>
          </div>
          <button className="mt-6 bg-[#1085FD] text-white rounded-xl py-2.5 font-semibold flex items-center justify-center gap-2 shadow-sm">
            <PenSquare className="w-4 h-4" />
            New Post
          </button>
          <div className="mt-auto flex items-center gap-2 px-2">
            <div className="w-8 h-8 rounded-full bg-[#1085FD] text-white flex items-center justify-center font-bold text-sm">J</div>
            <div>
              <div className="text-sm font-semibold text-slate-900">James</div>
              <div className="text-xs text-slate-500">Field User</div>
            </div>
          </div>
        </div>

        {/* Main column */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="px-8 pt-5 pb-0 border-b border-slate-100 flex items-center gap-6">
            <div className="pb-3 border-b-2 border-[#1085FD] text-[#1085FD] font-bold flex items-center gap-2">
              My Posts
              <span className="bg-[#EFF6FF] text-[#1085FD] text-xs font-bold px-2 py-0.5 rounded">{posted ? 13 : 12}</span>
            </div>
            <div className="pb-3 text-slate-400 font-semibold">Team Posts</div>
          </div>

          <div className="flex-1 p-6 overflow-hidden relative bg-slate-50/60">
            {/* COMPOSER (phases 1-4) */}
            {!posted && (
              <motion.div
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5"
                exit={{ opacity: 0 }}
              >
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1085FD] text-white flex items-center justify-center font-bold flex-shrink-0">J</div>
                  <div className="flex-1">
                    <div className="min-h-[56px] text-slate-800 text-[17px] leading-relaxed">
                      {phase < 2 && <span className="text-slate-400">Share an update...</span>}
                      {phase >= 2 && (
                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          Last month, after three years of prayer and relationship-building, we held the first official gathering of the Achi Community Church. Sixty-seven people crowded into Emmanuel's home.
                        </motion.span>
                      )}
                    </div>

                    {/* Photo preview */}
                    <AnimatePresence>
                      {phase >= 3 && (
                        <motion.div
                          className="mt-3 w-52 h-32 rounded-xl overflow-hidden relative"
                          initial={{ opacity: 0, y: 16, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                        >
                          <img src={`${import.meta.env.BASE_URL}images/field-worker.png`} className="w-full h-full object-cover" />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Location chip */}
                    <AnimatePresence>
                      {phase >= 4 && (
                        <motion.div
                          className="mt-3 flex items-center gap-2 text-[#1085FD] bg-[#EFF6FF] px-3 py-1.5 rounded-full w-max text-sm font-medium"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                        >
                          <MapPin className="w-4 h-4" />
                          Achi Village, Enugu State, Nigeria
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Composer toolbar */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-5">
                  <motion.div
                    className="flex items-center gap-1.5 text-[#1085FD] font-semibold text-sm"
                    animate={{ scale: phase === 3 ? [1, 1.2, 1] : 1 }}
                  >
                    <ImageIcon className="w-5 h-5" /> Photo
                  </motion.div>
                  <div className="flex items-center gap-1.5 text-[#1085FD] font-semibold text-sm">
                    <Video className="w-5 h-5" /> Video
                  </div>
                  <motion.div
                    className="flex items-center gap-1.5 text-slate-500 font-semibold text-sm"
                    animate={{ scale: phase === 4 ? [1, 1.2, 1] : 1, color: phase >= 4 ? '#1085FD' : '#64748B' }}
                  >
                    <MapPin className="w-5 h-5" /> Location
                  </motion.div>
                  <motion.button
                    className="ml-auto bg-[#1085FD] text-white px-5 py-2 rounded-lg font-semibold flex items-center gap-2 shadow-sm"
                    animate={{ scale: phase >= 5 ? 0.92 : 1 }}
                  >
                    <Send className="w-4 h-4" />
                    Post Update
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* FEED CARD (phases 5+) */}
            {posted && (
              <motion.div
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden max-w-2xl mx-auto relative"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', damping: 22 }}
              >
                <div className="p-5 pb-3 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-[#1085FD] text-white flex items-center justify-center font-bold">JO</div>
                    <div>
                      <div className="font-bold text-slate-900">James Okafor <span className="font-normal text-slate-400 text-sm">· less than a minute ago</span></div>
                      <div className="text-sm text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> Achi Village, Enugu State, Nigeria
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-3 text-slate-800 text-[15px] leading-relaxed">
                  Last month, after three years of prayer and relationship-building, we held the first official gathering of the Achi Community Church. Sixty-seven people crowded into Emmanuel's home.
                </div>

                <div className="w-full h-[26vh]">
                  <img src={`${import.meta.env.BASE_URL}images/field-worker.png`} className="w-full h-full object-cover" />
                </div>

                {/* Actions row with orange 3-dot */}
                <div className="px-5 py-3 flex items-center gap-5 text-slate-500 relative">
                  <motion.div className="flex items-center gap-1.5" animate={{ color: phase >= 6 ? '#EF4444' : '#94A3B8' }}>
                    <motion.div animate={{ scale: phase >= 6 ? [1, 1.5, 1] : 1 }}>
                      <Heart className={`w-5 h-5 ${phase >= 6 ? 'fill-current' : ''}`} />
                    </motion.div>
                    <span className="font-medium">{phase >= 6 ? 8 : ''}</span>
                  </motion.div>
                  <motion.div className="flex items-center gap-1.5" animate={{ color: phase >= 6 ? '#1085FD' : '#94A3B8' }}>
                    <motion.div animate={{ scale: phase >= 6 ? [1, 1.4, 1] : 1 }} transition={{ delay: 0.2 }}>
                      <ThumbsUp className={`w-5 h-5 ${phase >= 6 ? 'fill-current' : ''}`} />
                    </motion.div>
                    <span className="font-medium">{phase >= 6 ? 5 : ''}</span>
                  </motion.div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <MessageCircle className="w-5 h-5" />
                    <span className="font-medium">{phase >= 7 ? 1 : ''}</span>
                  </div>

                  {/* Orange three-dot menu button */}
                  <motion.button
                    className="ml-auto w-8 h-8 rounded-full bg-[#FF4500] text-white flex items-center justify-center shadow-sm"
                    animate={{ scale: phase === 8 ? [1, 1.25, 1] : 1 }}
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </motion.button>

                  {/* Share menu */}
                  <AnimatePresence>
                    {phase >= 8 && (
                      <motion.div
                        className="absolute right-4 bottom-11 bg-white rounded-xl shadow-heavy border border-slate-200 py-2 w-56 z-30"
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                      >
                        {[
                          { icon: Link, label: 'Copy link', color: 'text-slate-700' },
                          { icon: Presentation, label: 'Export', color: 'text-slate-700' },
                          { icon: Pencil, label: 'Edit', color: 'text-slate-700' },
                          { icon: Trash2, label: 'Delete', color: 'text-red-500' },
                        ].map((item, i) => (
                          <motion.div
                            key={item.label}
                            className={`px-4 py-2 flex items-center gap-3 text-sm font-medium ${item.color} ${i === 0 ? 'bg-slate-50' : ''}`}
                            initial={{ opacity: 0, x: 8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15 + i * 0.1 }}
                          >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Comment */}
                <div className="px-5 pb-4">
                  <AnimatePresence>
                    {phase >= 7 && (
                      <motion.div
                        className="flex gap-3 bg-slate-50 p-3 rounded-xl"
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ type: 'spring', damping: 20 }}
                      >
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs flex-shrink-0">MS</div>
                        <div>
                          <div className="font-bold text-sm text-slate-900">Maria Santos</div>
                          <div className="text-sm text-slate-600 mt-0.5">Praying for you and the team! 🙏</div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#1085FD] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">J</div>
                    <div className="flex-1 bg-white border border-slate-200 rounded-full px-4 py-2 text-sm text-slate-400 flex items-center justify-between">
                      Write a comment...
                      <Send className="w-4 h-4 text-[#1085FD]" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Feature caption */}
      <div className="absolute bottom-[6%] left-0 right-0 flex justify-center z-50">
        <AnimatePresence mode="wait">
          {phase >= 1 && phase < 9 && CAPTIONS[phase] && (
            <motion.div
              key={phase}
              className="bg-[#0F172A] text-white px-6 py-3 rounded-full shadow-heavy text-lg font-semibold"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              {CAPTIONS[phase]}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
