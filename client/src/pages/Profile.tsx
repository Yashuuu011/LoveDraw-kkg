import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, Target, Server, Database, Phone, Calendar, Crosshair, X, Activity, Cpu } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Entry, DailyMessage, Winner } from '../types';
import { formatDateIST } from '../utils/dateFormatter';
import { useSound } from '../context/SoundContext';

export const Profile: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const { playClick, playSuccess, playNotification } = useSound();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [winnings, setWinnings] = useState<Winner[]>([]);
  const [favoriteMessages, setFavoriteMessages] = useState<DailyMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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
    playClick();
    setIsSaving(true);
    try {
      const res = await api.put('/auth/profile', {
        bio: editForm.bio,
        phone: editForm.phone,
        dateOfBirth: editForm.dateOfBirth || null
      });
      if (res.data.success) {
        playSuccess();
        addToast('SUIT CALIBRATION COMPLETE', 'success');
        setIsEditing(false);
        window.location.reload(); 
      }
    } catch (error) {
      addToast('CALIBRATION FAILED', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="pt-32 pb-20 text-center min-h-screen bg-black flex flex-col items-center justify-center">
        <Crosshair className="w-16 h-16 text-marvel-blue mx-auto mb-6 animate-spin-slow" />
        <p className="text-marvel-blue font-mono font-bold text-lg uppercase tracking-[0.3em] animate-pulse">
          Initializing Suit Diagnostics...
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black overflow-hidden pt-28 pb-20 selection:bg-marvel-blue/30 font-sans">
      
      {/* Iron Man HUD Background Effects */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-20">
        <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-marvel-blue/10 via-black to-black" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-marvel-blue/30 rounded-full flex items-center justify-center">
          <div className="w-[600px] h-[600px] border border-marvel-blue/20 rounded-full flex items-center justify-center animate-spin-slow">
            <div className="w-[400px] h-[400px] border-2 border-dashed border-marvel-blue/40 rounded-full" />
          </div>
        </div>
        <div className="absolute top-0 left-0 w-full h-[2px] bg-marvel-blue/30 animate-scanline" />
      </div>

      <div className="max-w-6xl mx-auto px-4 space-y-10 relative z-10">
        
        {/* Main Arc Reactor & Profile Header */}
        <div className="bg-black/60 backdrop-blur-xl border-2 border-marvel-blue/50 p-8 shadow-[0_0_30px_rgba(81,140,202,0.15)] relative overflow-hidden flex flex-col md:flex-row items-center gap-12 group">
          
          {/* Arc Reactor Graphic */}
          <div className="relative flex-shrink-0">
            <div className="w-40 h-40 rounded-full border-4 border-marvel-blue/30 flex items-center justify-center relative shadow-[0_0_50px_rgba(81,140,202,0.2)]">
              {/* Spinning rings */}
              <motion.div className="absolute inset-0 border-2 border-dashed border-marvel-blue rounded-full" animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} />
              <motion.div className="absolute inset-2 border-4 border-marvel-blue/50 rounded-full" animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} />
              <motion.div className="absolute inset-6 border-2 border-dotted border-white rounded-full opacity-50" animate={{ rotate: 180 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} />
              
              {/* Inner Core */}
              <div className="w-20 h-20 bg-marvel-blue rounded-full shadow-[0_0_30px_var(--marvel-blue)] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-white mix-blend-overlay opacity-50" />
                <img src={user?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.id}`} className="w-full h-full object-cover mix-blend-luminosity opacity-80" alt="Avatar" />
              </div>
            </div>
            
            <button 
              onClick={() => { playClick(); setIsEditing(true); }}
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 bg-black border border-marvel-blue text-marvel-blue text-[10px] font-bold uppercase tracking-widest hover:bg-marvel-blue hover:text-black transition-colors z-20 whitespace-nowrap"
            >
              Calibrate Suit
            </button>
          </div>

          <div className="space-y-4 text-center md:text-left flex-1 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-marvel-blue/10 border border-marvel-blue/50 text-marvel-blue text-[10px] font-mono tracking-widest uppercase">
              <Shield className="w-3.5 h-3.5" />
              <span>Mark LXXXV Activated</span>
            </div>

            <h1 className="font-sans text-4xl md:text-5xl font-black text-white uppercase tracking-widest">{user?.name}</h1>
            <p className="text-xs font-mono text-marvel-blue uppercase tracking-widest">{user?.email}</p>
            
            {user?.bio && (
              <div className="p-3 bg-black border-l-2 border-marvel-blue">
                <p className="text-xs font-mono text-slate-300 tracking-wider">"{user.bio}"</p>
              </div>
            )}

            <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-2">
              {user?.phone && (
                <div className="flex items-center gap-2 text-[10px] font-mono text-marvel-blue uppercase tracking-widest">
                  <Phone className="w-4 h-4 text-white" />
                  <span>Comm: {user.phone}</span>
                </div>
              )}
              {user?.dateOfBirth && (
                <div className="flex items-center gap-2 text-[10px] font-mono text-marvel-blue uppercase tracking-widest">
                  <Calendar className="w-4 h-4 text-white" />
                  <span>Init: {formatDateIST(user.dateOfBirth)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats Pills (Suit Diagnostics) */}
          <div className="flex flex-row md:flex-col gap-4">
            <div className="p-4 bg-black/80 border border-marvel-blue/30 text-center min-w-[120px]">
              <span className="font-mono text-3xl font-black text-white block">{entries.length}</span>
              <span className="text-[9px] text-marvel-blue uppercase tracking-widest font-bold mt-1 block">Combat Sims</span>
            </div>
            <div className="p-4 bg-black/80 border border-marvel-gold/30 text-center min-w-[120px]">
              <span className="font-mono text-3xl font-black text-marvel-gold block">{favoriteMessages.length}</span>
              <span className="text-[9px] text-marvel-gold uppercase tracking-widest font-bold mt-1 block">Data Archives</span>
            </div>
          </div>
        </div>

        {/* Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Draw Entries History (Combat Sims) */}
          <div className="bg-black/60 backdrop-blur-md border border-white/10 p-6 relative overflow-hidden group hover:border-marvel-blue/50 transition-colors">
            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
              <Target className="w-6 h-6 text-marvel-red" />
              <h3 className="font-sans text-xl font-bold text-white uppercase tracking-widest">Mission Logs</h3>
            </div>

            {entries.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">No active deployments detected.</p>
              </div>
            ) : (
              <div className="space-y-3 h-64 overflow-y-auto custom-scrollbar pr-2">
                {entries.map((e) => (
                  <div key={e.id} className="p-4 bg-black border border-white/10 flex items-center justify-between group-hover:border-marvel-red/30 transition-colors">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-white uppercase tracking-wider">{e.draw?.title}</p>
                      <p className="font-mono text-[9px] text-slate-400 tracking-widest">ID: {e.referenceCode}</p>
                    </div>
                    <span className="text-[9px] font-bold text-marvel-red border border-marvel-red px-2 py-1 uppercase tracking-widest">
                      {e.paymentMode} VERIFIED
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Favorite Saved Messages (Encrypted Memory Banks) */}
          <div className="bg-black/60 backdrop-blur-md border border-white/10 p-6 relative overflow-hidden group hover:border-marvel-gold/50 transition-colors">
            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
              <Database className="w-6 h-6 text-marvel-gold" />
              <h3 className="font-sans text-xl font-bold text-white uppercase tracking-widest">Encrypted Banks</h3>
            </div>

            {favoriteMessages.length === 0 ? (
              <div className="text-center py-8">
                <Server className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Memory banks empty.</p>
              </div>
            ) : (
              <div className="space-y-3 h-64 overflow-y-auto custom-scrollbar pr-2">
                {favoriteMessages.map((m) => (
                  <div key={m.id} className="p-4 bg-black border border-white/10 space-y-2 group-hover:border-marvel-gold/30 transition-colors">
                    <span className="text-[9px] font-bold text-marvel-gold border border-marvel-gold px-2 py-0.5 uppercase tracking-widest bg-marvel-gold/10">
                      CLASS: {m.category}
                    </span>
                    <p className="font-mono text-[11px] text-slate-300 leading-relaxed uppercase">
                      &gt; {m.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Edit Profile Modal (Suit Calibration Terminal) */}
        <AnimatePresence>
          {isEditing && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-black border-2 border-marvel-blue w-full max-w-lg p-8 shadow-[0_0_50px_rgba(81,140,202,0.3)] relative"
              >
                {/* Modal Scanline */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-marvel-blue/10 to-transparent h-[10%] translate-y-[-100%] animate-scanline pointer-events-none" />

                <button 
                  onClick={() => { playClick(); setIsEditing(false); }}
                  className="absolute top-4 right-4 p-2 text-marvel-blue hover:bg-marvel-blue hover:text-black transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-8">
                  <Cpu className="w-6 h-6 text-marvel-blue animate-pulse" />
                  <h2 className="font-sans text-2xl font-black text-white uppercase tracking-[0.2em]">Suit Calibration</h2>
                </div>

                <form onSubmit={handleEditSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-marvel-blue uppercase tracking-[0.2em]">System Designation (Bio)</label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                      placeholder="Input parameters..."
                      className="w-full px-4 py-3 bg-black border border-marvel-blue/50 focus:border-marvel-blue focus:shadow-[0_0_15px_rgba(81,140,202,0.2)] outline-none text-white font-mono text-sm resize-none h-24 uppercase"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-marvel-blue uppercase tracking-[0.2em]">Comm Frequency (Mobile)</label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                      placeholder="+91 9876543210"
                      className="w-full px-4 py-3 bg-black border border-marvel-blue/50 focus:border-marvel-blue focus:shadow-[0_0_15px_rgba(81,140,202,0.2)] outline-none text-white font-mono text-sm uppercase"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-marvel-blue uppercase tracking-[0.2em]">Initialization Date (DOB)</label>
                    <input
                      type="date"
                      value={editForm.dateOfBirth}
                      onChange={(e) => setEditForm({...editForm, dateOfBirth: e.target.value})}
                      className="w-full px-4 py-3 bg-black border border-marvel-blue/50 focus:border-marvel-blue focus:shadow-[0_0_15px_rgba(81,140,202,0.2)] outline-none text-white font-mono text-sm uppercase [color-scheme:dark]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full py-4 mt-4 bg-marvel-blue/20 border-2 border-marvel-blue text-marvel-blue font-bold uppercase tracking-[0.3em] hover:bg-marvel-blue hover:text-black transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <><Zap className="w-5 h-5 animate-pulse" /> Calibrating...</>
                    ) : (
                      <><Zap className="w-5 h-5" /> Execute Update</>
                    )}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default Profile;
