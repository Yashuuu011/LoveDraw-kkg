import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Filter, Bookmark, Calendar } from 'lucide-react';
import api from '../services/api';
import { DailyMessage } from '../types';
import Envelope from '../components/Envelope';
import PaymentQRModal from '../components/PaymentQRModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const CATEGORIES = [
  'All',
  'Good morning',
  'Good night',
  'Cute',
  'Romantic',
  'Long-distance',
  'Missing you',
  'Appreciation',
  'Anniversary',
  'Motivation',
  'Soulmate',
  'Funny',
  'Deep love'
];

export const DailyLove: React.FC = () => {
  const [todayMessage, setTodayMessage] = useState<DailyMessage | null>(null);
  const [messages, setMessages] = useState<DailyMessage[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [favoritesMap, setFavoritesMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [messageUnlocked, setMessageUnlocked] = useState(false);

  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  useEffect(() => {
    fetchTodayMessage();
    fetchCategoryMessages('All');
    if (isAuthenticated) {
      fetchUserFavorites();
    }
  }, [isAuthenticated]);

  const fetchTodayMessage = async () => {
    try {
      const response = await api.get('/messages/today');
      if (response.data.success) {
        setTodayMessage(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching today message:', error);
    }
  };

  const fetchCategoryMessages = async (cat: string) => {
    try {
      const response = await api.get(`/messages?category=${encodeURIComponent(cat)}&limit=12`);
      if (response.data.success) {
        setMessages(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserFavorites = async () => {
    try {
      const response = await api.get('/messages/user-favorites');
      if (response.data.success) {
        const map: Record<string, boolean> = {};
        response.data.data.forEach((m: DailyMessage) => {
          map[m.id] = true;
        });
        setFavoritesMap(map);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    fetchCategoryMessages(cat);
  };

  const handleFavoriteToggle = async (messageId: string) => {
    if (!isAuthenticated) {
      showToast('Please log in to save your favorite love notes!', 'info');
      return;
    }
    try {
      const response = await api.post('/messages/favorite', { messageId });
      if (response.data.success) {
        setFavoritesMap((prev) => ({
          ...prev,
          [messageId]: response.data.favorited
        }));
        showToast(response.data.message, 'love');
      }
    } catch (error) {
      showToast('Failed to update favorite.', 'error');
    }
  };

  return (
    <div className="pt-28 pb-20 max-w-6xl mx-auto px-4 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4 relative z-10 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-gold-500 dark:text-gold-400">
          {currentDateFormatted}
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">
          Today's <span className="text-rose-600 dark:rose-gradient-text">Love Note</span> 💌
        </h1>
        <p className="text-base text-slate-600 dark:text-blush-200">
          Start your day with a beautiful romantic message. Tap the envelope to unseal it.
        </p>
      </div>

      {/* Main Interactive Opening Envelope */}
      {todayMessage && (
        <div className="relative">
          {messageUnlocked ? (
            <Envelope
              message={todayMessage}
              onFavorite={handleFavoriteToggle}
              isFavorited={Boolean(favoritesMap[todayMessage.id])}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-12 glass-panel rounded-3xl border border-rose-400/30 shadow-2xl max-w-lg mx-auto text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-rose-400 to-burgundy-500 flex items-center justify-center shadow-lg">
                <Heart className="w-8 h-8 text-white fill-white animate-pulse" />
              </div>
              <div>
                <h3 className="text-2xl font-serif font-bold text-white mb-2">Today's Note is Locked</h3>
                <p className="text-sm text-blush-200">Unlock your special romantic message for today for just ₹1.</p>
              </div>
              <button
                onClick={() => setPaymentModalOpen(true)}
                className="px-8 py-3.5 rounded-full bg-gradient-to-r from-rose-500 to-gold-500 text-white font-bold shadow-xl shadow-rose-900/40 hover:scale-105 transition-transform flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5 text-gold-200" />
                Pay ₹1 to Unlock
              </button>
            </div>
          )}
        </div>
      )}

      <PaymentQRModal
        isOpen={isPaymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title="Today's Special Love Note"
        price={1}
        type="message"
        onSuccess={() => setMessageUnlocked(true)}
      />

      {/* Category Filter Chips & Archive Explorer */}
      <div className="space-y-8 pt-8 border-t border-rose-500/20">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="font-serif text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Filter className="w-5 h-5 text-rose-500 dark:text-rose-400" />
            Explore by Mood
          </h2>
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none">
          {CATEGORIES.map((cat) => {
            return (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  selectedCategory === cat 
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25' 
                    : 'bg-white/80 dark:glass-card text-slate-600 dark:text-blush-200 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-rose-400/20'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Message Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 dark:glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-rose-400/30 flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-[40px] pointer-events-none group-hover:bg-rose-500/10 dark:group-hover:bg-rose-500/20 transition-colors" />
              
              <div className="flex items-center justify-between z-10">
                <span className="text-xs font-semibold text-rose-500 dark:text-rose-300 uppercase tracking-widest bg-rose-50 dark:bg-rose-500/10 px-3 py-1 rounded-full border border-rose-200 dark:border-rose-400/20">
                  {m.category}
                </span>

                <button
                  onClick={() => handleFavoriteToggle(m.id)}
                  className={`p-2 rounded-full transition-colors ${
                    favoritesMap[m.id] 
                      ? 'bg-rose-500 text-white shadow-md' 
                      : 'bg-slate-100 dark:bg-plum-900/50 text-slate-400 dark:text-blush-300 hover:bg-slate-200 dark:hover:bg-plum-800'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 flex items-center justify-center py-6">
                <p className="font-serif text-xl sm:text-2xl text-center text-slate-800 dark:text-blush-50 italic leading-relaxed">
                  "{m.message}"
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-blush-300 pt-3 border-t border-slate-200 dark:border-rose-500/20">
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
                  Love Note
                </span>
                <span>Loved by community</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DailyLove;
