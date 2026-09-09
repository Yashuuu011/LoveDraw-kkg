import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Compass, Eye, ShieldAlert } from 'lucide-react';
import api from '../services/api';
import { Draw } from '../types';
import DrawCard from '../components/DrawCard';
import { useSound } from '../context/SoundContext';

export const Draws: React.FC = () => {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [loading, setLoading] = useState(true);
  const { playClick } = useSound();

  useEffect(() => {
    fetchDraws();
  }, [filter]);

  const fetchDraws = async () => {
    setLoading(true);
    try {
      let url = '/draws';
      if (filter !== 'ALL') {
        url += `?status=${filter}`;
      }
      const response = await api.get(url);
      if (response.data.success) {
        setDraws(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching draws:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden pt-28 pb-20 selection:bg-marvel-purple/30">
      
      {/* Dimensional Rift Background */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-40">
        {/* Large Magic Ring Left */}
        <motion.div 
          className="absolute -top-32 -left-64 w-[800px] h-[800px] rounded-full border-[10px] border-dashed border-marvel-gold/20 shadow-[0_0_100px_var(--marvel-purple)]"
          animate={{ rotate: 360, scale: [1, 1.05, 1] }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        />
        {/* Large Magic Ring Right */}
        <motion.div 
          className="absolute top-1/3 -right-64 w-[600px] h-[600px] rounded-full border-[5px] border-dotted border-marvel-purple/30 shadow-[0_0_80px_var(--marvel-gold)]"
          animate={{ rotate: -360, scale: [1, 1.1, 1] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-marvel-purple/10 via-black to-black" />
      </div>

      {/* Floating Mystic Particles */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={`spark-${i}`}
            className="absolute bg-marvel-gold rounded-full"
            style={{
              width: Math.random() * 4 + 'px',
              height: Math.random() * 4 + 'px',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              boxShadow: '0 0 10px var(--marvel-gold)'
            }}
            animate={{ 
              y: [0, -150], 
              x: [0, Math.random() * 50 - 25],
              opacity: [0, 1, 0] 
            }}
            transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, ease: 'linear' }}
          />
        ))}
      </div>

      <div className="max-w-6xl mx-auto px-4 space-y-16 relative z-10">
        
        {/* Page Title */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-6 py-2 border-2 border-marvel-gold/50 bg-black/50 backdrop-blur-md text-marvel-gold text-xs font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(247,143,63,0.3)]">
            <Compass className="w-4 h-4 animate-spin-slow" />
            <span>Multiverse Nexus</span>
          </div>

          <h1 className="font-serif text-5xl sm:text-7xl font-bold text-white uppercase tracking-widest drop-shadow-[0_0_15px_rgba(108,66,152,0.8)]">
            Dimensional <span className="text-transparent bg-clip-text bg-gradient-to-r from-marvel-purple to-marvel-gold">Draws</span>
          </h1>
          <p className="text-sm font-sans tracking-widest text-text-secondary uppercase max-w-2xl mx-auto">
            "Forget everything that you think you know. Explore the anomalies."
          </p>
        </div>

        {/* Filter Spells */}
        <div className="flex justify-center">
          <div className="p-2 border-2 border-marvel-purple/40 bg-black/60 backdrop-blur-md flex gap-2 shadow-[0_0_30px_rgba(108,66,152,0.2)]">
            {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => { playClick(); setFilter(tab); }}
                className={`px-8 py-3 text-xs font-bold uppercase tracking-widest transition-all ${
                  filter === tab
                    ? 'bg-marvel-purple text-white shadow-[0_0_20px_var(--marvel-purple)]'
                    : 'text-marvel-purple/60 hover:text-marvel-gold hover:bg-marvel-gold/10'
                }`}
              >
                {tab === 'ALL' && 'All Timelines'}
                {tab === 'ACTIVE' && 'Open Portals'}
                {tab === 'COMPLETED' && 'Closed Rifts'}
              </button>
            ))}
          </div>
        </div>

        {/* Draws Grid */}
        {loading ? (
          <div className="text-center py-32">
            <Eye className="w-16 h-16 text-marvel-gold mx-auto mb-6 animate-pulse" />
            <p className="text-marvel-gold font-sans uppercase tracking-[0.3em] font-bold animate-pulse">
              Scrying the Multiverse...
            </p>
          </div>
        ) : draws.length === 0 ? (
          <div className="text-center py-20 border border-marvel-purple/30 bg-black/40 backdrop-blur-md p-10 max-w-2xl mx-auto shadow-[0_0_30px_rgba(108,66,152,0.2)]">
            <ShieldAlert className="w-16 h-16 text-marvel-gold mx-auto mb-6" />
            <p className="text-xl font-serif text-white font-bold tracking-widest uppercase mb-2">
              No Anomalies Detected
            </p>
            <p className="text-xs font-sans text-marvel-purple uppercase tracking-widest">The timeline is stable for this filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {draws.map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.8, ease: "easeOut" }}
              >
                <DrawCard draw={d} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Draws;
