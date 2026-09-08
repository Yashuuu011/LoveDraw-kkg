import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Gift, Calendar, ArrowRight, ShieldCheck, Trophy, Image as ImageIcon } from 'lucide-react';
import api from '../services/api';
import { DailyMessage, Draw, Memory, Winner } from '../types';
import DrawCard from '../components/DrawCard';
import Envelope from '../components/Envelope';
import CountdownTimer from '../components/CountdownTimer';

export const Home: React.FC = () => {
  const [todayMessage, setTodayMessage] = useState<DailyMessage | null>(null);
  const [activeDraws, setActiveDraws] = useState<Draw[]>([]);
  const [recentMemories, setRecentMemories] = useState<Memory[]>([]);
  const [previousWinners, setPreviousWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [msgRes, drawsRes, memoriesRes, winnersRes] = await Promise.all([
          api.get('/messages/today'),
          api.get('/draws?status=ACTIVE'),
          api.get('/memories'),
          api.get('/winners')
        ]);

        if (msgRes.data.success) setTodayMessage(msgRes.data.data);
        if (drawsRes.data.success) setActiveDraws(drawsRes.data.data);
        if (memoriesRes.data.success) setRecentMemories(memoriesRes.data.data.slice(0, 4));
        if (winnersRes.data.success) setPreviousWinners(winnersRes.data.data.slice(0, 3));
      } catch (error) {
        console.error('Error loading home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const featuredDraw = activeDraws[0];

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-16 overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-rose-500/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-gold-500/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 text-center space-y-8 relative z-10">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-panel border border-rose-400/30 text-rose-300 text-xs sm:text-sm font-semibold shadow-xl"
          >
            <Sparkles className="w-4 h-4 text-gold-400 animate-pulse" />
            <span>Welcome to the Romantic Community of LoveDraw</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1]"
          >
            <span className="rose-gradient-text">A Little Luck.</span> <br />
            <span className="gold-gradient-text italic font-normal">A Lot of Love. ❤️</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-2xl text-blush-200/90 max-w-2xl mx-auto font-light leading-relaxed"
          >
            Every day brings a new message. Every month brings a new memory.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link
              to="/draws"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-rose-500 via-rose-600 to-burgundy-600 hover:from-rose-400 hover:to-burgundy-500 text-white font-bold text-base shadow-xl shadow-rose-900/50 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-1"
            >
              <Gift className="w-5 h-5 text-gold-300" />
              <span>Explore This Month's Draw</span>
            </Link>

            <Link
              to="/daily-love"
              className="w-full sm:w-auto px-8 py-4 rounded-full glass-card hover:border-rose-400/40 text-blush-100 font-semibold text-base flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-1"
            >
              <Heart className="w-5 h-5 text-rose-400" />
              <span>Read Today's Message</span>
            </Link>
          </motion.div>

          {/* Demo Notice tag */}
          <p className="text-xs text-blush-300/60 pt-2">
            ✨ Safe Demo Environment • Legally Permitted Prize Community
          </p>
        </div>
      </section>

      {/* Section 2: Today's Love Note Section */}
      {todayMessage && (
        <section className="max-w-5xl mx-auto px-4">
          <div className="text-center space-y-3 mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-400">Daily Inspiration</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold rose-gradient-text">Today's Love Note 💌</h2>
            <p className="text-sm text-blush-200">Tap the envelope to unseal today's romantic message.</p>
          </div>

          <Envelope message={todayMessage} />
        </section>
      )}

      {/* Section 3: Featured Active Draw */}
      {featuredDraw && (
        <section className="max-w-6xl mx-auto px-4">
          <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-rose-400/30 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-400/30">
                  <Sparkles className="w-4 h-4 text-gold-400" />
                  <span>Featured Draw of the Month</span>
                </div>

                <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-white">
                  {featuredDraw.title}
                </h2>

                <p className="text-sm sm:text-base text-blush-200 leading-relaxed">
                  {featuredDraw.description}
                </p>

                <div className="p-4 rounded-2xl glass-card border border-rose-400/20 space-y-3">
                  <p className="text-xs text-rose-300 font-semibold uppercase tracking-wider text-center">
                    Draw Countdown
                  </p>
                  <CountdownTimer targetDate={featuredDraw.endDate} />
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                  <Link
                    to={`/draw/${featuredDraw.id}`}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-rose-500 to-burgundy-600 hover:from-rose-400 hover:to-burgundy-500 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all"
                  >
                    <span>View Draw & Enter</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <span className="text-xs text-gold-300 font-semibold">
                    Demo Entry: ₹{featuredDraw.entryPriceINR}
                  </span>
                </div>
              </div>

              {/* Prize Image Showcase */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-rose-400/30 shadow-2xl group">
                <img
                  src={featuredDraw.prizeImage}
                  alt={featuredDraw.prizeTitle}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-plum-950/90 via-transparent to-transparent" />

                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl glass-card backdrop-blur-md">
                  <p className="text-xs text-gold-300 font-semibold">Grand Prize</p>
                  <p className="text-base font-bold text-white">{featuredDraw.prizeTitle}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Section 4: How It Works */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-400">Simple & Romantic</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold rose-gradient-text">How It Works ✨</h2>
          <p className="text-sm text-blush-200 max-w-lg mx-auto">Three elegant steps to participate and celebrate love.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card rounded-3xl p-8 space-y-4 border border-rose-400/20 relative group hover:border-rose-400/40">
            <span className="font-serif text-5xl font-black text-rose-500/20 group-hover:text-rose-500/40 transition-colors">
              01
            </span>
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center text-rose-400">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-white">Discover 💌</h3>
            <p className="text-sm text-blush-200 leading-relaxed">
              Open today's love message every single day to uncover a fresh, heart-warming quote.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-8 space-y-4 border border-rose-400/20 relative group hover:border-rose-400/40">
            <span className="font-serif text-5xl font-black text-gold-500/20 group-hover:text-gold-500/40 transition-colors">
              02
            </span>
            <div className="w-12 h-12 rounded-2xl bg-gold-500/20 flex items-center justify-center text-gold-400">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-white">Join ❤️</h3>
            <p className="text-sm text-blush-200 leading-relaxed">
              Participate in an eligible weekly or monthly draw using our safe demo QR gateway.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-8 space-y-4 border border-rose-400/20 relative group hover:border-rose-400/40">
            <span className="font-serif text-5xl font-black text-emerald-500/20 group-hover:text-emerald-500/40 transition-colors">
              03
            </span>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-white">Celebrate 🎉</h3>
            <p className="text-sm text-blush-200 leading-relaxed">
              On draw day, watch the cinematic winner reveal animation and celebrate couple memories.
            </p>
          </div>
        </div>
      </section>

      {/* Section 5: Recent Memories Gallery Preview */}
      {recentMemories.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-gold-400">Captured Moments</span>
              <h2 className="font-serif text-3xl font-bold rose-gradient-text">Recent Memories 📷</h2>
            </div>
            <Link
              to="/memories"
              className="text-sm font-semibold text-rose-300 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <span>Explore All Memories</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentMemories.map((m) => (
              <div key={m.id} className="glass-card rounded-2xl overflow-hidden border border-rose-400/20 group">
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={m.imageUrl}
                    alt={m.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-plum-950 via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-xs font-bold text-white truncate">{m.title}</p>
                    <p className="text-[10px] text-gold-300">{m.winnerName || 'Love Community'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Section 6: Romantic Quote Banner */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="glass-panel rounded-3xl p-10 text-center border border-gold-400/30 relative overflow-hidden">
          <Heart className="w-12 h-12 text-rose-400/20 fill-rose-400/20 absolute top-4 left-6" />
          <Heart className="w-16 h-16 text-rose-400/10 fill-rose-400/10 absolute bottom-4 right-6" />

          <p className="font-serif text-2xl sm:text-3xl text-blush-50 italic leading-relaxed">
            "Whatever our souls are made of, yours and mine are carved from the very same light."
          </p>
          <p className="text-xs text-gold-300 font-semibold tracking-widest uppercase mt-4">
            — Romantic Proverb
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
