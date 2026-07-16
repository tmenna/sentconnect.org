import { motion } from 'framer-motion';

export function Scene3Transition() {
  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center bg-[#0F172A]"
      initial={{ opacity: 0, clipPath: 'circle(0% at 50% 50%)' }}
      animate={{ opacity: 1, clipPath: 'circle(150% at 50% 50%)' }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.h2 
        className="text-[80px] font-bold text-white tracking-tight text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        And for the church back home...
      </motion.h2>
    </motion.div>
  );
}
