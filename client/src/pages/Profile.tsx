import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User as UserIcon, Heart, Trophy, Gift, Bookmark, Calendar, ShieldCheck, QrCode } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Entry, DailyMessage, Winner } from '../types';

export const Profile: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [winnings, setWinnings] = useState<Winner[]>([]);
  const [favoriteMessages, setFavoriteMessages] = useState<DailyMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isAuthenticated) {
      fetchProfileData();
    }
  }, [authLoading, isAuthenticated]);

  const fetchProfileData = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data.success) {
        setEntries(response.data.user.entries || []);
        setWinnings(response.data.user.winners || []);
        setFavoriteMessages(response.data.user.favorites || []);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="pt-32 pb-20 text-center">
        <p className="text-rose-300 font-serif italic text-lg animate-pulse">
          Loading your romantic profile... 💕
        </p>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 max-w-5xl mx-auto px-4 space-y-10">
      {/* Profile Header Card */}
      <div className="glass-panel rounded-3xl p-8 border border-rose-400/30 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-center gap-6">
        <img
          src={user?.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=Love'}
          alt={user?.name}
          className="w-24 h-24 rounded-full border-2 border-gold-400/60 object-cover shadow-lg"
        />

        <div className="space-y-2 text-center sm:text-left flex-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-300 text-xs font-semibold">
            <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
            <span>LoveDraw Member</span>
          </div>

          <h1 className="font-serif text-3xl font-extrabold text-white">{user?.name}</h1>
          <p className="text-sm text-blush-200">{user?.email}</p>
        </div>

        {/* Stats Pills */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 rounded-2xl glass-card border border-rose-400/20">
            <span className="font-serif text-2xl font-bold text-white block">{entries.length}</span>
            <span className="text-[10px] text-blush-300 uppercase font-semibold">Draw Entries</span>
          </div>

          <div className="p-3 rounded-2xl glass-card border border-rose-400/20">
            <span className="font-serif text-2xl font-bold text-gold-300 block">{winnings.length}</span>
            <span className="text-[10px] text-blush-300 uppercase font-semibold">Winnings</span>
          </div>

          <div className="p-3 rounded-2xl glass-card border border-rose-400/20">
            <span className="font-serif text-2xl font-bold text-rose-400 block">{favoriteMessages.length}</span>
            <span className="text-[10px] text-blush-300 uppercase font-semibold">Saved Notes</span>
          </div>
        </div>
      </div>

      {/* Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Draw Entries History */}
        <div className="glass-panel rounded-3xl p-6 border border-rose-400/20 space-y-4">
          <h3 className="font-serif text-xl font-bold text-white flex items-center gap-2">
            <Gift className="w-5 h-5 text-gold-400" />
            Draw Participation History
          </h3>

          {entries.length === 0 ? (
            <p className="text-xs text-blush-300 italic py-6 text-center">
              You haven't participated in any draws yet. Explore active draws! ❤️
            </p>
          ) : (
            <div className="space-y-3">
              {entries.map((e) => (
                <div key={e.id} className="p-4 rounded-2xl glass-card border border-rose-400/20 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white">{e.draw?.title}</p>
                    <p className="font-mono text-xs text-gold-300">{e.referenceCode}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-400 uppercase bg-emerald-500/10 px-2.5 py-1 rounded-full">
                    {e.paymentMode} CONFIRMED
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Favorite Saved Messages */}
        <div className="glass-panel rounded-3xl p-6 border border-rose-400/20 space-y-4">
          <h3 className="font-serif text-xl font-bold text-white flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-rose-400" />
            Saved Favorite Love Notes
          </h3>

          {favoriteMessages.length === 0 ? (
            <p className="text-xs text-blush-300 italic py-6 text-center">
              No saved love notes yet. Click the bookmark icon on any note! 💌
            </p>
          ) : (
            <div className="space-y-3">
              {favoriteMessages.map((m) => (
                <div key={m.id} className="p-4 rounded-2xl glass-card border border-rose-400/20 space-y-1">
                  <span className="text-[10px] font-bold text-gold-300 uppercase">{m.category}</span>
                  <p className="font-serif text-sm text-white italic">"{m.message}"</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
