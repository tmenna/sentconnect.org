import { motion } from 'framer-motion';

export function Scene5Close() {
  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center bg-[#0F172A] text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo Mark */}
        <motion.div 
          className="flex items-center gap-4 mb-8"
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 1, type: 'spring', bounce: 0.4 }}
        >
          <img
            src={`${import.meta.env.BASE_URL}images/logo-white.png`}
            alt="SentConnect"
            className="h-24 w-auto object-contain"
          />
        </motion.div>

        {/* Tagline */}
        <motion.h2 
          className="text-3xl font-medium text-slate-300 mb-12 tracking-tight"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Bring the field home.
        </motion.h2>

        {/* URL */}
        <motion.div 
          className="px-6 py-3 bg-white/10 rounded-full border border-white/20 text-xl font-mono text-white/80"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          demo.sentconnect.org
        </motion.div>
      </div>

      {/* Cinematic ambient background */}
      <motion.div 
        className="absolute inset-0 pointer-events-none opacity-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 2 }}
      >
        <img 
          src={`${import.meta.env.BASE_URL}images/laptop-desk.jpg`} 
          className="w-full h-full object-cover mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-[#0F172A]" />
      </motion.div>
    </motion.div>
  );
}
