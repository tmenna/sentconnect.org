import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { MapPin, Image as ImageIcon, Heart, ThumbsUp, Send, Link, Check, MessageSquare, Globe } from 'lucide-react';

export function Scene2Field() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 800),    // Composer slides up
      setTimeout(() => setPhase(2), 2500),   // Image drops in, text types out
      setTimeout(() => setPhase(3), 6000),   // Hit post
      setTimeout(() => setPhase(4), 7000),   // Transforms into feed card
      setTimeout(() => setPhase(5), 10000),  // Reactions
      setTimeout(() => setPhase(6), 14000),  // Comment slides in
      setTimeout(() => setPhase(7), 18000),  // Copy link click
      setTimeout(() => setPhase(8), 21000),  // Success toast
      setTimeout(() => setPhase(9), 23500),  // Float out
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -100, filter: 'blur(10px)' }}
      transition={{ duration: 0.8 }}
    >
      
      {/* Title indicating chapter */}
      <motion.div 
        className="absolute top-[10%] left-0 right-0 flex justify-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : -20 }}
        transition={{ duration: 0.8 }}
      >
        <div className="bg-white/80 backdrop-blur-md px-6 py-2 rounded-full shadow-sm border border-slate-200">
          <span className="text-slate-500 font-semibold tracking-wide text-sm uppercase">Field User</span>
        </div>
      </motion.div>

      {/* Main UI Device / Card Container */}
      <motion.div 
        className="relative bg-white rounded-3xl shadow-heavy border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col"
        initial={{ y: "100vh", opacity: 0, scale: 0.9 }}
        animate={{ 
          y: phase >= 1 ? 0 : "100vh", 
          opacity: phase >= 1 ? 1 : 0,
          scale: phase >= 9 ? 0.8 : (phase >= 4 ? 1 : 0.95),
          rotate: phase >= 9 ? -5 : 0
        }}
        transition={{ type: "spring", damping: 25, stiffness: 120 }}
      >
        
        {/* COMPOSER STATE (Phases 1-3) */}
        {phase < 4 && (
          <motion.div 
            className="p-6 flex flex-col gap-4"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(5px)" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0" />
              <div className="h-4 w-32 bg-slate-200 rounded-full" />
            </div>

            <motion.div 
              className="w-full min-h-[100px] border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center p-4 bg-slate-50 relative overflow-hidden"
              animate={{ 
                height: phase >= 2 ? "200px" : "100px",
                borderColor: phase >= 2 ? "transparent" : "#E2E8F0"
              }}
              transition={{ duration: 0.5 }}
            >
              {phase < 2 && (
                <div className="flex flex-col items-center text-slate-400 gap-2">
                  <ImageIcon className="w-6 h-6" />
                  <span className="text-sm font-medium">Drag & Drop Photo/Video</span>
                </div>
              )}
              {phase >= 2 && (
                <motion.img 
                  src={`${import.meta.env.BASE_URL}images/field-worker.jpg`}
                  className="absolute inset-0 w-full h-full object-cover"
                  initial={{ opacity: 0, scale: 1.2 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                />
              )}
            </motion.div>

            <motion.div 
              className="text-slate-800 text-lg leading-relaxed font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: phase >= 2 ? 1 : 0 }}
            >
              Arrived safely at the project site. The team is ready to begin work tomorrow!
            </motion.div>

            <motion.div 
              className="flex items-center gap-2 text-[#FF4500] bg-[#FF4500]/10 px-3 py-1.5 rounded-full w-max text-sm font-medium"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: phase >= 2 ? 1 : 0, x: phase >= 2 ? 0 : -20 }}
              transition={{ delay: 0.4 }}
            >
              <MapPin className="w-4 h-4" />
              Nairobi, Kenya
            </motion.div>

            <div className="mt-4 flex justify-end">
              <motion.button 
                className="bg-[#0F172A] text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 shadow-md"
                whileHover={{ scale: 1.05 }}
                animate={{ 
                  scale: phase === 3 ? 0.95 : 1,
                  backgroundColor: phase === 3 ? "#FF4500" : "#0F172A"
                }}
              >
                <Send className="w-4 h-4" />
                Post Update
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* FEED CARD STATE (Phases 4+) */}
        {phase >= 4 && (
          <motion.div 
            className="flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Post Header */}
            <div className="p-6 pb-4 flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold text-lg">
                  JD
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">John Doe</h3>
                  <p className="text-sm text-slate-500">2 mins ago • Grace Church</p>
                </div>
              </div>
              
              {/* Copy Link Button / Toast */}
              <motion.button 
                className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors relative"
                animate={{ 
                  color: phase >= 7 ? "#FF4500" : "#94A3B8",
                  backgroundColor: phase >= 7 ? "#FF45001a" : "transparent",
                  scale: phase === 7 ? [1, 1.2, 1] : 1
                }}
              >
                {phase >= 8 ? <Check className="w-5 h-5" /> : <Link className="w-5 h-5" />}
                
                {/* Copied Toast */}
                <motion.div 
                  className="absolute right-0 top-full mt-2 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap font-medium pointer-events-none shadow-lg"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: phase >= 8 ? 1 : 0, y: phase >= 8 ? 0 : -10 }}
                >
                  Public link copied!
                </motion.div>
              </motion.button>
            </div>

            {/* Post Content */}
            <div className="px-6 pb-4 text-slate-800 text-lg font-medium">
              Arrived safely at the project site. The team is ready to begin work tomorrow!
            </div>

            {/* Media */}
            <div className="w-full h-[250px] relative">
              <img 
                src={`${import.meta.env.BASE_URL}images/field-worker.jpg`}
                className="w-full h-full object-cover"
                alt="Field Work"
              />
              <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium">
                <MapPin className="w-4 h-4" />
                Nairobi, Kenya
              </div>
            </div>

            {/* Reactions Bar */}
            <div className="p-4 px-6 border-b border-slate-100 flex items-center gap-6 text-slate-500 font-medium">
              <motion.div 
                className="flex items-center gap-2"
                animate={{ color: phase >= 5 ? "#EF4444" : "#94A3B8" }}
              >
                <motion.div
                  animate={{ scale: phase >= 5 ? [1, 1.5, 1] : 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Heart className={`w-5 h-5 ${phase >= 5 ? 'fill-current' : ''}`} />
                </motion.div>
                <span>{phase >= 5 ? '24' : '0'}</span>
              </motion.div>

              <motion.div 
                className="flex items-center gap-2"
                animate={{ color: phase >= 5 ? "#3B82F6" : "#94A3B8" }}
              >
                <motion.div
                  animate={{ scale: phase >= 5 ? [1, 1.4, 1] : 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <ThumbsUp className={`w-5 h-5 ${phase >= 5 ? 'fill-current' : ''}`} />
                </motion.div>
                <span>{phase >= 5 ? '12' : '0'}</span>
              </motion.div>
            </div>

            {/* Comments Section */}
            <div className="p-6 bg-slate-50 flex-1 min-h-[120px] relative overflow-hidden">
              <motion.div 
                className="flex gap-3 bg-white p-3 rounded-2xl shadow-sm border border-slate-100"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: phase >= 6 ? 1 : 0, x: phase >= 6 ? 0 : 50 }}
                transition={{ type: "spring", damping: 20 }}
              >
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs flex-shrink-0">
                  SM
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">Sarah Miller</div>
                  <div className="text-sm text-slate-600 mt-0.5">Praying for you and the team! 🙏</div>
                </div>
              </motion.div>
            </div>

          </motion.div>
        )}
      </motion.div>

      {/* Floating text for shareability */}
      <motion.div
        className="absolute bottom-[15%] right-[20%] max-w-xs"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: phase >= 9 ? 1 : 0, y: phase >= 9 ? 0 : 20 }}
      >
        <div className="bg-white p-6 rounded-2xl shadow-heavy border border-slate-100">
          <Globe className="w-8 h-8 text-[#FF4500] mb-3" />
          <h4 className="text-xl font-bold text-slate-900 mb-2">Share with anyone</h4>
          <p className="text-slate-500 font-medium">Public links open instantly. No app download or login required.</p>
        </div>
      </motion.div>

    </motion.div>
  );
}
