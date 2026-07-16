import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { LayoutDashboard, Users, Download, Star, Filter, Shield, Check } from 'lucide-react';

export function Scene4Admin() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 1000),   // Admin dashboard slides in
      setTimeout(() => setPhase(2), 5000),   // Highlight a post (star)
      setTimeout(() => setPhase(3), 9000),   // Sidebar click -> Team Management Dialog
      setTimeout(() => setPhase(4), 11000),  // 3 Toggles flick on
      setTimeout(() => setPhase(5), 16000),  // Dialog closes, Export button click
      setTimeout(() => setPhase(6), 19000),  // Transform into slide
      setTimeout(() => setPhase(7), 26000),  // End hold
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center bg-slate-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.8 }}
    >
      {/* Chapter Indicator */}
      {phase < 6 && (
        <motion.div 
          className="absolute top-[8%] left-0 right-0 flex justify-center z-50"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <div className="bg-[#0F172A] text-white px-6 py-2 rounded-full shadow-md">
            <span className="font-semibold tracking-wide text-sm uppercase">Admin Portal</span>
          </div>
        </motion.div>
      )}

      {/* ADMIN DASHBOARD UI */}
      <motion.div 
        className="w-[85vw] h-[75vh] bg-white rounded-2xl shadow-heavy border border-slate-200 overflow-hidden flex relative"
        initial={{ scale: 0.9, opacity: 0, y: 40 }}
        animate={{ 
          scale: phase >= 6 ? 1.1 : 1, 
          opacity: phase >= 6 ? 0 : 1,
          y: 0 
        }}
        transition={{ type: "spring", damping: 30, stiffness: 100 }}
      >
        {/* Sidebar */}
        <div className="w-64 border-r border-slate-200 bg-slate-50 flex flex-col py-6 px-4">
          <div className="font-black text-xl text-slate-900 mb-8 px-4 flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#0059D6]" />
            SentConnect
          </div>
          
          <div className="flex flex-col gap-2">
            <div className={`px-4 py-3 rounded-xl font-semibold flex items-center gap-3 transition-colors ${phase < 3 ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>
              <LayoutDashboard className="w-5 h-5" />
              Feed
            </div>
            <motion.div 
              className={`px-4 py-3 rounded-xl font-semibold flex items-center gap-3 transition-colors ${phase >= 3 && phase < 5 ? 'bg-[#0F172A] text-white shadow-sm' : 'text-slate-500'}`}
              animate={{
                backgroundColor: phase >= 3 && phase < 5 ? "#0F172A" : "transparent",
                color: phase >= 3 && phase < 5 ? "#FFFFFF" : "#64748B"
              }}
            >
              <Users className="w-5 h-5" />
              Team
            </motion.div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-white p-8 overflow-hidden relative">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900">
              {phase >= 3 && phase < 5 ? 'Team Management' : 'Organization Feed'}
            </h1>
            {phase < 3 && (
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <div className="px-4 py-1.5 bg-white shadow-sm rounded-md text-sm font-semibold text-slate-900">All Posts</div>
                <div className="px-4 py-1.5 text-sm font-semibold text-slate-500 flex items-center gap-1">
                  <Star className="w-4 h-4" /> Highlighted
                </div>
              </div>
            )}
          </div>

          {/* Feed View */}
          {phase < 3 && (
            <div className="grid grid-cols-2 gap-6">
              {/* Post 1 */}
              <motion.div 
                className="border border-slate-200 rounded-xl p-5 shadow-sm relative overflow-hidden"
                animate={{
                  borderColor: phase >= 2 ? "#0059D6" : "#E2E8F0",
                  boxShadow: phase >= 2 ? "0 4px 20px -2px rgba(255,69,0,0.15)" : "0 1px 3px rgba(0,0,0,0.05)"
                }}
              >
                {/* Highlight Badge */}
                <motion.div 
                  className="absolute top-4 right-4 bg-[#0059D6] text-white p-1.5 rounded-full z-10"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: phase >= 2 ? 1 : 0, opacity: phase >= 2 ? 1 : 0 }}
                  transition={{ type: "spring", bounce: 0.6 }}
                >
                  <Star className="w-4 h-4 fill-current" />
                </motion.div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-white font-bold text-sm">JD</div>
                  <div>
                    <div className="font-bold text-slate-900">John Doe</div>
                    <div className="text-xs text-slate-500">Addis Ababa, Ethiopia</div>
                  </div>
                </div>
                <div className="w-full h-32 rounded-lg bg-slate-100 mb-4 overflow-hidden">
                   <img src={`${import.meta.env.BASE_URL}images/field-worker.png`} className="w-full h-full object-cover" />
                </div>
                <p className="text-slate-800 font-medium line-clamp-2">Arrived safely at the project site. The team is ready to begin work tomorrow!</p>
              </motion.div>

              {/* Post 2 */}
              <div className="border border-slate-200 rounded-xl p-5 shadow-sm opacity-60">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-emerald-800 rounded-full flex items-center justify-center text-white font-bold text-sm">SM</div>
                  <div>
                    <div className="font-bold text-slate-900">Sarah Miller</div>
                    <div className="text-xs text-slate-500">Addis Ababa, Ethiopia</div>
                  </div>
                </div>
                <div className="w-full h-32 rounded-lg bg-slate-200 mb-4" />
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
              </div>
            </div>
          )}

          {/* Export Button Overlay (Phase 5) */}
          {phase === 5 && (
            <motion.div 
              className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.button 
                className="bg-[#0F172A] text-white px-8 py-4 rounded-full text-xl font-bold flex items-center gap-3 shadow-heavy"
                whileHover={{ scale: 1.05 }}
                animate={{ scale: [1, 1.05, 0.9], opacity: [1, 1, 0] }}
                transition={{ duration: 1, times: [0, 0.5, 1], delay: 1 }}
              >
                <Download className="w-6 h-6" />
                Export as Report
              </motion.button>
            </motion.div>
          )}
        </div>

        {/* TEAM MANAGEMENT OVERLAY (Phase 3 & 4) */}
        <AnimatePresence>
          {phase >= 3 && phase < 5 && (
            <motion.div 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="bg-white rounded-2xl shadow-heavy w-[450px] overflow-hidden"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
              >
                <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-white font-bold text-lg">JD</div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">John Doe</h2>
                    <p className="text-slate-500 font-medium">Field Missionary</p>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4" /> Role & Permissions
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Toggle 1 */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900">Submit Reports</div>
                        <div className="text-sm text-slate-500">Allow user to post updates</div>
                      </div>
                      <motion.div 
                        className="w-12 h-6 rounded-full p-1 cursor-pointer flex"
                        animate={{ backgroundColor: phase >= 4 ? "#10B981" : "#E2E8F0" }}
                      >
                        <motion.div 
                          className="w-4 h-4 bg-white rounded-full shadow-sm"
                          animate={{ x: phase >= 4 ? 24 : 0 }}
                        />
                      </motion.div>
                    </div>

                    {/* Toggle 2 */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900">View All Reports</div>
                        <div className="text-sm text-slate-500">Access full org timeline</div>
                      </div>
                      <motion.div 
                        className="w-12 h-6 rounded-full p-1 cursor-pointer flex"
                        animate={{ backgroundColor: phase >= 4 ? "#10B981" : "#E2E8F0" }}
                        transition={{ delay: 0.2 }}
                      >
                        <motion.div 
                          className="w-4 h-4 bg-white rounded-full shadow-sm"
                          animate={{ x: phase >= 4 ? 24 : 0 }}
                          transition={{ delay: 0.2 }}
                        />
                      </motion.div>
                    </div>

                    {/* Toggle 3 */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900">Manage Team</div>
                        <div className="text-sm text-slate-500">Admin access</div>
                      </div>
                      <motion.div 
                        className="w-12 h-6 rounded-full p-1 cursor-pointer flex bg-slate-200"
                        animate={{ backgroundColor: "#E2E8F0" }}
                      >
                        <motion.div className="w-4 h-4 bg-white rounded-full shadow-sm x-0" />
                      </motion.div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                  <button className="bg-[#0F172A] text-white px-6 py-2 rounded-lg font-bold">Save Changes</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>

      {/* EXPORTED SLIDE (Phase 6) */}
      <AnimatePresence>
        {phase >= 6 && (
          <motion.div 
            className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-xl z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* The Slide Presentation Image */}
            <motion.div 
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 0.4, scale: 1 }}
              transition={{ duration: 2 }}
            >
              <img src={`${import.meta.env.BASE_URL}images/church-presentation.jpg`} className="w-full h-full object-cover" />
            </motion.div>

            {/* The actual slide graphic in the center */}
            <motion.div 
              className="w-[70vw] aspect-[16/9] bg-white relative z-10 shadow-[0_0_100px_rgba(255,255,255,0.2)] flex rounded-lg overflow-hidden"
              initial={{ rotateX: 90, opacity: 0, y: 100 }}
              animate={{ rotateX: 0, opacity: 1, y: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 80, delay: 0.5 }}
              style={{ perspective: 1000 }}
            >
              {/* Slide Content */}
              <div className="w-1/2 h-full bg-[#0F172A] text-white p-12 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-[#0059D6] rounded mb-6" />
                  <h1 className="text-5xl font-black leading-tight mb-4 tracking-tight">Field Update:<br/>Addis Ababa Project</h1>
                  <p className="text-xl text-slate-300 font-medium">"Arrived safely at the project site. The team is ready to begin work tomorrow!"</p>
                </div>
                
                <div className="flex items-center gap-4 border-t border-slate-700 pt-6">
                  <div className="w-16 h-16 rounded-full bg-slate-600 flex items-center justify-center text-xl font-bold">JD</div>
                  <div>
                    <div className="text-2xl font-bold">John Doe</div>
                    <div className="text-[#0059D6] font-semibold text-lg">Grace Church Missions</div>
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
