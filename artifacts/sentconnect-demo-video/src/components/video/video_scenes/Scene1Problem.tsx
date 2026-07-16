import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { MessageSquare, Mail, Smartphone, Globe } from 'lucide-react';

export function Scene1Problem() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),  // icons float
      setTimeout(() => setPhase(2), 2000), // text shifts
      setTimeout(() => setPhase(3), 5000), // exit start
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
      transition={{ duration: 0.8 }}
    >
      <div className="relative w-full max-w-4xl mx-auto h-[540px] flex items-center justify-center">
        {/* Scattered messy updates metaphor */}
        <motion.div 
          className="absolute top-[20%] left-[20%] w-24 h-24 bg-white rounded-2xl shadow-soft flex items-center justify-center border border-slate-100"
          initial={{ opacity: 0, y: 50, rotate: -15 }}
          animate={{ 
            opacity: phase >= 1 ? 1 : 0, 
            y: phase >= 1 ? 0 : 50,
            rotate: phase >= 2 ? -5 : -15,
            x: phase >= 2 ? -20 : 0
          }}
          transition={{ type: "spring", bounce: 0.4 }}
        >
          <MessageSquare className="w-10 h-10 text-slate-400" />
        </motion.div>

        <motion.div 
          className="absolute top-[30%] right-[25%] w-20 h-20 bg-white rounded-2xl shadow-soft flex items-center justify-center border border-slate-100"
          initial={{ opacity: 0, y: -40, rotate: 20 }}
          animate={{ 
            opacity: phase >= 1 ? 0.8 : 0, 
            y: phase >= 1 ? 0 : -40,
            rotate: phase >= 2 ? 10 : 20,
            x: phase >= 2 ? 30 : 0
          }}
          transition={{ type: "spring", bounce: 0.4, delay: 0.1 }}
        >
          <Mail className="w-8 h-8 text-slate-400" />
        </motion.div>

        <motion.div 
          className="absolute bottom-[25%] left-[30%] w-28 h-28 bg-white rounded-2xl shadow-soft flex items-center justify-center border border-slate-100"
          initial={{ opacity: 0, scale: 0.5, rotate: 10 }}
          animate={{ 
            opacity: phase >= 1 ? 0.9 : 0, 
            scale: phase >= 1 ? 1 : 0.5,
            rotate: phase >= 2 ? -10 : 10,
            y: phase >= 2 ? 20 : 0
          }}
          transition={{ type: "spring", bounce: 0.4, delay: 0.2 }}
        >
          <Smartphone className="w-12 h-12 text-slate-400" />
        </motion.div>

        <motion.div 
          className="absolute bottom-[20%] right-[35%] w-20 h-20 bg-white rounded-2xl shadow-soft flex items-center justify-center border border-slate-100"
          initial={{ opacity: 0, x: 40, rotate: -25 }}
          animate={{ 
            opacity: phase >= 1 ? 0.7 : 0, 
            x: phase >= 1 ? 0 : 40,
            rotate: phase >= 2 ? 5 : -25,
            y: phase >= 2 ? 10 : 0
          }}
          transition={{ type: "spring", bounce: 0.4, delay: 0.3 }}
        >
          <Globe className="w-8 h-8 text-slate-400" />
        </motion.div>

        {/* Central Text */}
        <div className="z-10 flex flex-col items-center">
          <motion.h1 
            className="text-[64px] font-bold text-slate-900 tracking-tight text-center leading-[1.1]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Missionary updates are scattered.
          </motion.h1>
          
          <motion.p 
            className="mt-6 text-[32px] text-slate-500 font-medium tracking-tight text-center max-w-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 2 ? 1 : 0 }}
            transition={{ duration: 0.8 }}
          >
            Texts, emails, random apps.<br/>
            The church back home misses the story.
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}
