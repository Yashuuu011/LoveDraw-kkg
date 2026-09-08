import React, { useEffect, useState } from 'react';
import { Sparkles, Trophy, Calendar, Gift } from 'lucide-react';
import api from '../services/api';
import { Draw } from '../types';
import DrawCard from '../components/DrawCard';

export const Draws: React.FC = () => {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [loading, setLoading] = useState(true);

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
    <div className="pt-28 pb-20 max-w-6xl mx-auto px-4 space-y-12">
      {/* Page Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-rose-400/30 text-gold-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Weekly & Monthly Prize Draws</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-5xl font-extrabold rose-gradient-text">
          Romantic Love Draws ❤️
        </h1>
        <p className="text-base text-blush-200/90 max-w-xl mx-auto">
          Participate in curated luxury couple photo packages, stargazing hampers, and romantic experiences.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex justify-center">
        <div className="p-1.5 rounded-full glass-panel border border-rose-400/30 inline-flex gap-2">
          {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
                filter === tab
                  ? 'bg-gradient-to-r from-rose-500 to-burgundy-600 text-white shadow-lg'
                  : 'text-blush-200 hover:text-white'
              }`}
            >
              {tab === 'ALL' && 'All Draws'}
              {tab === 'ACTIVE' && 'Active Draws 🎟️'}
              {tab === 'COMPLETED' && 'Completed Winners 🏆'}
            </button>
          ))}
        </div>
      </div>

      {/* Draws Grid */}
      {loading ? (
        <div className="text-center py-20">
          <p className="text-rose-300 font-serif italic text-lg animate-pulse">
            Sending a little love your way... 💕
          </p>
        </div>
      ) : draws.length === 0 ? (
        <div className="text-center py-20 glass-card rounded-3xl p-10 border border-rose-400/20">
          <Gift className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <p className="text-lg font-serif text-white font-semibold">
            No draws available for this filter right now.
          </p>
          <p className="text-sm text-blush-200 mt-1">Check back soon for new romantic draws! ❤️</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {draws.map((d) => (
            <DrawCard key={d.id} draw={d} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Draws;
