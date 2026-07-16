import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  Rss, Users, MapPin, Heart, ThumbsUp, MessageCircle, MoreHorizontal,
  Link2, ImageDown, Pencil, Trash2, ShieldCheck, Globe, KeyRound, ChevronDown, Mail, Check
} from 'lucide-react';

const CAPTIONS: Record<number, string> = {
  1: 'Admin — every missionary update in one feed',
  2: 'Filter dropdown — view posts by one missionary',
  3: 'Now showing only James Okafor\u2019s posts',
  4: 'Orange button = share menu for every post',
  5: 'Copy link — email it to people praying for this post',
  6: 'Export — turn the post into a Sunday-morning slide',
  7: 'User Management — every member, role & status',
  8: 'Add a member — as Field User or another Admin',
  9: 'Update a member\u2019s Role & Permissions anytime',
  10: 'Key icon — reset any field user\u2019s password',
};

const MEMBERS = [
  { initials: 'JO', name: 'James Okafor', email: 'demouser@sentconnect.org', role: 'Field User', color: 'bg-[#1085FD]' },
  { initials: 'MS', name: 'Maria Santos', email: 'maria@mission.org', role: 'Field User', color: 'bg-emerald-600' },
  { initials: 'DC', name: 'David Chen', email: 'david@mission.org', role: 'Field User', color: 'bg-violet-600' },
  { initials: 'DA', name: 'Demo Admin', email: 'demoadmin@sentconnect.org', role: 'Admin', color: 'bg-slate-800' },
];

function MenuItem({ icon: Icon, label, active, danger, delay }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  danger?: boolean;
  delay: number;
}) {
  return (
    <motion.div
      className={`px-4 py-2.5 flex items-center gap-3 text-sm font-medium rounded-md mx-1 ${danger ? 'text-red-600' : 'text-slate-700'}`}
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0, backgroundColor: active ? '#EFF6FF' : 'rgba(255,255,255,0)' }}
      transition={{ delay }}
    >
      <Icon className="w-4 h-4" />
      {label}
      {active && <Check className="w-4 h-4 ml-auto text-[#1085FD]" />}
    </motion.div>
  );
}

export function Scene4Admin() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 1000),   // Updates feed in
      setTimeout(() => setPhase(2), 5500),   // Dropdown opens with member list
      setTimeout(() => setPhase(3), 10500),  // Filtered to James Okafor
      setTimeout(() => setPhase(4), 15500),  // Orange 3-dot menu opens
      setTimeout(() => setPhase(5), 20000),  // Copy link highlighted (+email hint)
      setTimeout(() => setPhase(6), 25500),  // Export highlighted
      setTimeout(() => setPhase(7), 30000),  // User Management table
      setTimeout(() => setPhase(8), 35000),  // Add Team Member dialog (role choice)
      setTimeout(() => setPhase(9), 42000),  // Role & Permissions dialog
      setTimeout(() => setPhase(10), 49000), // Password reset dialog
      setTimeout(() => setPhase(11), 56000), // Export slide finale
      setTimeout(() => setPhase(12), 62500), // End hold
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const onTeam = phase >= 7 && phase < 11;
  const filtered = phase >= 3;
  const menuOpen = phase >= 4 && phase < 7;

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center bg-slate-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.8 }}
    >
      {/* Chapter badge */}
      {phase < 11 && (
        <motion.div
          className="absolute top-[4%] left-0 right-0 flex justify-center z-50"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <div className="bg-[#1085FD] text-white px-10 py-3.5 rounded-full shadow-heavy">
            <span className="font-black tracking-widest text-2xl uppercase">Admin Portal</span>
          </div>
        </motion.div>
      )}

      {/* ADMIN APP FRAME */}
      <motion.div
        className="w-[1360px] h-[648px] bg-white rounded-2xl shadow-heavy border border-slate-200 overflow-hidden flex relative"
        initial={{ scale: 0.9, opacity: 0, y: 40 }}
        animate={{
          scale: phase >= 11 ? 1.1 : 1,
          opacity: phase >= 11 ? 0 : 1,
          y: 0,
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 100 }}
      >
        {/* Sidebar */}
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
                backgroundColor: !onTeam ? '#EEF4FF' : 'rgba(255,255,255,0)',
                color: !onTeam ? '#0F172A' : '#64748B',
              }}
            >
              <Rss className="w-5 h-5" />
              Updates
            </motion.div>
            <motion.div
              className="px-3 py-2.5 rounded-lg font-semibold flex items-center gap-3 justify-between"
              animate={{
                backgroundColor: onTeam ? '#EEF4FF' : 'rgba(255,255,255,0)',
                color: onTeam ? '#0F172A' : '#64748B',
                scale: phase === 7 ? [1, 1.04, 1] : 1,
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
              <div className="px-8 pt-5 pb-0 border-b border-slate-100 flex items-center justify-between relative">
                <div className="flex items-center gap-6">
                  <div className="pb-3 border-b-2 border-[#1085FD] text-[#1085FD] font-bold flex items-center gap-2">
                    All Posts
                    <span className="bg-[#EFF6FF] text-[#1085FD] text-xs font-bold px-2 py-0.5 rounded">{filtered ? 2 : 4}</span>
                  </div>
                </div>
                <motion.div
                  className="mb-3 border rounded-full px-4 py-1.5 text-sm font-medium text-slate-600 flex items-center gap-2 bg-white"
                  animate={{
                    scale: phase === 2 ? [1, 1.1, 1] : 1,
                    borderColor: phase >= 2 && phase < 4 ? '#1085FD' : '#E2E8F0',
                    boxShadow: phase === 2 ? '0 0 0 4px rgba(16,133,253,0.15)' : '0 0 0 0px rgba(16,133,253,0)',
                  }}
                >
                  {filtered ? 'James Okafor' : 'All members'} <ChevronDown className="w-4 h-4" />
                </motion.div>

                {/* Member filter dropdown */}
                <AnimatePresence>
                  {phase === 2 && (
                    <motion.div
                      className="absolute right-8 top-14 bg-white rounded-xl shadow-heavy border border-slate-200 py-1.5 w-52 z-40"
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8 }}
                    >
                      <div className="px-4 py-2 text-sm font-medium text-slate-500">All members</div>
                      {['James Okafor', 'Maria Santos', 'David Chen'].map((n, i) => (
                        <motion.div
                          key={n}
                          className="px-4 py-2 text-sm font-medium rounded-md mx-1"
                          initial={{ opacity: 0, x: 8 }}
                          animate={{
                            opacity: 1, x: 0,
                            backgroundColor: i === 0 ? '#EFF6FF' : 'rgba(255,255,255,0)',
                            color: i === 0 ? '#1085FD' : '#334155',
                          }}
                          transition={{ delay: 0.3 + i * 0.25, backgroundColor: { delay: 1.6 } }}
                        >
                          {n}
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex-1 p-6 bg-slate-50/60 overflow-hidden">
                {/* Filter result banner */}
                <AnimatePresence>
                  {filtered && (
                    <motion.div
                      className="max-w-2xl mx-auto mb-3 text-sm font-medium text-[#1085FD] bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg px-4 py-2 flex items-center gap-2"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Users className="w-4 h-4" /> Showing posts by James Okafor only
                    </motion.div>
                  )}
                </AnimatePresence>

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
                  <div className="w-full h-[171px]">
                    <img src={`${import.meta.env.BASE_URL}images/field-worker.png`} className="w-full h-full object-cover" />
                  </div>
                  <div className="px-5 py-3 flex items-center gap-5 text-slate-400 relative">
                    <div className="flex items-center gap-1.5 text-red-400"><Heart className="w-5 h-5 fill-current" /><span className="font-medium text-slate-500">8</span></div>
                    <div className="flex items-center gap-1.5 text-[#1085FD]"><ThumbsUp className="w-5 h-5 fill-current" /><span className="font-medium text-slate-500">5</span></div>
                    <div className="flex items-center gap-1.5"><MessageCircle className="w-5 h-5" /><span className="font-medium text-slate-500">1</span></div>

                    {/* Orange share button + tooltip */}
                    <div className="ml-auto relative">
                      <motion.button
                        className="w-8 h-8 rounded-full bg-[#FF4500] text-white flex items-center justify-center shadow-sm"
                        animate={{ scale: phase === 4 ? [1, 1.3, 1] : 1 }}
                      >
                        <MoreHorizontal className="w-5 h-5" strokeWidth={3} />
                      </motion.button>
                      <AnimatePresence>
                        {phase === 4 && (
                          <motion.div
                            className="absolute -top-9 right-0 bg-slate-900 text-white text-xs font-medium px-2.5 py-1.5 rounded-md whitespace-nowrap"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                          >
                            Share this post
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Share menu — mirrors real app: Copy link / Edit / Export / Delete */}
                    <AnimatePresence>
                      {menuOpen && (
                        <motion.div
                          className="absolute right-4 bottom-11 bg-white rounded-xl shadow-heavy border border-slate-200 py-1.5 w-52 z-30"
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8 }}
                        >
                          <MenuItem icon={Link2} label={phase >= 5 && phase < 6 ? 'Copied!' : 'Copy link'} active={phase === 5} delay={0.2} />
                          <MenuItem icon={Pencil} label="Edit" delay={0.35} />
                          <MenuItem icon={ImageDown} label="Export" active={phase >= 6} delay={0.5} />
                          <MenuItem icon={Trash2} label="Delete" danger delay={0.65} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Email hint card (phase 5) */}
                <AnimatePresence>
                  {phase === 5 && (
                    <motion.div
                      className="max-w-2xl mx-auto mt-3 bg-white border border-slate-200 rounded-xl shadow-sm px-4 py-3 flex items-center gap-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="w-9 h-9 rounded-full bg-[#EFF6FF] flex items-center justify-center">
                        <Mail className="w-5 h-5 text-[#1085FD]" />
                      </div>
                      <div className="text-sm text-slate-600">
                        <span className="font-semibold text-slate-900">Link copied.</span> Paste it into an email — anyone praying for this work can open the post, no login needed.
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
                <motion.button
                  className="bg-[#1085FD] text-white px-4 py-2 rounded-lg font-semibold text-sm"
                  animate={{ scale: phase === 8 ? [1, 1.1, 1] : 1 }}
                >
                  Add Team Member
                </motion.button>
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
                    animate={{ opacity: 1, y: 0, backgroundColor: i === 0 && phase >= 9 ? '#F8FAFC' : '#FFFFFF' }}
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
                    <div className="flex items-center gap-2 text-slate-400 relative">
                      <motion.div
                        className="p-1.5 rounded-md relative"
                        animate={i === 0 && phase === 10 ? { backgroundColor: '#EFF6FF', color: '#1085FD', scale: [1, 1.3, 1] } : {}}
                      >
                        <KeyRound className="w-4 h-4" />
                        {i === 0 && phase === 10 && (
                          <motion.div
                            className="absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-medium px-2.5 py-1.5 rounded-md whitespace-nowrap z-20"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            Reset password
                          </motion.div>
                        )}
                      </motion.div>
                      <MoreHorizontal className="w-4 h-4" />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* MANAGE PASSWORD DIALOG (phase 10) */}
              <AnimatePresence>
                {phase === 10 && (
                  <motion.div
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-40"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: 1.0 }}
                  >
                    <motion.div
                      className="bg-white rounded-2xl shadow-heavy w-[420px] overflow-hidden"
                      initial={{ scale: 0.9, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.9, y: 20 }}
                      transition={{ delay: 1.0 }}
                    >
                      <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
                        <div className="w-11 h-11 bg-[#1085FD] rounded-full flex items-center justify-center text-white">
                          <KeyRound className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-slate-900">Manage Password</h2>
                          <p className="text-slate-500 text-sm">James Okafor</p>
                        </div>
                      </div>
                      <div className="p-5 space-y-3">
                        <div className="border border-slate-200 rounded-lg px-4 py-3 flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                          <div>
                            <div className="font-semibold text-slate-800 text-sm">Set a specific password</div>
                            <div className="text-xs text-slate-400">Type a new password yourself</div>
                          </div>
                        </div>
                        <motion.div
                          className="border-2 rounded-lg px-4 py-3 flex items-center gap-3"
                          animate={{ borderColor: ['#E2E8F0', '#1085FD'], backgroundColor: ['#FFFFFF', '#F8FBFF'] }}
                          transition={{ delay: 2.2, duration: 0.4 }}
                        >
                          <motion.div
                            className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                            animate={{ borderColor: ['#CBD5E1', '#1085FD'] }}
                            transition={{ delay: 2.2 }}
                          >
                            <motion.div
                              className="w-2 h-2 rounded-full bg-[#1085FD]"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 2.4 }}
                            />
                          </motion.div>
                          <div>
                            <div className="font-semibold text-slate-800 text-sm">Generate temporary password</div>
                            <div className="text-xs text-slate-400">Share it with the user — they sign in and change it</div>
                          </div>
                        </motion.div>
                        <motion.div
                          className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 flex items-center justify-between"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 3.4 }}
                        >
                          <span className="font-mono text-sm font-bold text-slate-800 tracking-wider">TmP-4k9x-Qe2</span>
                          <span className="text-xs font-semibold text-[#1085FD] flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Copied</span>
                        </motion.div>
                      </div>
                      <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                        <button className="bg-[#1085FD] text-white px-5 py-2 rounded-lg font-bold text-sm">Done</button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ADD TEAM MEMBER DIALOG (phase 8) */}
              <AnimatePresence>
                {phase === 8 && (
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
                      <div className="p-5 border-b border-slate-100 bg-slate-50">
                        <h2 className="text-lg font-bold text-slate-900">Add Team Member</h2>
                        <p className="text-slate-500 text-sm">Create a new field user account</p>
                      </div>
                      <div className="p-5 space-y-3.5">
                        {[
                          { label: 'Name', value: 'Grace Adeyemi', delay: 0.5 },
                          { label: 'Email', value: 'grace@mission.org', delay: 1.1 },
                        ].map(f => (
                          <div key={f.label}>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{f.label}</div>
                            <div className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 font-medium">
                              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: f.delay }}>{f.value}</motion.span>
                            </div>
                          </div>
                        ))}
                        <div>
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Password</div>
                          <div className="flex gap-2">
                            <div className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 font-medium tracking-widest">
                              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.0 }}>••••••••••</motion.span>
                            </div>
                            <motion.button
                              className="px-3 py-2 rounded-lg text-sm font-semibold border"
                              animate={{
                                backgroundColor: phase === 8 ? '#EFF6FF' : '#FFFFFF',
                                color: '#1085FD',
                                borderColor: '#BFDBFE',
                                scale: [1, 1, 1.08, 1],
                              }}
                              transition={{ delay: 1.7, duration: 0.6 }}
                            >
                              Generate
                            </motion.button>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Role</div>
                          <motion.div
                            className="border rounded-lg px-3 py-2 text-sm text-slate-800 font-medium flex items-center justify-between"
                            animate={{ borderColor: ['#E2E8F0', '#E2E8F0', '#1085FD'] }}
                            transition={{ delay: 2.4, duration: 0.4 }}
                          >
                            <motion.span initial={{ opacity: 1 }}>Field User</motion.span>
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          </motion.div>
                          {/* Role dropdown — shows you can also create org Admins */}
                          <motion.div
                            className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-heavy py-1 z-20"
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 2.6 }}
                          >
                            <div className="px-3 py-2 text-sm font-medium text-slate-700 flex items-center gap-2 mx-1 rounded-md">
                              <Globe className="w-3.5 h-3.5" /> Field User
                            </div>
                            <motion.div
                              className="px-3 py-2 text-sm font-semibold flex items-center gap-2 mx-1 rounded-md"
                              animate={{ backgroundColor: ['rgba(255,255,255,0)', 'rgba(255,255,255,0)', '#EFF6FF'], color: ['#334155', '#334155', '#1085FD'] }}
                              transition={{ delay: 3.4, duration: 0.4 }}
                            >
                              <ShieldCheck className="w-3.5 h-3.5" /> Admin — full org access
                            </motion.div>
                          </motion.div>
                        </div>
                      </div>
                      <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                        <motion.button
                          className="bg-[#1085FD] text-white px-5 py-2 rounded-lg font-bold text-sm"
                          animate={{ scale: [1, 1, 0.94, 1] }}
                          transition={{ delay: 3.6, duration: 0.5 }}
                        >
                          Create Account
                        </motion.button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* PERMISSIONS DIALOG (phase 9) */}
              <AnimatePresence>
                {phase === 9 && (
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
                          <p className="text-slate-500 text-sm">Edit Role &amp; Permissions</p>
                        </div>
                      </div>
                      <div className="p-5 pb-2">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Role</div>
                        <motion.div
                          className="border rounded-lg px-3 py-2 text-sm font-medium flex items-center justify-between"
                          animate={{ borderColor: ['#E2E8F0', '#1085FD', '#E2E8F0'] }}
                          transition={{ delay: 0.5, duration: 1.2 }}
                        >
                          <span className="flex items-center gap-2 text-slate-800"><Globe className="w-3.5 h-3.5 text-slate-400" /> Field User</span>
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        </motion.div>
                        <motion.div
                          className="text-xs text-slate-400 mt-1.5"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.2 }}
                        >
                          Switch to Admin to give full organization access
                        </motion.div>
                      </div>
                      <div className="p-5 pt-3 space-y-4">
                        {[
                          { label: 'Submit Reports', desc: 'Post updates from the field', on: true },
                          { label: 'View All Reports', desc: 'See the whole team\u2019s feed', on: true },
                          { label: 'Manage Team', desc: 'Add or edit members', on: false },
                        ].map((perm, i) => (
                          <div key={perm.label} className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-slate-800 text-sm">{perm.label}</div>
                              <div className="text-xs text-slate-400">{perm.desc}</div>
                            </div>
                            <motion.div
                              className="w-5 h-5 rounded border-2 flex items-center justify-center"
                              animate={{
                                backgroundColor: perm.on ? '#1085FD' : '#FFFFFF',
                                borderColor: perm.on ? '#1085FD' : '#CBD5E1',
                              }}
                              transition={{ delay: 0.6 + i * 0.5 }}
                            >
                              {perm.on && (
                                <motion.svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={4}
                                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 + i * 0.5 }}>
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
      <div className="absolute bottom-[5%] left-0 right-0 flex justify-center z-50">
        <AnimatePresence mode="wait">
          {phase >= 1 && phase < 11 && CAPTIONS[phase] && (
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

      {/* EXPORTED SLIDE FINALE (phase 11+) */}
      <AnimatePresence>
        {phase >= 11 && (
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
              className="w-[1120px] aspect-[16/9] bg-white relative z-10 shadow-[0_0_100px_rgba(255,255,255,0.2)] flex rounded-lg overflow-hidden"
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
              Exported — Ready for Sunday Morning
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
