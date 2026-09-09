import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User as UserIcon, Heart, Trophy, Gift, Bookmark, Calendar, Phone, Edit3, X } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Entry, DailyMessage, Winner } from '../types';
import { formatDateIST } from '../utils/dateFormatter';

export const Profile: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [winnings, setWinnings] = useState<Winner[]>([]);
  const [favoriteMessages, setFavoriteMessages] = useState<DailyMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  // Edit State
  const [editForm, setEditForm] = useState({
    bio: '',
    phone: '',
    dateOfBirth: ''
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isAuthenticated && user) {
      fetchProfileData();
      setEditForm({
        bio: user.bio || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : ''
      });
    }
  }, [authLoading, isAuthenticated, user]);

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

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.put('/auth/profile', {
        bio: editForm.bio,
        phone: editForm.phone,
        dateOfBirth: editForm.dateOfBirth || null
      });
      if (res.data.success) {
        addToast('Profile updated successfully!', 'success');
        setIsEditing(false);
        // Refresh page or context to get updated user data
        window.location.reload(); 
      }
    } catch (error) {
      addToast('Failed to update profile', 'error');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="pt-32 pb-20 text-center">
        <p className="text-primary font-serif italic text-lg animate-pulse">
          Loading your romantic profile... 💕
        </p>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 max-w-5xl mx-auto px-4 space-y-10">
      {/* Profile Header Card */}
      <div className="bg-card rounded-3xl p-8 border border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(244,63,114,0.06)] relative overflow-hidden flex flex-col sm:flex-row items-center gap-8">
        <div className="relative group">
          <img
            src={user?.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=Love'}
            alt={user?.name}
            className="w-28 h-28 rounded-full border-4 border-background-secondary object-cover shadow-lg"
          />
          <button 
            onClick={() => setIsEditing(true)}
            className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg hover:scale-110 transition-transform"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-center sm:text-left flex-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <Heart className="w-3.5 h-3.5 fill-primary text-primary" />
            <span>LoveDraw Member</span>
          </div>

          <h1 className="font-serif text-3xl font-extrabold text-text-primary">{user?.name}</h1>
          <p className="text-sm text-text-secondary">{user?.email}</p>
          
          {user?.bio && (
            <p className="text-sm text-text-muted italic max-w-md">"{user.bio}"</p>
          )}

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2">
            {user?.phone && (
              <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                <Phone className="w-3.5 h-3.5" />
                <span>{user.phone}</span>
              </div>
            )}
            {user?.dateOfBirth && (
              <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDateIST(user.dateOfBirth)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats Pills */}
        <div className="flex sm:flex-col gap-4">
          <div className="p-3 px-5 rounded-2xl bg-background-secondary border border-border text-center">
            <span className="font-serif text-2xl font-bold text-text-primary block">{entries.length}</span>
            <span className="text-[10px] text-text-muted uppercase font-semibold">Draws</span>
          </div>
          <div className="p-3 px-5 rounded-2xl bg-background-secondary border border-border text-center">
            <span className="font-serif text-2xl font-bold text-accent block">{favoriteMessages.length}</span>
            <span className="text-[10px] text-text-muted uppercase font-semibold">Saved Notes</span>
          </div>
        </div>
      </div>

      {/* Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Draw Entries History */}
        <div className="bg-card rounded-3xl p-6 border border-border space-y-4">
          <h3 className="font-serif text-xl font-bold text-text-primary flex items-center gap-2">
            <Gift className="w-5 h-5 text-accent" />
            Draw Participation History
          </h3>

          {entries.length === 0 ? (
            <p className="text-xs text-text-muted italic py-6 text-center">
              You haven't participated in any draws yet. Explore active draws! ❤️
            </p>
          ) : (
            <div className="space-y-3">
              {entries.map((e) => (
                <div key={e.id} className="p-4 rounded-2xl bg-background border border-border flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-text-primary">{e.draw?.title}</p>
                    <p className="font-mono text-xs text-text-muted">{e.referenceCode}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-white uppercase bg-gradient-to-r from-primary to-accent px-2.5 py-1 rounded-full shadow-[0_0_10px_var(--glow-color)]">
                    {e.paymentMode} CONFIRMED
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Favorite Saved Messages */}
        <div className="bg-card rounded-3xl p-6 border border-border space-y-4">
          <h3 className="font-serif text-xl font-bold text-text-primary flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-primary" />
            Saved Favorite Love Notes
          </h3>

          {favoriteMessages.length === 0 ? (
            <p className="text-xs text-text-muted italic py-6 text-center">
              No saved love notes yet. Click the bookmark icon on any note! 💌
            </p>
          ) : (
            <div className="space-y-3">
              {favoriteMessages.map((m) => (
                <div key={m.id} className="p-4 rounded-2xl bg-background border border-border space-y-1">
                  <span className="text-[10px] font-bold text-accent uppercase">{m.category}</span>
                  <p className="font-serif text-sm text-text-secondary italic">"{m.message}"</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card w-full max-w-md rounded-3xl p-6 border border-border shadow-2xl relative"
            >
              <button 
                onClick={() => setIsEditing(false)}
                className="absolute top-4 right-4 p-2 text-text-muted hover:text-text-primary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="font-serif text-2xl font-bold text-text-primary mb-6">Edit Profile</h2>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Bio</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                    placeholder="Write a short romantic bio..."
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary/50 outline-none text-sm text-text-primary resize-none h-24"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Mobile Number</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    placeholder="+91 9876543210"
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary/50 outline-none text-sm text-text-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Date of Birth</label>
                  <input
                    type="date"
                    value={editForm.dateOfBirth}
                    onChange={(e) => setEditForm({...editForm, dateOfBirth: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary/50 outline-none text-sm text-text-primary"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 mt-4 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold shadow-lg shadow-[var(--glow-color)] hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  Save Changes
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Profile;
