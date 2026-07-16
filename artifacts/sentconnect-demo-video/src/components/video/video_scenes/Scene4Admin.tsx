import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  Rss, Users, MapPin, Heart, ThumbsUp, MessageCircle, MoreHorizontal,
  Link, Presentation, ShieldCheck, Globe, KeyRound, Send, ChevronDown
} from 'lucide-react';

const CAPTIONS: Record<number, string> = {
  1: 'Admin — Updates: every post across your org',
  2: 'Filter by member',
  3: 'Share or export any post',
  4: 'User Management — roles & status at a glance',
  5: 'Simple 3-permission editor',
  6: 'One-click password resets',
};

const MEMBERS = [
  { initials: 'JO', name: 'James Okafor', email: 'demouser@sentconnect.org', role: 'Field User', active: true, color: 'bg-[#1085FD]' },
  { initials: 'MS', name: 'Maria Santos', email: 'maria@mission.org', role: 'Field User', active: true, color: 'bg-emerald-600' },
  { initials: 'DC', name: 'David Chen', email: 'david@mission.org', role: 'Field User', active: true, color: 'bg-violet-600' },
  { initials: 'DA', name: 'Demo Admin', email: 'demoadmin@sentconnect.org', role: 'Admin', active: true, color: 'bg-slate-800' },
];

export function Scene4Admin() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 1000),   // Dashboard in (Updates feed)
      setTimeout(() => setPhase(2), 5500),   // Member filter pulses
      setTimeout(() => setPhase(3), 9500),   // Orange 3-dot menu opens
      setTimeout(() => setPhase(4), 14500),  // User Management table
      setTimeout(() => setPhase(5), 19500),  // Permissions dialog
      setTimeout(() => setPhase(6), 24500),  // Password reset
      setTimeout(() => setPhase(7), 28500),  // Export -> slide
      setTimeout(() => setPhase(8), 36000),  // End hold
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const onTeam = phase >= 4 && phase < 7;

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center bg-slate-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.8 }}
    >
      {/* Chapter badge */}
      {phase < 7 && (
        <motion.div
          className="absolute top-[5%] left-0 right-0 flex justify-center z-50"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <div className="bg-[#0F172A] text-white px-6 py-2 rounded-full shadow-md">
            <span className="font-semibold tracking-wide text-sm uppercase">Admin Portal</span>
          </div>
        </motion.div>
      )}

      {/* ADMIN APP FRAME */}
      <motion.div
        className="w-[85vw] h-[72vh] bg-white rounded-2xl shadow-heavy border border-slate-200 overflow-hidden flex relative"
        initial={{ scale: 0.9, opacity: 0, y: 40 }}
        animate={{
          scale: phase >= 7 ? 1.1 : 1,
          opacity: phase >= 7 ? 0 : 1,
          y: 0,
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 100 }}
      >
        {/* Sidebar — mirrors real admin */}
        <div className="w-60 border-r border-slate-200 bg-white flex flex-col py-6 px-4 flex-shrink-0">
          <div className="px-3 mb-2">
            <img src={`${import.meta.env.BASE_URL}images/logo-color.png`} alt="SentConnect" className="h-7 w-auto object-contain mb-4" />
            <div className="font-black text-xl text-slate-900">Missions Feed</div>
            <div className="text-sm text-slate-500">Calvary Community Church</div>
          </div>
          <div className="flex flex-col gap-1 mt-4 text-[15px]">
            <motion.div
              className="px-3 py-2.5 rounded-lg font-semibold flex items-center gap-3"
              animate={{
                backgroundColor: !onTeam ? '#EEF4FF' : 'transparent',
                color: !onTeam ? '#0F172A' : '#64748B',
              }}
            >
              <Rss className="w-5 h-5" />
              Updates
            </motion.div>
            <motion.div
              className="px-3 py-2.5 rounded-lg font-semibold flex items-center gap-3 justify-between"
              animate={{
                backgroundColor: onTeam ? '#EEF4FF' : 'transparent',
                color: onTeam ? '#0F172A' : '#64748B',
                scale: phase === 4 ? [1, 1.04, 1] : 1,
              }}
            >
              <span className="flex items-center gap-3"><Users className="w-5 h-5" /> User Management</span>
              <span className="bg-slate-100 text-slate-500 text-xs font-bold px-1.5 py-0.5 rounded">5</span>
            </motion.div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* UPDATES FEED VIEW */}
          {!onTeam && (
            <>
              <div className="px-8 pt-5 pb-0 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="pb-3 border-b-2 border-[#1085FD] text-[#1085FD] font-bold flex items-center gap-2">
                    All Posts
                    <span className="bg-[#EFF6FF] text-[#1085FD] text-xs font-bold px-2 py-0.5 rounded">4</span>
                  </div>
                </div>
                <motion.div
                  className="mb-3 border border-slate-200 rounded-full px-4 py-1.5 text-sm font-medium text-slate-600 flex items-center gap-2"
                  animate={{
                    scale: phase === 2 ? [1, 1.1, 1] : 1,
                    borderColor: phase >= 2 ? '#1085FD' : '#E2E8F0',
                  }}
                >
                  All members <ChevronDown className="w-4 h-4" />
                </motion.div>
              </div>

              <div className="flex-1 p-6 bg-slate-50/60 overflow-hidden">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden max-w-2xl mx-auto relative">
                  <div className="p-5 pb-3 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-[#1085FD] text-white flex items-center justify-center font-bold">JO</div>
                    <div>
                      <div className="font-bold text-slate-900">James Okafor <span className="font-normal text-slate-400 text-sm">· less than a minute ago</span></div>
                      <div className="text-sm text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> Achi Village, Enugu State, Nigeria
                      </div>
                    </div>
                  </div>
                  <div className="px-5 pb-3 text-slate-800 text-[15px] leading-relaxed">
                    Last month, after three years of prayer and relationship-building, we held the first official gathering of the Achi Community Church. Sixty-seven people crowded into Emmanuel's home.
                  </div>
                  <div className="w-full h-[22vh]">
                    <img src={`${import.meta.env.BASE_URL}images/field-worker.png`} className="w-full h-full object-cover" />
                  </div>
                  <div className="px-5 py-3 flex items-center gap-5 text-slate-400 relative">
                    <div className="flex items-center gap-1.5 text-red-400"><Heart className="w-5 h-5 fill-current" /><span className="font-medium text-slate-500">8</span></div>
                    <div className="flex items-center gap-1.5 text-[#1085FD]"><ThumbsUp className="w-5 h-5 fill-current" /><span className="font-medium text-slate-500">5</span></div>
                    <div className="flex items-center gap-1.5"><MessageCircle className="w-5 h-5" /><span className="font-medium text-slate-500">1</span></div>

                    <motion.button
                      className="ml-auto w-8 h-8 rounded-full bg-[#F97316] text-white flex items-center justify-center shadow-sm"
                      animate={{ scale: phase === 3 ? [1, 1.25, 1] : 1 }}
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </motion.button>

                    <AnimatePresence>
                      {phase === 3 && (
                        <motion.div
                          className="absolute right-4 bottom-11 bg-white rounded-xl shadow-heavy border border-slate-200 py-2 w-56 z-30"
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8 }}
                        >
                          {[
                            { icon: Link, label: 'Copy public link' },
                            { icon: Presentation, label: 'Export to Slide' },
                          ].map((item, i) => (
                            <motion.div
                              key={item.label}
                              className={`px-4 py-2.5 flex items-center gap-3 text-sm font-medium text-slate-700 ${i === 1 ? 'bg-slate-50' : ''}`}
                              initial={{ opacity: 0, x: 8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.2 + i * 0.15 }}
                            >
                              <item.icon className="w-4 h-4" />
                              {item.label}
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* USER MANAGEMENT VIEW */}
          {onTeam && (
            <motion.div
              className="flex-1 p-8 overflow-hidden relative"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
                <button className="bg-[#1085FD] text-white px-4 py-2 rounded-lg font-semibold text-sm">Add Team Member</button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr] px-5 py-3 bg-slate-50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <div>Member</div><div>Role</div><div>Status</div><div>Actions</div>
                </div>
                {MEMBERS.map((m, i) => (
                  <motion.div
                    key={m.name}
                    className="grid grid-cols-[2fr_1fr_1fr_1fr] px-5 py-3.5 border-t border-slate-100 items-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0, backgroundColor: i === 0 && phase >= 5 ? '#F8FAFC' : '#FFFFFF' }}
                    transition={{ delay: 0.2 + i * 0.12 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full ${m.color} text-white flex items-center justify-center font-bold text-sm`}>{m.initials}</div>
                      <div>
                        <div className="font-semibold text-slate-900 text-sm">{m.name}</div>
                        <div className="text-xs text-slate-400">{m.email}</div>
                      </div>
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                        {m.role === 'Admin' ? <ShieldCheck className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                        {m.role}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> Active
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <motion.div
                        className="p-1.5 rounded-md"
                        animate={i === 0 && phase === 6 ? { backgroundColor: '#EFF6FF', color: '#1085FD', scale: [1, 1.2, 1] } : {}}
                      >
                        <KeyRound className="w-4 h-4" />
                      </motion.div>
                      <MoreHorizontal className="w-4 h-4" />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Password reset toast */}
              <AnimatePresence>
                {phase === 6 && (
                  <motion.div
                    className="absolute bottom-6 right-8 bg-[#0F172A] text-white px-5 py-3 rounded-xl shadow-heavy text-sm font-medium flex items-center gap-2"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <KeyRound className="w-4 h-4 text-[#1085FD]" />
                    Temporary password generated for James Okafor
                  </motion.div>
                )}
              </AnimatePresence>

              {/* PERMISSIONS DIALOG */}
              <AnimatePresence>
                {phase === 5 && (
                  <motion.div
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-40"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.div
                      className="bg-white rounded-2xl shadow-heavy w-[420px] overflow-hidden"
                      initial={{ scale: 0.9, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.9, y: 20 }}
                    >
                      <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
                        <div className="w-11 h-11 bg-[#1085FD] rounded-full flex items-center justify-center text-white font-bold">JO</div>
                        <div>
                          <h2 className="text-lg font-bold text-slate-900">James Okafor</h2>
                          <p className="text-slate-500 text-sm">Edit Permissions</p>
                        </div>
                      </div>
                      <div className="p-5 space-y-4">
                        {['Submit Reports', 'View All Reports', 'Manage Team'].map((perm, i) => (
                          <div key={perm} className="flex items-center justify-between">
                            <div className="font-semibold text-slate-800 text-sm">{perm}</div>
                            <motion.div
                              className="w-5 h-5 rounded border-2 flex items-center justify-center"
                              animate={{
                                backgroundColor: i < 2 ? '#1085FD' : '#FFFFFF',
                                borderColor: i < 2 ? '#1085FD' : '#CBD5E1',
                              }}
                              transition={{ delay: 0.5 + i * 0.3 }}
                            >
                              {i < 2 && (
                                <motion.svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={4}
                                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 + i * 0.3 }}>
                                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                                </motion.svg>
                              )}
                            </motion.div>
                          </div>
                        ))}
                      </div>
                      <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                        <button className="bg-[#1085FD] text-white px-5 py-2 rounded-lg font-bold text-sm">Save Changes</button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Feature caption */}
      <div className="absolute bottom-[6%] left-0 right-0 flex justify-center z-50">
        <AnimatePresence mode="wait">
          {phase >= 1 && phase < 7 && CAPTIONS[phase] && (
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

      {/* EXPORTED SLIDE (phase 7+) */}
      <AnimatePresence>
        {phase >= 7 && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-xl z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 0.4, scale: 1 }}
              transition={{ duration: 2 }}
            >
              <img src={`${import.meta.env.BASE_URL}images/church-presentation.jpg`} className="w-full h-full object-cover" />
            </motion.div>

            <motion.div
              className="w-[70vw] aspect-[16/9] bg-white relative z-10 shadow-[0_0_100px_rgba(255,255,255,0.2)] flex rounded-lg overflow-hidden"
              initial={{ rotateX: 90, opacity: 0, y: 100 }}
              animate={{ rotateX: 0, opacity: 1, y: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 80, delay: 0.5 }}
              style={{ perspective: 1000 }}
            >
              <div className="w-1/2 h-full bg-[#0F172A] text-white p-12 flex flex-col justify-between">
                <div>
                  <img src={`${import.meta.env.BASE_URL}images/logo-white.png`} alt="SentConnect" className="h-10 w-auto object-contain mb-6" />
                  <h1 className="text-5xl font-black leading-tight mb-4 tracking-tight">A New Church<br />Planted in Achi Village</h1>
                  <p className="text-xl text-slate-300 font-medium">"Sixty-seven people crowded into Emmanuel's home. The worship was raw and full of joy."</p>
                </div>
                <div className="flex items-center gap-4 border-t border-slate-700 pt-6">
                  <div className="w-16 h-16 rounded-full bg-slate-600 flex items-center justify-center text-xl font-bold">JO</div>
                  <div>
                    <div className="text-2xl font-bold">James Okafor</div>
                    <div className="text-[#1085FD] font-semibold text-lg">Africa Inland Mission</div>
                  </div>
                </div>
              </div>
              <div className="w-1/2 h-full">
                <img src={`${import.meta.env.BASE_URL}images/field-worker.png`} className="w-full h-full object-cover" />
              </div>
            </motion.div>

            <motion.div
              className="absolute top-12 text-white text-2xl font-bold tracking-widest uppercase"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
            >
              Ready for Sunday Morning
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
