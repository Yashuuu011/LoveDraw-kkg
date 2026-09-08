import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Trophy, Gift, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../services/api';
import { Winner } from '../types';

export const WinnerReveal: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [winner, setWinner] = useState<Winner | null>(null);
  const [stage, setStage] = useState<'INITIAL' | 'SPINNER' | 'REVEALED'>('INITIAL');
  const [spinnerText, setSpinnerText] = useState('Selecting winner...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWinner();
  }, [id]);

  const fetchWinner = async () => {
    try {
      const response = await api.get(`/winners/draw/${id}`);
      if (response.data.success) {
        setWinner(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching winner:', error);
    } finally {
      setLoading(false);
    }
  };

  const startRevealAnimation = () => {
    setStage('SPINNER');

    const names = ['Sarah J.', 'Alex R.', 'Priya S.', 'Mark T.', 'Elena K.', 'David P.', 'Ananya M.'];
    let count = 0;
    const interval = setInterval(() => {
      setSpinnerText(names[count % names.length]);
      count++;
    }, 120);

    setTimeout(() => {
      clearInterval(interval);
      setStage('REVEALED');

      // Trigger Confetti Explosion!
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#E87A90', '#D4AF37', '#FFF0F2', '#FFB7C5', '#831B2C']
      });
    }, 3200);
  };

  if (loading) {
    return (
      <div className="pt-32 pb-20 text-center">
        <p className="text-rose-300 font-serif italic text-lg animate-pulse">
          Preparing the winner reveal... 💕
        </p>
      </div>
    );
  }

  if (!winner) {
    return (
      <div className="pt-32 pb-20 max-w-md mx-auto text-center px-4">
        <div className="glass-card rounded-3xl p-8 space-y-4">
          <Trophy className="w-12 h-12 text-gold-400 mx-auto" />
          <h2 className="text-xl font-serif text-white font-bold">Winner Selection Pending</h2>
          <p className="text-sm text-blush-200">
            The draw is still active or the winner has not been selected yet.
          </p>
          <Link to={`/draw/${id}`} className="text-sm font-semibold text-rose-300 hover:text-white block pt-2">
            View Active Draw Page
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Darkened Screen Backdrop */}
      <div
        className={`fixed inset-0 transition-colors duration-1000 z-0 ${
          stage !== 'INITIAL' ? 'bg-plum-950/95' : 'bg-plum-950/60'
        }`}
      />

      {/* Floating Hearts Swell in Background */}
      {stage !== 'INITIAL' && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: '100vh', opacity: 0, scale: 0.5 }}
              animate={{ y: '-10vh', opacity: [0, 0.6, 0], scale: 1.2 }}
              transition={{ duration: 4, repeat: Infinity, delay: i * 0.2 }}
              style={{ left: `${Math.random() * 90}%` }}
              className="absolute text-rose-500/40"
            >
              <Heart className="w-8 h-8 fill-rose-500" />
            </motion.div>
          ))}
        </div>
      )}

      {/* Back button */}
      <div className="relative z-10 w-full max-w-2xl mb-6">
        <Link to="/draws" className="inline-flex items-center gap-2 text-xs text-blush-300 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
          Back to Draws
        </Link>
      </div>

      <div className="relative z-10 max-w-2xl w-full text-center space-y-8">
        {/* Stage 1: Initial Prompt */}
        {stage === 'INITIAL' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel rounded-3xl p-10 border border-gold-400/30 shadow-2xl space-y-6"
          >
            <div className="w-16 h-16 rounded-full bg-gold-500/20 flex items-center justify-center mx-auto text-gold-400 border border-gold-400/40">
              <Trophy className="w-8 h-8 animate-bounce" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-gold-300">
                {winner.draw?.title}
              </span>
              <h1 className="font-serif text-4xl sm:text-5xl font-extrabold text-white">
                Are you ready? ❤️
              </h1>
              <p className="text-sm text-blush-200">
                The moment to reveal our lucky romantic winner has arrived!
              </p>
            </div>

            <button
              onClick={startRevealAnimation}
              className="w-full py-4 rounded-full bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 hover:from-gold-300 hover:to-gold-500 text-burgundy-950 font-extrabold text-lg shadow-2xl shadow-gold-900/50 flex items-center justify-center gap-2 transition-all transform hover:scale-105"
            >
              <Sparkles className="w-5 h-5 text-burgundy-950" />
              <span>Reveal Winner Now</span>
            </button>
          </motion.div>
        )}

        {/* Stage 2: Slot Spinner Animation */}
        {stage === 'SPINNER' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel rounded-3xl p-12 border border-rose-400/40 shadow-2xl space-y-6"
          >
            <div className="w-20 h-20 rounded-full bg-rose-500/20 flex items-center justify-center mx-auto text-rose-400 border border-rose-400/30 animate-spin">
              <Sparkles className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <p className="text-xs text-gold-300 font-semibold uppercase tracking-widest">
                Server-Side Cryptographic RNG Draw
              </p>
              <p className="font-serif text-3xl font-bold text-white h-12 flex items-center justify-center">
                {spinnerText}
              </p>
            </div>
          </motion.div>
        )}

        {/* Stage 3: Revealed Winner Celebration */}
        {stage === 'REVEALED' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="glass-panel rounded-3xl p-8 sm:p-10 border-2 border-gold-400/50 shadow-[0_0_60px_rgba(212,175,55,0.3)] space-y-6"
          >
            {/* Winner Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-gold-500 to-gold-600 text-burgundy-950 font-black text-xs uppercase tracking-widest shadow-lg">
              <Trophy className="w-4 h-4" />
              <span>Official Draw Winner</span>
            </div>

            {/* Winner Name */}
            <div className="space-y-2">
              <h1 className="font-serif text-4xl sm:text-5xl font-black gold-gradient-text">
                Congratulations, {winner.user?.name}! ❤️
              </h1>
              <p className="text-sm font-serif italic text-rose-300">
                "{winner.announcementNote || 'May your love shine forever brighter than the stars!'}"
              </p>
            </div>

            {/* Prize Image Showcase */}
            {winner.draw && (
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-gold-400/40 shadow-2xl">
                <img
                  src={winner.draw.prizeImage}
                  alt={winner.draw.prizeTitle}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-plum-950 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-4 left-4 right-4 text-left">
                  <p className="text-xs text-gold-300 font-semibold flex items-center gap-1">
                    <Gift className="w-3.5 h-3.5" />
                    Prize Awarded
                  </p>
                  <p className="text-lg font-bold text-white">{winner.draw.prizeTitle}</p>
                </div>
              </div>
            )}

            <div className="pt-2">
              <Link
                to="/draws"
                className="px-8 py-3.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm inline-flex items-center gap-2 transition-all shadow-lg"
              >
                <span>Explore Next Draw</span>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default WinnerReveal;
