import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, UserCheck, X, Search, MessageCircle } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

interface User {
  id: string;
  name: string;
  avatarUrl: string;
  isOnline?: boolean;
  lastSeen?: string;
}

interface FriendRequest {
  id: string;
  sender: User;
  createdAt: string;
}

const Friends: React.FC = () => {
  const [friends, setFriends] = useState<User[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { showToast } = useToast();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchFriends();
    fetchRequests();

    if (socket) {
      socket.on('friend_request', (data) => {
        fetchRequests();
        showToast(`New friend request from ${data.sender.name}`, 'info');
      });

      socket.on('friend_request_accepted', (data) => {
        fetchFriends();
        showToast(`${data.name} accepted your friend request!`, 'success');
      });

      socket.on('user_online', ({ userId }) => {
        setFriends(prev => prev.map(f => f.id === userId ? { ...f, isOnline: true } : f));
      });

      socket.on('user_offline', ({ userId, lastSeen }) => {
        setFriends(prev => prev.map(f => f.id === userId ? { ...f, isOnline: false, lastSeen } : f));
      });
    }

    return () => {
      if (socket) {
        socket.off('friend_request');
        socket.off('friend_request_accepted');
        socket.off('user_online');
        socket.off('user_offline');
      }
    };
  }, [socket]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length > 1) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchFriends = async () => {
    try {
      const res = await api.get('/friends');
      if (res.data.success) setFriends(res.data.data);
    } catch (err) {
      console.error('Failed to load friends', err);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await api.get('/friends/requests');
      if (res.data.success) setRequests(res.data.data);
    } catch (err) {
      console.error('Failed to load requests', err);
    }
  };

  const handleSearch = async () => {
    try {
      const res = await api.get(`/chat/users?search=${encodeURIComponent(searchQuery)}`);
      if (res.data.success) setSearchResults(res.data.data);
    } catch (err) {
      console.error('Search failed', err);
    }
  };

  const sendRequest = async (receiverId: string) => {
    try {
      await api.post('/friends/request', { receiverId });
      showToast('Friend request sent!', 'success');
      setSearchQuery('');
      setSearchResults([]);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to send request', 'error');
    }
  };

  const acceptRequest = async (id: string) => {
    try {
      await api.post(`/friends/accept/${id}`);
      showToast('Friend request accepted!', 'success');
      setRequests(prev => prev.filter(req => req.id !== id));
      fetchFriends();
    } catch (err) {
      showToast('Failed to accept request', 'error');
    }
  };

  const rejectRequest = async (id: string) => {
    try {
      await api.post(`/friends/reject/${id}`);
      showToast('Friend request removed', 'info');
      setRequests(prev => prev.filter(req => req.id !== id));
    } catch (err) {
      showToast('Failed to reject request', 'error');
    }
  };

  const startChat = async (friendId: string) => {
    try {
      const res = await api.post('/chat/rooms', { partnerId: friendId });
      if (res.data.success) {
        navigate('/chat', { state: { roomId: res.data.data.id } });
      }
    } catch (err) {
      showToast('Failed to start chat', 'error');
    }
  };

  return (
    <div className="pt-24 pb-12 max-w-6xl mx-auto px-4 min-h-screen">
      <h1 className="text-3xl font-serif font-bold text-slate-800 dark:text-white mb-8 text-center">Friends</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column: My Friends & Pending Requests */}
        <div className="space-y-8">
          
          {/* Pending Requests */}
          <div className="glass-panel p-6 rounded-3xl border border-rose-200 dark:border-rose-400/30">
            <h2 className="text-xl font-bold font-serif mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
              <UserCheck className="w-5 h-5 text-rose-500" /> Pending Requests
              {requests.length > 0 && (
                <span className="bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full">{requests.length}</span>
              )}
            </h2>
            
            {requests.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-300 text-sm dark:text-blush-200">No pending friend requests.</p>
            ) : (
              <div className="space-y-4">
                {requests.map(req => (
                  <div key={req.id} className="flex items-center justify-between p-3 bg-white/50 dark:bg-plum-900/90 rounded-2xl border border-rose-100 dark:border-rose-400/20">
                    <div className="flex items-center gap-3">
                      <img src={req.sender.avatarUrl || '/default-avatar.png'} alt={req.sender.name} className="w-10 h-10 rounded-full" />
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-white">{req.sender.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-300">Wants to be friends</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => acceptRequest(req.id)} className="p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors" title="Accept">
                        <UserCheck className="w-4 h-4" />
                      </button>
                      <button onClick={() => rejectRequest(req.id)} className="p-2 bg-rose-100 text-rose-600 rounded-xl hover:bg-rose-200 dark:bg-rose-500/20 dark:hover:bg-rose-500/40 transition-colors" title="Reject">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Friends */}
          <div className="glass-panel p-6 rounded-3xl border border-rose-200 dark:border-rose-400/30">
            <h2 className="text-xl font-bold font-serif mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
              <UserPlus className="w-5 h-5 text-rose-500" /> My Friends
            </h2>
            
            {friends.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-300 text-sm dark:text-blush-200">You haven't added any friends yet. Search for users to connect!</p>
            ) : (
              <div className="space-y-4">
                {friends.map(friend => (
                  <div key={friend.id} className="flex items-center justify-between p-3 bg-white/50 dark:bg-plum-900/90 rounded-2xl border border-rose-100 dark:border-rose-400/20 transition-all hover:border-rose-300">
                    <div className="flex items-center gap-3 relative">
                      <div className="relative">
                        <img src={friend.avatarUrl || '/default-avatar.png'} alt={friend.name} className="w-10 h-10 rounded-full" />
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-plum-900 ${friend.isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-white">{friend.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-300">
                          {friend.isOnline ? 'Online' : friend.lastSeen ? `Last seen ${new Date(friend.lastSeen).toLocaleDateString()}` : 'Offline'}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => startChat(friend.id)} className="px-4 py-2 bg-rose-500 text-white rounded-full text-sm hover:bg-rose-600 transition-colors flex items-center gap-2 font-medium">
                      <MessageCircle className="w-4 h-4" /> Message
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Find Users */}
        <div className="glass-panel p-6 rounded-3xl border border-rose-200 dark:border-rose-400/30 h-fit sticky top-24">
          <h2 className="text-xl font-bold font-serif mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
            <Search className="w-5 h-5 text-rose-500" /> Find People
          </h2>
          <div className="relative mb-6">
            <input 
              type="text" 
              placeholder="Search by name or number..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-10 rounded-2xl bg-slate-50 dark:bg-plum-900/90 border border-slate-200 dark:border-rose-400/30 focus:outline-none focus:ring-2 focus:ring-rose-400/50 text-slate-800 dark:text-white"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
          </div>

          <div className="space-y-4">
            {searchResults.length > 0 ? searchResults.map(su => (
              <div key={su.id} className="flex items-center justify-between p-3 bg-white/50 dark:bg-plum-900/90 rounded-2xl">
                <div className="flex items-center gap-3">
                  <img src={su.avatarUrl || '/default-avatar.png'} alt={su.name} className="w-10 h-10 rounded-full" />
                  <p className="font-medium text-slate-800 dark:text-white">{su.name}</p>
                </div>
                <button 
                  onClick={() => sendRequest(su.id)} 
                  className="p-2 bg-rose-100 text-rose-600 rounded-xl hover:bg-rose-200 dark:bg-rose-500/20 dark:hover:bg-rose-500/40 transition-colors"
                  title="Add Friend"
                >
                  <UserPlus className="w-4 h-4" />
                </button>
              </div>
            )) : searchQuery.length > 1 ? (
              <p className="text-center text-slate-500 dark:text-slate-300 text-sm">No users found.</p>
            ) : (
              <p className="text-center text-slate-500 dark:text-slate-300 text-sm dark:text-blush-200">Start typing to find your loved ones.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Friends;
