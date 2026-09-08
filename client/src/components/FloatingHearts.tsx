import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface HeartParticle {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

export const FloatingHearts: React.FC = () => {
  const [hearts, setHearts] = useState<HeartParticle[]>([]);

  useEffect(() => {
    const generated: HeartParticle[] = Array.from({ length: 22 }, (_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage x-position
      size: Math.random() * 18 + 10, // 10px to 28px
      duration: Math.random() * 10 + 12, // 12s to 22s
      delay: Math.random() * 10,
      opacity: Math.random() * 0.4 + 0.15
    }));
    setHearts(generated);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {hearts.map((h) => (
        <motion.div
          key={h.id}
          initial={{ y: '105vh', opacity: 0, scale: 0.5, rotate: 0 }}
          animate={{
            y: '-10vh',
            opacity: [0, h.opacity, h.opacity, 0],
            scale: [0.5, 1.1, 0.9, 1],
            rotate: [0, 15, -15, 0]
          }}
          transition={{
            duration: h.duration,
            repeat: Infinity,
            delay: h.delay,
            ease: 'linear'
          }}
          style={{ left: `${h.x}%` }}
          className="absolute text-rose-400/40 select-none"
        >
          <svg
            width={h.size}
            height={h.size}
            viewBox="0 0 24 24"
            fill="currentColor"
            className="filter drop-shadow-[0_0_8px_rgba(232,122,144,0.4)]"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingHearts;
