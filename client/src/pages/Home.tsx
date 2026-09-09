import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Gift, ShieldCheck, Zap, Crosshair } from 'lucide-react';
import api from '../services/api';
import { DailyMessage, Draw, Memory, Winner } from '../types';
import CountdownTimer from '../components/CountdownTimer';
import { useSound } from '../context/SoundContext';

export const Home: React.FC = () => {
  const [activeDraws, setActiveDraws] = useState<Draw[]>([]);
  const [loading, setLoading] = useState(true);
  const [introFinished, setIntroFinished] = useState(false);
  const { playPortal, playClick } = useSound();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [drawsRes] = await Promise.all([
          api.get('/draws?status=ACTIVE')
        ]);
        if (drawsRes.data.success) setActiveDraws(drawsRes.data.data);
      } catch (error) {
        console.error('Error loading home data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const handleEnterUniverse = () => {
    playPortal();
    setIntroFinished(true);
  };

  const featuredDraw = activeDraws[0];

  return (
    <div className="relative min-h-screen bg-black overflow-hidden selection:bg-marvel-red/30">
      
      {/* Background Cosmic Effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Stars */}
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute bg-white rounded-full"
            style={{
              width: Math.random() * 3 + 'px',
              height: Math.random() * 3 + 'px',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{ opacity: [0.1, 0.8, 0.1], scale: [1, 1.2, 1] }}
            transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
          />
        ))}
      </div>

      {/* Intro Overlay Sequence */}
      <AnimatePresence>
        {!introFinished && (
          <motion.div
            className="fixed inset-0 z-[150] flex flex-col items-center justify-center bg-black"
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          >
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="relative flex flex-col items-center justify-center"
            >
              {/* Portal Ring */}
              <motion.div 
                className="absolute w-[400px] h-[400px] rounded-full border-4 border-accent border-dashed opacity-60 shadow-[0_0_50px_var(--accent)]"
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div 
                className="absolute w-[350px] h-[350px] rounded-full border-2 border-primary border-dotted opacity-80 shadow-[0_0_80px_var(--primary)]"
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              />
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 1 }}
                className="font-serif text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent relative z-10 text-center"
              >
                LOVE DRAW
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="text-white text-xl uppercase tracking-[0.3em] mt-4 font-sans font-bold"
              >
                Two hearts. One universe.
              </motion.p>

              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2.5, duration: 0.5 }}
                onClick={handleEnterUniverse}
                className="mt-16 px-8 py-4 relative group overflow-hidden bg-transparent border border-primary text-primary font-bold uppercase tracking-widest hover:text-white transition-colors z-20"
              >
                <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-[-1]" />
                <span className="relative z-10 flex items-center gap-2">
                  Enter Our Universe <Zap className="w-4 h-4" />
                </span>
                <div className="absolute inset-0 border border-accent animate-pulse opacity-50" />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Website Content (Visible after intro) */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: introFinished ? 1 : 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 pt-32 pb-20 px-4 max-w-7xl mx-auto space-y-32"
      >
        {/* Giant Glowing Portal Background */}
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] pointer-events-none z-0" />

        {/* Hero Section */}
        <section className="text-center space-y-6 relative z-10">
          <motion.h2 
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="font-serif text-5xl md:text-7xl font-bold text-white tracking-wider"
          >
            THE INITIATIVE <span className="text-primary">ASSEMBLES</span>
          </motion.h2>
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-text-secondary text-lg max-w-2xl mx-auto font-sans tracking-wide"
          >
            A secure multidimensional nexus. Track your romance metrics, explore multiverse draws, and document your shared timeline.
          </motion.p>
        </section>

        {/* Character / Section System (Avengers Inspired) */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
          
          {/* Iron Man / Dashboard */}
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05, rotateY: 5 }}
            className="relative h-96 rounded-2xl overflow-hidden glass-panel group border-red-500/30 hover:border-red-500/80"
            style={{ perspective: 1000 }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
            <img src="https://images.unsplash.com/photo-1541562232579-515a21358026?auto=format&fit=crop&q=80" alt="Iron Man HUD" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-700" />
            
            <div className="absolute inset-0 p-8 flex flex-col justify-end z-20">
              <Crosshair className="w-8 h-8 text-marvel-gold mb-4 animate-spin-slow" />
              <h3 className="font-sans font-bold text-3xl text-white uppercase tracking-widest">Suit Dashboard</h3>
              <p className="text-marvel-gold text-xs uppercase tracking-widest mt-2 mb-4 font-bold">"I love you 3000."</p>
              <Link to="/profile" onClick={playClick} className="w-fit px-6 py-2 bg-marvel-red text-white text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-marvel-red transition-colors shadow-[0_0_15px_rgba(226,54,54,0.5)]">
                Initialize Systems
              </Link>
            </div>
            {/* Hover Scanning Line */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-marvel-red/20 to-transparent h-[10%] translate-y-[-100%] group-hover:animate-scanline z-30 pointer-events-none" />
          </motion.div>

          {/* Spider-Man / Daily Love */}
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05, rotateY: 5 }}
            className="relative h-96 rounded-2xl overflow-hidden glass-panel group border-blue-500/30 hover:border-blue-500/80"
            style={{ perspective: 1000 }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
            <img src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80" alt="Cityscape" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-700" />
            
            <div className="absolute inset-0 p-8 flex flex-col justify-end z-20">
              <Heart className="w-8 h-8 text-marvel-blue mb-4 animate-pulse" />
              <h3 className="font-sans font-bold text-3xl text-white uppercase tracking-widest">Web of Love</h3>
              <p className="text-marvel-blue text-xs uppercase tracking-widest mt-2 mb-4 font-bold">"My MJ."</p>
              <Link to="/daily-love" onClick={playClick} className="w-fit px-6 py-2 bg-marvel-blue text-white text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-marvel-blue transition-colors shadow-[0_0_15px_rgba(81,140,202,0.5)]">
                Swing to Notes
              </Link>
            </div>
          </motion.div>

          {/* Captain America / Memories */}
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.05, rotateY: 5 }}
            className="relative h-96 rounded-2xl overflow-hidden glass-panel group border-slate-500/30 hover:border-slate-300/80"
            style={{ perspective: 1000 }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
            <img src="https://images.unsplash.com/photo-1510253687831-0f983cb11718?auto=format&fit=crop&q=80" alt="Vintage Shield" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-700 sepia-[0.3]" />
            
            <div className="absolute inset-0 p-8 flex flex-col justify-end z-20">
              <ShieldCheck className="w-8 h-8 text-white mb-4" />
              <h3 className="font-sans font-bold text-3xl text-white uppercase tracking-widest">The First Dance</h3>
              <p className="text-slate-300 text-xs uppercase tracking-widest mt-2 mb-4 font-bold">"I'm with you 'til the end of the line."</p>
              <Link to="/memories" onClick={playClick} className="w-fit px-6 py-2 bg-slate-200 text-slate-900 text-xs font-bold uppercase tracking-widest hover:bg-slate-400 hover:text-white transition-colors shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                Access Archives
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Featured Multiverse Draw (Doctor Strange Theme Embedded on Home) */}
        {featuredDraw && (
          <section className="relative mt-32 z-10">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-marvel-navy/50 border border-marvel-purple/50 rounded-3xl p-8 md:p-12 shadow-[0_0_50px_rgba(108,66,152,0.2)] relative overflow-hidden backdrop-blur-xl"
            >
              {/* Magic Rings */}
              <motion.div 
                className="absolute top-1/2 -right-32 -translate-y-1/2 w-[600px] h-[600px] border-[2px] border-marvel-gold/20 border-dotted rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div 
                className="absolute top-1/2 -right-32 -translate-y-1/2 w-[550px] h-[550px] border-[1px] border-marvel-gold/30 rounded-full"
                animate={{ rotate: -360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10 items-center">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-marvel-purple/20 border border-marvel-purple text-marvel-purple font-bold text-xs uppercase tracking-widest rounded-none">
                    <Sparkles className="w-4 h-4" /> Multiverse Anomaly Detected
                  </div>

                  <h2 className="font-serif text-4xl md:text-5xl font-bold text-white uppercase">{featuredDraw.title}</h2>
                  <p className="text-text-secondary font-sans tracking-wide leading-relaxed">{featuredDraw.description}</p>
                  
                  <div className="p-6 bg-black/40 border border-white/10 space-y-4">
                    <p className="text-xs text-marvel-gold font-bold uppercase tracking-widest">Portal Closes In</p>
                    <CountdownTimer targetDate={featuredDraw.endDate} />
                  </div>

                  <Link 
                    to={`/draw/${featuredDraw.id}`}
                    onClick={playClick}
                    className="inline-flex px-8 py-4 bg-marvel-purple text-white font-bold text-sm uppercase tracking-widest hover:bg-marvel-gold hover:text-black transition-all shadow-[0_0_20px_rgba(108,66,152,0.4)]"
                  >
                    Enter Dimensional Draw
                  </Link>
                </div>

                <div className="relative aspect-square md:aspect-video rounded-xl overflow-hidden border border-marvel-gold/30 group">
                  <div className="absolute inset-0 bg-marvel-purple/20 mix-blend-color z-10 group-hover:opacity-0 transition-opacity duration-500" />
                  <img src={featuredDraw.prizeImage} alt="Prize" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  <div className="absolute bottom-4 left-4 right-4 p-4 bg-black/80 backdrop-blur-md border-l-4 border-marvel-gold z-20">
                    <p className="text-[10px] text-marvel-gold font-bold uppercase tracking-widest">Ultimate Artifact</p>
                    <p className="text-lg font-bold text-white">{featuredDraw.prizeTitle}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>
        )}

      </motion.div>
    </div>
  );
};

export default Home;
