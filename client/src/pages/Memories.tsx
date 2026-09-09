import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Image as ImageIcon, Sparkles, X, Shield, MapPin, Calendar } from 'lucide-react';
import api from '../services/api';
import { Memory } from '../types';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';

export const Memories: React.FC = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [selectedImage, setSelectedImage] = useState<Memory | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();
  const { playClick, playSuccess } = useSound();

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
    <div className="relative min-h-screen bg-[#0f172a] overflow-hidden pt-28 pb-20 selection:bg-marvel-blue/30">
      
      {/* Vintage Captain America Cinematic Background */}
      <div className="absolute inset-0 pointer-events-none z-0 sepia-[0.4]">
        {/* Shield Inspired Circles */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full border-[40px] border-marvel-red/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border-[40px] border-[#cbd5e1]/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-marvel-blue/10 flex items-center justify-center">
          <Sparkles className="w-64 h-64 text-white/5" />
        </div>
        
        {/* Film Grain overlay */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
      </div>

      <div className="max-w-6xl mx-auto px-4 relative z-10 space-y-20">
        
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-marvel-blue border-2 border-slate-300 text-white text-xs font-bold uppercase tracking-widest shadow-[4px_4px_0_0_rgba(203,213,225,0.8)]">
            <Shield className="w-4 h-4" />
            <span>Classified Archives</span>
          </div>

          <h1 className="font-serif text-5xl sm:text-7xl font-bold text-slate-200 uppercase tracking-widest drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
            Mission <span className="text-transparent bg-clip-text bg-gradient-to-r from-marvel-red to-marvel-blue">Memories</span>
          </h1>
          <p className="text-sm font-sans tracking-widest text-slate-400 uppercase max-w-2xl mx-auto font-bold">
            "For as long as I can remember, I just wanted to do what was right. And you were my best choice."
          </p>
        </div>

        {/* Vintage Timeline Layout */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Camera className="w-16 h-16 text-slate-400 animate-pulse mb-4" />
            <p className="text-slate-400 font-sans tracking-[0.2em] uppercase font-bold text-xs animate-pulse">
              Decrypting Archives...
            </p>
          </div>
        ) : memories.length === 0 ? (
          <div className="text-center py-20 max-w-2xl mx-auto bg-slate-800/50 backdrop-blur-md border-2 border-slate-600 p-10 shadow-[8px_8px_0_0_rgba(15,23,42,0.8)]">
            <ImageIcon className="w-16 h-16 text-slate-500 mx-auto mb-6" />
            <p className="text-2xl font-serif text-white uppercase tracking-widest font-bold">Files Not Found</p>
            <p className="text-xs text-slate-400 tracking-widest uppercase mt-2">No timeline data available for this sector.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline center line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-slate-700 transform -translate-x-1/2" />

            <div className="space-y-16">
              {memories.map((memory, index) => {
                const isLeft = index % 2 === 0;
                return (
                  <motion.div
                    key={memory.id}
                    initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className={`relative flex flex-col md:flex-row items-center justify-between gap-8 ${isLeft ? 'md:flex-row-reverse' : ''}`}
                  >
                    {/* Timeline Dot */}
                    <div className="hidden md:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-marvel-red border-4 border-[#0f172a] shadow-[0_0_10px_var(--marvel-red)] z-20" />

                    {/* Content (Date/Title) */}
                    <div className={`w-full md:w-5/12 ${isLeft ? 'md:text-left' : 'md:text-right'}`}>
                      <div className={`inline-flex items-center gap-2 mb-3 px-3 py-1 bg-slate-800 border border-slate-600 text-slate-300 text-[10px] font-bold uppercase tracking-widest shadow-[2px_2px_0_0_#000] ${isLeft ? '' : 'md:flex-row-reverse'}`}>
                        <Calendar className="w-3 h-3 text-marvel-red" />
                        {new Date(memory.date).toLocaleDateString()}
                      </div>
                      <h3 className="font-serif text-3xl font-bold text-white mb-2 tracking-wide">
                        {memory.title}
                      </h3>
                      {memory.winnerName && (
                        <p className="text-xs text-marvel-blue uppercase tracking-widest font-bold mb-4 flex items-center gap-1.5 justify-start md:justify-end">
                          <MapPin className="w-3.5 h-3.5" />
                          Target: {memory.winnerName}
                        </p>
                      )}
                    </div>

                    {/* Polaroid Image Card */}
                    <div className="w-full md:w-5/12 cursor-none">
                      <div 
                        onClick={() => { playSuccess(); setSelectedImage(memory); }}
                        className="bg-[#f8f9fa] p-4 pb-12 shadow-[8px_8px_15px_rgba(0,0,0,0.5)] transform hover:scale-105 transition-transform duration-500 relative group rotate-2 hover:rotate-0"
                      >
                        {/* Tape effect */}
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-20 h-6 bg-white/50 backdrop-blur-sm -rotate-2" />
                        
                        <div className="relative aspect-square overflow-hidden bg-black filter sepia-[0.2]">
                          <img
                            src={memory.imageUrl}
                            alt={memory.title}
                            className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
                          />
                          {/* Inner film border */}
                          <div className="absolute inset-0 border-4 border-black/10 mix-blend-overlay pointer-events-none" />
                        </div>
                        <p className="absolute bottom-4 left-0 right-0 text-center font-comic text-xl text-slate-800 transform -rotate-2 group-hover:text-marvel-red transition-colors">
                          {memory.title}
                        </p>
                      </div>
                    </div>

                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Cinematic Modal (Lightbox) */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { playClick(); setSelectedImage(null); }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl cursor-none"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-4xl w-full"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => { playClick(); setSelectedImage(null); }}
                className="absolute -top-12 right-0 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-8 h-8" />
              </button>
              
              <div className="bg-[#f8f9fa] p-6 pb-20 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative sepia-[0.1]">
                <img
                  src={selectedImage.imageUrl}
                  alt={selectedImage.title}
                  className="w-full h-auto max-h-[70vh] object-contain border border-slate-200"
                />
                <div className="absolute bottom-6 left-0 right-0 text-center px-8">
                  <h3 className="font-comic text-3xl text-slate-800">
                    {selectedImage.title}
                  </h3>
                  <p className="text-xs font-sans text-slate-500 uppercase tracking-widest font-bold mt-2">
                    Classified Archive • {new Date(selectedImage.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Memories;
