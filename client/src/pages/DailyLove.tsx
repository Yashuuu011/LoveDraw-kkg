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
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-rose-400/30 text-rose-300 text-xs font-semibold">
          <Calendar className="w-3.5 h-3.5 text-gold-400" />
          <span>{currentDateFormatted}</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-5xl font-extrabold rose-gradient-text">
          Today's Love Note 💌
        </h1>
        <p className="text-base text-blush-200/90 max-w-xl mx-auto">
          A fresh romantic whisper delivered to your heart every single day.
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
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-gold-400">Archive Collection</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">Explore Romantic Categories ✨</h2>
          </div>
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-rose-500 to-burgundy-600 text-white shadow-lg shadow-rose-900/40 border border-rose-400/40'
                    : 'glass-card text-blush-200 hover:text-white hover:border-rose-400/30'
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
              className="glass-card rounded-2xl p-6 flex flex-col justify-between border border-rose-400/20 space-y-4 hover:border-rose-400/40"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gold-300 bg-gold-500/10 px-2.5 py-1 rounded-full border border-gold-500/20">
                  {m.category}
                </span>

                <button
                  onClick={() => handleFavoriteToggle(m.id)}
                  className="text-blush-200 hover:text-rose-400 transition-colors p-1"
                >
                  <Bookmark
                    className={`w-4 h-4 ${favoritesMap[m.id] ? 'text-rose-500 fill-rose-500' : ''}`}
                  />
                </button>
              </div>

              <p className="font-serif text-base text-white leading-relaxed italic">
                "{m.message}"
              </p>

              <div className="flex items-center justify-between text-[11px] text-blush-300 pt-3 border-t border-rose-500/20">
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
