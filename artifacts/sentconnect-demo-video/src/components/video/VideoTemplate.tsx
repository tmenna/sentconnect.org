import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { Scene1Problem } from './video_scenes/Scene1Problem';
import { Scene2Field } from './video_scenes/Scene2Field';
import { Scene3Transition } from './video_scenes/Scene3Transition';
import { Scene4Admin } from './video_scenes/Scene4Admin';
import { Scene5Close } from './video_scenes/Scene5Close';

// Total duration ~80s
export const SCENE_DURATIONS = {
  problem: 6000,
  field: 28000,
  transition: 5000,
  admin: 30000,
  close: 11000
};

const SCENE_COMPONENTS: Record<string, React.ComponentType> = {
  problem: Scene1Problem,
  field: Scene2Field,
  transition: Scene3Transition,
  admin: Scene4Admin,
  close: Scene5Close,
};

const SCENE_START_SEC: Record<string, number> = (() => {
  const out: Record<string, number> = {};
  let cumulativeMs = 0;
  for (const [key, ms] of Object.entries(SCENE_DURATIONS)) {
    out[key] = cumulativeMs / 1000;
    cumulativeMs += ms;
  }
  return out;
})();

const AUDIO_SEEK_EPSILON_SEC = 0.18;

export default function VideoTemplate({
  durations = SCENE_DURATIONS,
  loop = true,
  muted = false,
  onSceneChange,
}: {
  durations?: Record<string, number>;
  loop?: boolean;
  muted?: boolean;
  onSceneChange?: (sceneKey: string) => void;
} = {}) {
  const { currentSceneKey } = useVideoPlayer({
    durations,
    loop,
  });

  useEffect(() => {
    onSceneChange?.(currentSceneKey);
  }, [currentSceneKey, onSceneChange]);

  const baseSceneKey = currentSceneKey.replace(/_r[12]$/, '');
  const SceneComponent = SCENE_COMPONENTS[baseSceneKey];

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.45;
    const targetTime = SCENE_START_SEC[baseSceneKey] ?? 0;
    if (Math.abs(audio.currentTime - targetTime) > AUDIO_SEEK_EPSILON_SEC) {
      audio.currentTime = targetTime;
    }
    audio.play().catch(() => {});
  }, [currentSceneKey, baseSceneKey, muted]);

  return (
    <div
      className="w-full h-screen overflow-hidden relative text-slate-900"
      style={{ backgroundColor: 'var(--color-bg-light)' }}
    >
      {/* Persistent Background layer */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Soft animated gradient orbs to give life */}
        <motion.div 
          className="absolute w-[80vw] h-[80vw] rounded-full blur-[100px] opacity-30"
          style={{ background: 'radial-gradient(circle, #E2E8F0, transparent)' }}
          animate={{ 
            x: ['-20%', '30%', '-10%'], 
            y: ['-20%', '10%', '-30%'],
            scale: [1, 1.2, 0.9]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div 
          className="absolute w-[60vw] h-[60vw] rounded-full blur-[80px] opacity-20 right-0 bottom-0"
          style={{ background: 'radial-gradient(circle, #CBD5E1, transparent)' }}
          animate={{ 
            x: ['20%', '-20%', '10%'], 
            y: ['10%', '-30%', '20%']
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        
        {/* Subtle grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-10" 
          style={{ backgroundImage: 'radial-gradient(#94A3B8 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />
      </div>

      <AnimatePresence mode="popLayout">
        {SceneComponent && <SceneComponent key={currentSceneKey} />}
      </AnimatePresence>

      <audio
        ref={audioRef}
        src={`${import.meta.env.BASE_URL}audio/bg_music.mp3`}
        preload="auto"
        autoPlay
        muted={muted}
      />
    </div>
  );
}
