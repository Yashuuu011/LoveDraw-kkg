import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, UserCheck, X, Search, ShieldCheck, Zap } from 'lucide-react';
import api from '../services/api';
import { User } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useSound } from '../context/SoundContext';

export const Friends: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { playClick, playNotification, playSuccess } = useSound();

  const [friends, setFriends] = useState<User[]>([]);
  const [requests, setRequests] = useState<{ id: string, sender: User }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // States for cinematic animations
  const [assembled, setAssembled] = useState(false);
  const [processedRequestId, setProcessedRequestId] = useState<string | null>(null);
  const [processType, setProcessType] = useState<'ACCEPT' | 'DECLINE' | null>(null);

  useEffect(() => {
    fetchFriendsAndRequests();
    // Trigger "Assemble" animation after brief delay
    setTimeout(() => {
      setAssembled(true);
      playSuccess(); // Dramatic entry chord
    }, 500);
  }, []);

  const fetchFriendsAndRequests = async () => {
    try {
      const [friendsRes, requestsRes] = await Promise.all([
        api.get('/friends'),
        api.get('/friends/requests')
      ]);
      if (friendsRes.data.success) setFriends(friendsRes.data.data);
      if (requestsRes.data.success) setRequests(requestsRes.data.data);
    } catch (error) {
      console.error('Comms error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    playClick();
    if (!searchQuery.trim()) return;
    try {
      const response = await api.get(`/chat/users?search=${searchQuery}`);
      if (response.data.success) setSearchResults(response.data.data);
    } catch (error) {
      addToast('Search failed.', 'error');
    }
  };

  const handleSendRequest = async (receiverId: string) => {
    playClick();
    try {
      await api.post('/friends/request', { receiverId });
      addToast('RECRUITMENT SIGNAL SENT', 'success');
      setSearchResults(prev => prev.filter(u => u.id !== receiverId));
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to send signal', 'error');
    }
  };

  const handleRespondRequest = async (requestId: string, status: 'ACCEPTED' | 'REJECTED') => {
    playClick();
    // Trigger cinematic animation state first
    setProcessedRequestId(requestId);
    setProcessType(status === 'ACCEPTED' ? 'ACCEPT' : 'DECLINE');
    if (status === 'ACCEPTED') playNotification();

    // Wait for animation to finish before removing from DOM
    setTimeout(async () => {
      try {
        const endpoint = status === 'ACCEPTED' ? `/friends/accept/${requestId}` : `/friends/reject/${requestId}`;
        await api.post(endpoint);
        fetchFriendsAndRequests();
      } catch (error: any) {
        addToast(error.response?.data?.message || 'Action failed', 'error');
      }
      setProcessedRequestId(null);
      setProcessType(null);
    }, 1000); // 1 second animation duration
  };

  return (
    <div className="relative min-h-screen bg-marvel-navy overflow-hidden pt-28 pb-20 selection:bg-marvel-blue/30">
      {/* HUD Grid Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="w-full h-full opacity-10" style={{ backgroundImage: 'linear-gradient(var(--marvel-blue) 1px, transparent 1px), linear-gradient(90deg, var(--marvel-blue) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-marvel-blue/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 relative z-10 space-y-16">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-6 py-2 border border-marvel-blue bg-marvel-navy/80 text-marvel-blue text-xs font-bold uppercase tracking-[0.3em] shadow-[0_0_15px_rgba(81,140,202,0.3)]">
            <ShieldCheck className="w-4 h-4" />
            S.H.I.E.L.D. Initiative
          </div>
          <h1 className="font-sans text-5xl md:text-7xl font-black text-white uppercase tracking-widest drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            OUR <span className="text-marvel-blue">TEAM</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Column: Team Display */}
          <div className="lg:col-span-2 space-y-8 relative">
            <div className="flex items-center justify-between border-b border-marvel-blue/50 pb-4">
              <h2 className="font-sans text-2xl font-bold text-white uppercase tracking-widest flex items-center gap-3">
                <UsersIcon /> Active Roster
              </h2>
              <span className="text-marvel-blue font-bold font-mono bg-marvel-blue/10 px-3 py-1 border border-marvel-blue/30">
                TOTAL: {friends.length + 1}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
              {/* Energy connecting lines (visible when assembled) */}
              {assembled && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="absolute inset-0 pointer-events-none z-0"
                >
                  <svg className="w-full h-full absolute top-0 left-0" style={{ filter: 'drop-shadow(0 0 5px var(--marvel-blue))' }}>
                    <line x1="25%" y1="20%" x2="75%" y2="50%" stroke="var(--marvel-blue)" strokeWidth="1" strokeDasharray="5,5" opacity="0.3" />
                    <line x1="25%" y1="80%" x2="75%" y2="50%" stroke="var(--marvel-blue)" strokeWidth="1" strokeDasharray="5,5" opacity="0.3" />
                  </svg>
                </motion.div>
              )}

              {/* Current User Card */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={assembled ? { opacity: 1, x: 0 } : {}}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="bg-black/60 border border-marvel-gold p-6 relative group overflow-hidden z-10 shadow-[0_0_20px_rgba(247,143,63,0.1)]"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-marvel-gold/10 rounded-full blur-[20px]" />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-16 h-16 bg-marvel-navy border-2 border-marvel-gold flex items-center justify-center relative">
                    <img src={user?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.id}`} className="w-full h-full object-cover" alt="Me" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-marvel-gold uppercase tracking-widest">{user?.name}</h3>
                    <p className="text-[10px] text-white uppercase tracking-[0.2em] opacity-80">Commander / You</p>
                    <div className="flex items-center gap-1 mt-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_#28A745]" />
                      <span className="text-[9px] text-green-500 font-mono tracking-widest">ONLINE</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Friends Cards */}
              {friends.map((friend, i) => (
                <motion.div
                  key={friend.id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={assembled ? { opacity: 1, x: 0 } : {}}
                  transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 + (i * 0.1) }}
                  className="bg-black/60 border border-marvel-blue p-6 relative group overflow-hidden z-10 hover:border-white transition-colors"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-marvel-blue/10 rounded-full blur-[20px]" />
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-16 h-16 bg-marvel-navy border-2 border-marvel-blue flex items-center justify-center">
                      <img src={friend.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${friend.id}`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt={friend.name} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white uppercase tracking-widest">{friend.name}</h3>
                      <p className="text-[10px] text-marvel-blue uppercase tracking-[0.2em]">Field Agent</p>
                      <div className="flex items-center gap-1 mt-2">
                        <div className="w-2 h-2 bg-marvel-blue rounded-full shadow-[0_0_5px_var(--marvel-blue)]" />
                        <span className="text-[9px] text-marvel-blue font-mono tracking-widest">STABLE</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Column: Recruitment & Requests */}
          <div className="space-y-12">
            
            {/* Incoming Requests */}
            {requests.length > 0 && (
              <div className="space-y-4">
                <h2 className="font-sans text-xl font-bold text-marvel-red uppercase tracking-widest flex items-center gap-2 animate-pulse">
                  <Zap className="w-5 h-5" /> New Hero Requests
                </h2>
                <div className="space-y-4">
                  <AnimatePresence>
                    {requests.map((req) => {
                      // Determine animation classes based on accept/decline process
                      const isProcessingThis = processedRequestId === req.id;
                      const isAccepting = isProcessingThis && processType === 'ACCEPT';
                      const isDeclining = isProcessingThis && processType === 'DECLINE';

                      return (
                        <motion.div
                          key={req.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ 
                            opacity: isDeclining ? 0 : 1,
                            scale: isAccepting ? 1.05 : isDeclining ? 0 : 1,
                            backgroundColor: isAccepting ? 'rgba(40, 167, 69, 0.2)' : 'rgba(0,0,0,0.6)',
                            borderColor: isAccepting ? '#28A745' : 'rgba(226, 54, 54, 0.5)'
                          }}
                          exit={{ opacity: 0, scale: 0.5, filter: 'blur(10px)' }}
                          className="border border-marvel-red/50 p-4 relative overflow-hidden"
                        >
                          {/* Accept Glow Overlay */}
                          {isAccepting && (
                            <motion.div 
                              initial={{ x: '-100%' }}
                              animate={{ x: '100%' }}
                              transition={{ duration: 0.8 }}
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/50 to-transparent z-0"
                            />
                          )}

                          <div className="relative z-10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 border border-marvel-red bg-marvel-navy">
                                <img src={req.sender.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${req.sender.id}`} className="w-full h-full grayscale" alt="avatar" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-white uppercase tracking-wider">{req.sender.name}</p>
                                <p className="text-[9px] text-marvel-red font-mono">AWAITING CLEARANCE</p>
                              </div>
                            </div>
                            
                            {isProcessingThis ? (
                              <div className="text-[10px] font-bold font-mono tracking-widest text-center px-2">
                                {isAccepting ? (
                                  <span className="text-green-500 drop-shadow-[0_0_5px_#28A745]">ACCESS GRANTED</span>
                                ) : (
                                  <span className="text-marvel-red">PURGING...</span>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleRespondRequest(req.id, 'ACCEPTED')}
                                  className="w-8 h-8 flex items-center justify-center border border-green-500 text-green-500 hover:bg-green-500 hover:text-black transition-colors shadow-[0_0_10px_rgba(40,167,69,0.2)]"
                                >
                                  <UserCheck className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleRespondRequest(req.id, 'REJECTED')}
                                  className="w-8 h-8 flex items-center justify-center border border-marvel-red text-marvel-red hover:bg-marvel-red hover:text-black transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Recruit Heroes Search */}
            <div className="space-y-4">
              <h2 className="font-sans text-xl font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <Search className="w-5 h-5 text-marvel-blue" /> Recruit Heroes
              </h2>
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter Designation..."
                  className="w-full bg-black/60 border border-marvel-blue/50 text-white p-4 pl-12 font-mono text-sm focus:outline-none focus:border-marvel-blue focus:shadow-[0_0_15px_rgba(81,140,202,0.3)] transition-all"
                />
                <Search className="absolute left-4 top-4 w-5 h-5 text-marvel-blue/50" />
                <button type="submit" className="absolute right-2 top-2 bottom-2 px-4 bg-marvel-blue text-white font-bold text-[10px] uppercase tracking-widest hover:bg-white hover:text-marvel-blue transition-colors">
                  Scan
                </button>
              </form>

              {/* Search Results */}
              <div className="space-y-3">
                {searchResults.map((u) => (
                  <div key={u.id} className="bg-black/40 border border-white/10 p-3 flex items-center justify-between group hover:border-marvel-blue transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 border border-white/20 bg-marvel-navy">
                         <img src={u.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.id}`} className="w-full h-full grayscale" alt="avatar" />
                      </div>
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{u.name}</span>
                    </div>
                    <button
                      onClick={() => handleSendRequest(u.id)}
                      className="p-2 border border-marvel-blue text-marvel-blue hover:bg-marvel-blue hover:text-black transition-colors"
                      title="Send Request"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

// Extracted simple icon for top header
const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-marvel-blue">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export default Friends;
