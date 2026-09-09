import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Heart, Sparkles, Filter, Bookmark, MapPin, Search } from 'lucide-react';
import api from '../services/api';
import { DailyMessage } from '../types';
import Envelope from '../components/Envelope';
import PaymentQRModal from '../components/PaymentQRModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useSound } from '../context/SoundContext';

const CATEGORIES = [
  'All', 'Good morning', 'Good night', 'Cute', 'Romantic',
  'Long-distance', 'Missing you', 'Appreciation', 'Funny'
];

// Timeline headers to create the story feel requested by user
const TIMELINE_HEADERS = [
  "HOW IT STARTED", "FIRST MESSAGE", "FIRST MEETING", "SPECIAL MOMENTS", "TODAY", "FOREVER"
];

export const DailyLove: React.FC = () => {
  const [todayMessage, setTodayMessage] = useState<DailyMessage | null>(null);
  const [messages, setMessages] = useState<DailyMessage[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [favoritesMap, setFavoritesMap] = useState<Record<string, boolean>>({});
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [messageUnlocked, setMessageUnlocked] = useState(false);

  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const { playClick, playNotification } = useSound();
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  
  // Parallax effects for the cityscape background
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const yWebs = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);

  useEffect(() => {
    fetchTodayMessage();
    fetchCategoryMessages('All');
    if (isAuthenticated) fetchUserFavorites();
  }, [isAuthenticated]);

  const fetchTodayMessage = async () => {
    try {
      const response = await api.get('/messages/today');
      if (response.data.success) setTodayMessage(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCategoryMessages = async (cat: string) => {
    try {
      const response = await api.get(`/messages?category=${encodeURIComponent(cat)}&limit=12`);
      if (response.data.success) setMessages(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchUserFavorites = async () => {
    try {
      const response = await api.get('/messages/user-favorites');
      if (response.data.success) {
        const map: Record<string, boolean> = {};
        response.data.data.forEach((m: DailyMessage) => { map[m.id] = true; });
        setFavoritesMap(map);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCategoryChange = (cat: string) => {
    playClick();
    setSelectedCategory(cat);
    fetchCategoryMessages(cat);
  };

  const handleFavoriteToggle = async (messageId: string) => {
    playClick();
    if (!isAuthenticated) {
      addToast('HERO ID REQUIRED TO SAVE DATA', 'info');
      return;
    }
    try {
      const response = await api.post('/messages/favorite', { messageId });
      if (response.data.success) {
        setFavoritesMap(prev => ({ ...prev, [messageId]: response.data.favorited }));
        addToast(response.data.message, 'success');
        playNotification();
      }
    } catch (error) {
      addToast('UPLOAD FAILED.', 'error');
    }
  };

  return (
    <div ref={containerRef} className="relative min-h-screen bg-marvel-navy overflow-hidden selection:bg-marvel-blue/30">
      
      {/* Spider-Man Inspired Parallax Background (Sunset New York) */}
      <motion.div style={{ y: yBg }} className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#ff7b54]/20 via-marvel-navy to-black" />
        <img src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80" alt="NY Skyline" className="w-full h-[150%] object-cover opacity-20 sepia-[0.3] hue-rotate-[-30deg]" />
      </motion.div>

      {/* Decorative Web Lines */}
      <motion.div style={{ y: yWebs }} className="absolute inset-0 pointer-events-none z-0 opacity-10">
        <div className="w-full h-full border-t border-marvel-blue/50 absolute top-1/4 transform rotate-12" />
        <div className="w-full h-full border-t border-marvel-blue/50 absolute top-1/2 transform -rotate-6" />
        <div className="w-full h-full border-l border-marvel-blue/50 absolute left-1/3 transform rotate-45" />
      </motion.div>

      {/* Floating City Hearts */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`heart-${i}`}
            className="absolute text-marvel-blue/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 20 + 10}px`
            }}
            animate={{ y: [0, -100], opacity: [0, 1, 0] }}
            transition={{ duration: 4 + Math.random() * 5, repeat: Infinity, ease: 'linear' }}
          >
            <Heart className="fill-current" />
          </motion.div>
        ))}
      </div>

      <div className="pt-32 pb-20 max-w-6xl mx-auto px-4 relative z-10 space-y-24">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-marvel-blue bg-marvel-navy/50 px-4 py-1 border border-marvel-blue/30 backdrop-blur-md">
            Queens Network • {new Date().toLocaleDateString()}
          </span>
          <h1 className="font-comic text-6xl md:text-8xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-marvel-red to-marvel-blue drop-shadow-[0_0_10px_rgba(81,140,202,0.8)] transform -skew-y-3">
            WEB OF LOVE
          </h1>
          <p className="text-sm font-sans tracking-widest text-text-secondary uppercase font-bold">
            "You are my path, and you are always going to be my path."
          </p>
        </div>

        {/* Main Interactive Opening Envelope (Today's Event) */}
        {todayMessage && (
          <div className="relative">
            <h2 className="text-center font-comic text-3xl tracking-wider text-marvel-red mb-8">TODAY'S MISSION</h2>
            {messageUnlocked ? (
              <div className="max-w-md mx-auto transform -rotate-2">
                <Envelope message={todayMessage} onFavorite={handleFavoriteToggle} isFavorited={Boolean(favoritesMap[todayMessage.id])} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 bg-black/60 backdrop-blur-xl border-4 border-marvel-red shadow-[8px_8px_0_0_var(--marvel-blue)] max-w-lg mx-auto text-center space-y-6 transform hover:-translate-y-2 transition-transform">
                <div className="w-20 h-20 bg-marvel-red flex items-center justify-center shadow-[0_0_30px_var(--marvel-red)] relative">
                  <div className="absolute inset-0 bg-marvel-blue mix-blend-color-burn" />
                  <MapPin className="w-10 h-10 text-white relative z-10 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-3xl font-comic text-white mb-2 tracking-widest">SIGNAL ENCRYPTED</h3>
                  <p className="text-xs font-sans tracking-widest text-marvel-silver uppercase">Decrypt today's coordinates for ₹1.</p>
                </div>
                <button
                  onClick={() => { playClick(); setPaymentModalOpen(true); }}
                  className="px-8 py-4 bg-marvel-blue border-2 border-white text-white font-black font-sans uppercase tracking-[0.2em] shadow-[4px_4px_0_0_#FFF] hover:bg-marvel-red hover:shadow-[0_0_20px_var(--marvel-red)] transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Initiate Decryption
                </button>
              </div>
            )}
          </div>
        )}

        <PaymentQRModal
          isOpen={isPaymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          title="Decrypt Mission"
          price={1}
          type="message"
          onSuccess={() => { playNotification(); setMessageUnlocked(true); }}
        />

        {/* Comic Book Timeline Layout */}
        <div className="space-y-12">
          <div className="flex items-center justify-between border-b-4 border-marvel-blue pb-4">
            <h2 className="font-comic text-4xl text-white tracking-widest flex items-center gap-3">
              <Search className="w-8 h-8 text-marvel-red" />
              ARCHIVES
            </h2>
          </div>

          {/* Categories Chips */}
          <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-5 py-2 text-xs font-bold font-sans uppercase tracking-widest border-2 transition-all whitespace-nowrap ${
                  selectedCategory === cat 
                    ? 'bg-marvel-red border-marvel-red text-white shadow-[0_0_15px_var(--marvel-red)] scale-105' 
                    : 'bg-black/50 border-marvel-blue text-marvel-blue hover:bg-marvel-blue hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Comic Panel Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min">
            {messages.map((m, index) => {
              // Assign a timeline header randomly or sequentially for comic narrative feel
              const header = TIMELINE_HEADERS[index % TIMELINE_HEADERS.length];
              
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-2 flex flex-col group relative overflow-hidden shadow-[8px_8px_0_0_var(--marvel-navy)] transform hover:-translate-y-2 hover:-rotate-1 transition-all"
                >
                  {/* Comic panel header */}
                  <div className="bg-marvel-gold px-2 py-1 mb-2 border-2 border-black inline-block self-start z-10 shadow-[2px_2px_0_0_#000]">
                    <span className="text-[9px] font-black font-sans text-black uppercase tracking-widest">
                      {header}
                    </span>
                  </div>

                  {/* Panel Content */}
                  <div className="flex-1 bg-[#fff9e6] border-2 border-black p-6 flex flex-col relative overflow-hidden">
                    {/* Halftone dot pattern background */}
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '6px 6px' }} />
                    
                    <div className="flex items-center justify-between z-10 mb-4">
                      <span className="text-[10px] font-bold text-white bg-marvel-blue px-2 py-0.5 border border-black uppercase tracking-widest shadow-[2px_2px_0_0_#000]">
                        {m.category}
                      </span>
                      <button
                        onClick={() => handleFavoriteToggle(m.id)}
                        className={`p-1.5 border-2 border-black transition-colors shadow-[2px_2px_0_0_#000] ${
                          favoritesMap[m.id] ? 'bg-marvel-red text-white' : 'bg-white text-black hover:bg-marvel-red hover:text-white'
                        }`}
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex-1 flex items-center justify-center py-4 z-10">
                      <div className="relative">
                        {/* Comic Speech Bubble Tail */}
                        <div className="absolute -bottom-4 -left-2 w-6 h-6 bg-white border-l-2 border-b-2 border-black rotate-45" />
                        <div className="bg-white border-2 border-black p-4 rounded-3xl rounded-bl-none shadow-[4px_4px_0_0_#000]">
                          <p className="font-comic text-xl text-center text-black leading-tight tracking-wide">
                            "{m.message}"
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyLove;
