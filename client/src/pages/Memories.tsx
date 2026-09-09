import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, X, Calendar, Trophy, Image as ImageIcon } from 'lucide-react';
import api from '../services/api';
import { Memory } from '../types';

export const Memories: React.FC = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemories();
  }, []);

  const fetchMemories = async () => {
    try {
      const response = await api.get('/memories');
      if (response.data.success) {
        setMemories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching memories:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-20 max-w-6xl mx-auto px-4 space-y-12">
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:glass-panel border border-slate-200 dark:border-rose-400/30 text-rose-500 dark:text-rose-300 text-xs font-semibold shadow-sm">
          <ImageIcon className="w-3.5 h-3.5 text-gold-500 dark:text-gold-400" />
          <span>Romantic Stories & Photo Gallery</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">
          Couple <span className="text-rose-600 dark:rose-gradient-text">Memories</span> 🖼️❤️
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-200 max-w-xl mx-auto">
          Explore captured moments of joy, proposals, and love draw celebrations.
        </p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-20">
          <p className="text-rose-500 dark:text-rose-300 font-serif italic text-lg animate-pulse">
            Loading beautiful memories... 💕
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {memories.map((m) => (
            <motion.div
              key={m.id}
              onClick={() => setSelectedMemory(m)}
              whileHover={{ y: -6 }}
              className="bg-white/80 dark:glass-card rounded-3xl overflow-hidden border border-slate-200 dark:border-rose-400/20 cursor-pointer group shadow-md hover:shadow-xl transition-shadow"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={m.imageUrl}
                  alt={m.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 dark:from-plum-950 via-transparent to-transparent opacity-75" />

                {/* Heart overlay badge on hover */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-9 h-9 rounded-full bg-rose-500/80 backdrop-blur-md flex items-center justify-center text-white shadow-lg">
                    <Heart className="w-5 h-5 fill-white animate-pulse" />
                  </div>
                </div>

                <div className="absolute bottom-3 left-4 right-4">
                  <p className="text-xs text-gold-400 dark:text-gold-300 font-medium flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5" />
                    {m.winnerName || 'Love Community'}
                  </p>
                  <h3 className="font-serif text-lg font-bold text-white group-hover:text-rose-200 transition-colors">
                    {m.title}
                  </h3>
                </div>
              </div>

              <div className="p-5 space-y-2">
                <p className="text-xs text-slate-600 dark:text-slate-200 line-clamp-2 leading-relaxed">
                  {m.description}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-rose-500/20 text-[11px] text-slate-500 dark:text-slate-300">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-rose-500 dark:text-rose-400" />
                    {new Date(m.date).toLocaleDateString()}
                  </span>
                  {m.draw && <span className="text-gold-500 dark:text-gold-300">{m.draw.title}</span>}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {selectedMemory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-plum-950/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-4xl w-full bg-white dark:glass-panel rounded-3xl overflow-hidden border border-slate-200 dark:border-rose-400/30 shadow-2xl flex flex-col md:flex-row"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedMemory(null)}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 dark:glass-card text-slate-700 dark:text-blush-100 hover:text-rose-500 dark:hover:text-white shadow-sm"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Image Left */}
              <div className="md:w-3/5 aspect-[4/3] md:aspect-auto">
                <img
                  src={selectedMemory.imageUrl}
                  alt={selectedMemory.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Memory Details Right */}
              <div className="md:w-2/5 p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-50 dark:bg-gold-500/10 border border-gold-200 dark:border-gold-400/30 text-gold-600 dark:text-gold-300 text-xs font-semibold">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>{selectedMemory.winnerName || 'Love Memory'}</span>
                  </div>

                  <h2 className="font-serif text-3xl font-bold text-slate-900 dark:text-white">{selectedMemory.title}</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-200 leading-relaxed">{selectedMemory.description}</p>
                </div>

                <div className="pt-6 border-t border-slate-200 dark:border-rose-500/20 text-xs text-slate-500 dark:text-slate-300 space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Date Captured:</span>
                    <span className="text-slate-800 dark:text-white font-medium">{new Date(selectedMemory.date).toLocaleDateString()}</span>
                  </div>
                  {selectedMemory.draw && (
                    <div className="flex items-center justify-between">
                      <span>Draw Event:</span>
                      <span className="text-gold-500 dark:text-gold-300 font-semibold">{selectedMemory.draw.title}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Memories;
