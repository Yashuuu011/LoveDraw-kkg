import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Share2, Bookmark, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DailyMessage } from '../types';

interface EnvelopeProps {
  message: DailyMessage;
  onFavorite?: (id: string) => void;
  isFavorited?: boolean;
}

export const Envelope: React.FC<EnvelopeProps> = ({ message, onFavorite, isFavorited = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleOpen = () => {
    if (!isOpen) {
      setIsOpen(true);
      // Trigger romantic heart confetti burst!
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#E87A90', '#F4A5B5', '#D4AF37', '#FFF0F2'],
        shapes: ['circle']
      });
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`"${message.message}" — Love Note via LoveDraw ❤️`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFavClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFavorite) onFavorite(message.id);
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center py-6">
      {/* 3D Animated Envelope Container */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] max-w-lg cursor-pointer group" onClick={handleOpen}>
        {/* Envelope Back Body */}
        <div className="absolute inset-0 bg-gradient-to-br from-burgundy-900 via-plum-900 to-burgundy-800 rounded-3xl border-2 border-rose-400/40 shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden">
          {/* Inner lining pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#E87A90_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
        </div>

        {/* Paper Letter Sliding Out */}
        <motion.div
          initial={{ y: 0, scale: 0.95 }}
          animate={
            isOpen
              ? { y: '-62%', scale: 1, zIndex: 30 }
              : { y: 0, scale: 0.95, zIndex: 5 }
          }
          transition={{ duration: 0.9, ease: [0.34, 1.56, 0.64, 1] }}
          className="absolute left-4 right-4 bottom-4 top-4 bg-white text-slate-900 dark:text-white rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between border border-rose-200"
        >
          {/* Top Letter Header */}
          <div className="flex items-center justify-between border-b border-rose-200/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wider uppercase text-rose-600 bg-rose-100 px-3 py-1 rounded-full">
                {message.category}
              </span>
              <span className="text-xs text-stone-500 font-serif italic">Today's Love Note</span>
            </div>
            <Sparkles className="w-4 h-4 text-gold-500" />
          </div>

          {/* Core Romantic Quote Message */}
          <div className="my-auto py-4 text-center">
            <motion.p
              initial={{ opacity: 0 }}
              animate={isOpen ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="font-serif text-xl sm:text-2xl lg:text-3xl text-slate-900 dark:text-white leading-relaxed font-bold"
            >
              "{message.message}"
            </motion.p>
          </div>

          {/* Letter Footer Controls */}
          <div className="flex items-center justify-between pt-3 border-t border-rose-200/60 text-xs">
            <span className="text-stone-500 font-medium flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              LoveDraw Daily Note
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-rose-100 text-rose-700 font-medium hover:bg-rose-200 transition-colors"
                title="Copy note"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Share'}</span>
              </button>

              {onFavorite && (
                <button
                  onClick={handleFavClick}
                  className={`p-1.5 rounded-full transition-colors ${
                    isFavorited
                      ? 'bg-rose-500 text-white'
                      : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                  }`}
                  title="Favorite this note"
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isFavorited ? 'fill-white' : ''}`} />
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Envelope Front Pocket Flaps */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          {/* Left Flap */}
          <div
            className="absolute left-0 bottom-0 top-0 w-1/2 bg-gradient-to-r from-burgundy-800 to-burgundy-700"
            style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }}
          />

          {/* Right Flap */}
          <div
            className="absolute right-0 bottom-0 top-0 w-1/2 bg-gradient-to-l from-burgundy-800 to-burgundy-700"
            style={{ clipPath: 'polygon(100% 0, 0 50%, 100% 100%)' }}
          />

          {/* Bottom Flap */}
          <div
            className="absolute left-0 right-0 bottom-0 h-1/2 bg-gradient-to-t from-burgundy-900 to-burgundy-800 border-t border-rose-400/20"
            style={{ clipPath: 'polygon(0 100%, 50% 0, 100% 100%)' }}
          />
        </div>

        {/* Animated Top Triangular Flap */}
        <motion.div
          initial={{ rotateX: 0 }}
          animate={isOpen ? { rotateX: 180, zIndex: 1 } : { rotateX: 0, zIndex: 25 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          style={{ transformOrigin: 'top center', clipPath: 'polygon(0 0, 50% 100%, 100% 0)' }}
          className="absolute left-0 right-0 top-0 h-1/2 bg-gradient-to-b from-burgundy-700 to-burgundy-800 border-b border-rose-400/30 rounded-t-3xl shadow-lg pointer-events-none"
        >
          {/* Gold Heart Wax Seal */}
          {!isOpen && (
            <div className="absolute left-1/2 top-[65%] -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gradient-to-tr from-gold-600 via-gold-400 to-gold-300 shadow-xl flex items-center justify-center border-2 border-gold-300 animate-pulse">
              <Heart className="w-6 h-6 text-burgundy-900 fill-burgundy-900" />
            </div>
          )}
        </motion.div>

        {/* Prompt Seal Banner when closed */}
        {!isOpen && (
          <div className="absolute inset-x-0 -bottom-10 flex justify-center z-40">
            <span className="px-5 py-2 rounded-full glass-panel text-xs text-gold-300 font-semibold border border-gold-400/40 shadow-xl animate-bounce flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              Tap to open today's love envelope! ❤️
            </span>
          </div>
        )}
      </div>

      {/* Reminder Text after open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-20 text-center space-y-1"
          >
            <p className="text-sm font-serif italic text-rose-300">
              "Come back tomorrow for another little reminder of love. 💕"
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Envelope;
