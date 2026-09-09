import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, X, Zap, Cpu, ScanLine, Signal, Activity } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useSocket } from '../context/SocketContext';
import { useLocation } from 'react-router-dom';
import { formatTimeIST, formatDateIST } from '../utils/dateFormatter';
import { useSound } from '../context/SoundContext';

interface User {
  id: string;
  name: string;
  avatarUrl: string;
  isOnline?: boolean;
  lastSeen?: string;
}

interface ChatMessage {
  id: string;
  content: string | null;
  mediaUrl: string | null;
  mediaType: string | null;
  createdAt: string;
  sender: User;
}

interface ChatRoom {
  id: string;
  participants: { user: User }[];
  messages?: ChatMessage[];
  updatedAt: string;
}

export const Chat: React.FC = () => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [attachment, setAttachment] = useState<{ url: string, type: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [typingUsers, setTypingUsers] = useState<{ [roomId: string]: string }>({});
  const [friends, setFriends] = useState<User[]>([]);

  const { user } = useAuth();
  const { addToast } = useToast();
  const { socket } = useSocket();
  const { playClick, playNotification } = useSound();
  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchFriends = async () => {
    try {
      const res = await api.get('/friends');
      if (res.data.success) setFriends(res.data.data);
    } catch (error) { console.error('Failed to fetch friends', error); }
  };

  const startChat = async (partnerId: string) => {
    playClick();
    try {
      const res = await api.post('/chat/rooms', { partnerId });
      if (res.data.success) {
        await fetchRooms();
        setSelectedRoom(res.data.data);
      }
    } catch (error) {
      addToast('Failed to start secure channel.', 'error');
    }
  };

  useEffect(() => { fetchRooms(); fetchFriends(); }, []);

  useEffect(() => {
    if (rooms.length > 0 && location.state?.roomId) {
      const targetRoom = rooms.find(r => r.id === location.state.roomId);
      if (targetRoom) setSelectedRoom(targetRoom);
    }
  }, [rooms, location.state]);

  useEffect(() => {
    if (selectedRoom) {
      fetchMessages(selectedRoom.id);
      if (socket) socket.emit('join_room', selectedRoom.id);
    }
  }, [selectedRoom, socket]);

  useEffect(() => {
    if (!socket) return;
    socket.on('new_message', (message: ChatMessage) => {
      if (selectedRoom && message.sender.id !== user?.id) {
        setMessages(prev => [...prev, message]);
        playNotification();
        setTimeout(scrollToBottom, 100);
      }
      fetchRooms(); 
    });
    socket.on('typing', ({ userId, roomId }) => {
      if (userId !== user?.id) setTypingUsers(prev => ({ ...prev, [roomId]: userId }));
    });
    socket.on('stop_typing', ({ userId, roomId }) => {
      setTypingUsers(prev => { const next = { ...prev }; delete next[roomId]; return next; });
    });
    socket.on('user_online', ({ userId }) => updateUserStatus(userId, true));
    socket.on('user_offline', ({ userId, lastSeen }) => updateUserStatus(userId, false, lastSeen));

    return () => {
      socket.off('new_message'); socket.off('typing'); socket.off('stop_typing');
      socket.off('user_online'); socket.off('user_offline');
    };
  }, [socket, selectedRoom, user]);

  const updateUserStatus = (userId: string, isOnline: boolean, lastSeen?: string) => {
    setRooms(prevRooms => prevRooms.map(room => ({
      ...room,
      participants: room.participants.map(p => p.user.id === userId ? { ...p, user: { ...p.user, isOnline, lastSeen } } : p)
    })));
    if (selectedRoom) {
      setSelectedRoom(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          participants: prev.participants.map(p => p.user.id === userId ? { ...p, user: { ...p.user, isOnline, lastSeen } } : p)
        };
      });
    }
  };

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  const fetchRooms = async () => {
    try {
      const res = await api.get('/chat/rooms');
      if (res.data.success) setRooms(res.data.data);
    } catch (error) { console.error('Failed to fetch rooms', error); }
  };

  const fetchMessages = async (roomId: string) => {
    try {
      const res = await api.get(`/chat/rooms/${roomId}/messages`);
      if (res.data.success) { setMessages(res.data.data); setTimeout(scrollToBottom, 100); }
    } catch (error) { console.error('Failed to fetch messages', error); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return addToast('MEDIA TOO LARGE (MAX 5MB)', 'error');
    const reader = new FileReader();
    reader.onloadend = () => {
      let type = 'IMAGE';
      if (file.type.startsWith('video/')) type = 'VIDEO';
      if (file.type.startsWith('audio/')) type = 'AUDIO';
      setAttachment({ url: reader.result as string, type });
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    if (socket && selectedRoom) {
      socket.emit('typing', { roomId: selectedRoom.id, receiverId: getPartner(selectedRoom)?.id });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop_typing', { roomId: selectedRoom.id, receiverId: getPartner(selectedRoom)?.id });
      }, 2000);
    }
  };

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!newMessage.trim() && !attachment) || !selectedRoom) return;
    playClick();
    if (socket) socket.emit('stop_typing', { roomId: selectedRoom.id, receiverId: getPartner(selectedRoom)?.id });
    setIsUploading(true);
    try {
      const res = await api.post(`/chat/rooms/${selectedRoom.id}/messages`, {
        content: newMessage.trim() || null,
        mediaUrl: attachment?.url || null,
        mediaType: attachment?.type || null
      });
      if (res.data.success) {
        setMessages([...messages, res.data.data]);
        setNewMessage(''); setAttachment(null);
        setTimeout(scrollToBottom, 100);
        fetchRooms();
      }
    } catch (error: any) { addToast('TRANSMISSION FAILED', 'error'); }
    finally { setIsUploading(false); }
  };

  const getPartner = (room: ChatRoom) => room.participants.find(p => p.user.id !== user?.id)?.user;

  return (
    <div className="pt-24 pb-8 max-w-7xl mx-auto px-4 h-screen flex flex-col relative z-10 selection:bg-marvel-red/30">
      
      {/* Iron Man HUD Background Effects */}
      <div className="absolute inset-0 pointer-events-none z-[-1] overflow-hidden opacity-30">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border-[2px] border-marvel-gold/20 rounded-full animate-spin-slow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border-[1px] border-marvel-red/30 rounded-full" />
      </div>

      <div className="flex-1 flex overflow-hidden shadow-[0_0_50px_rgba(226,54,54,0.15)] bg-black/80 backdrop-blur-2xl border-2 border-marvel-red/50 relative group">
        
        {/* Persistent Scanline inside Chat Container */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-marvel-red/10 to-transparent h-[10%] translate-y-[-100%] group-hover:animate-scanline pointer-events-none z-50" />

        {/* Sidebar - Rooms */}
        <div className="w-1/3 border-r-2 flex flex-col border-marvel-red/50 bg-black/60">
          <div className="p-4 border-b-2 border-marvel-red/50 bg-marvel-red/10 flex flex-col">
            <h2 className="font-sans text-xl font-black text-marvel-gold uppercase tracking-widest flex items-center gap-3">
              <Signal className="w-5 h-5 text-marvel-red animate-pulse" /> 
              Comms Network
            </h2>
          </div>
          
          {/* New Chat from Friends */}
          <div className="p-4 border-b border-marvel-red/30 bg-black/40">
            <h3 className="text-[10px] text-marvel-gold font-mono uppercase mb-3 tracking-widest">Start Transmitting</h3>
            <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-2">
              {friends.map(friend => (
                <button
                  key={friend.id}
                  onClick={() => startChat(friend.id)}
                  className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-marvel-red/50 relative overflow-hidden group hover:border-marvel-gold transition-colors"
                  title={`Message ${friend.name}`}
                >
                  <img src={friend.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${friend.id}`} alt={friend.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                </button>
              ))}
              {friends.length === 0 && <span className="text-[10px] text-white/50">No active agents found in roster.</span>}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
            {rooms.map(room => {
              const partner = getPartner(room);
              const lastMessage = room.messages?.[0];
              const isActive = selectedRoom?.id === room.id;
              return (
                <button
                  key={room.id}
                  onClick={() => { playClick(); setSelectedRoom(room); }}
                  className={`w-full flex items-center gap-4 p-4 transition-all relative overflow-hidden border ${isActive ? 'bg-marvel-red/20 border-marvel-red shadow-[inset_4px_0_0_var(--marvel-red)]' : 'bg-black/40 border-white/10 hover:border-marvel-gold/50'}`}
                >
                  <div className="relative">
                    <div className={`w-12 h-12 bg-marvel-navy border flex items-center justify-center ${isActive ? 'border-marvel-red' : 'border-white/20'}`}>
                       <img src={partner?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${partner?.id}`} alt="Partner" className="w-full h-full object-cover grayscale" />
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 border border-black shadow-[0_0_5px_currentColor] ${partner?.isOnline ? 'bg-green-500 text-green-500' : 'bg-slate-600 text-slate-600'}`} />
                  </div>
                  <div className="flex-1 text-left overflow-hidden">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-white uppercase tracking-wider text-xs truncate">{partner?.name}</span>
                      {lastMessage && (
                        <span className="text-[9px] text-marvel-gold font-mono">
                          {new Date(lastMessage.createdAt).toLocaleDateString() === new Date().toLocaleDateString() ? formatTimeIST(lastMessage.createdAt) : formatDateIST(lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    {lastMessage ? (
                      <p className="text-[10px] text-slate-400 truncate uppercase tracking-widest font-sans font-bold">
                        {lastMessage.sender.id === user?.id ? 'TX: ' : 'RX: '}
                        {lastMessage.content || (lastMessage.mediaUrl ? '[ENCRYPTED MEDIA]' : '')}
                      </p>
                    ) : (
                      <p className="text-[10px] text-marvel-red uppercase tracking-widest font-bold">Initiate Link...</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat Area */}
        <div className="w-2/3 flex flex-col relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-marvel-red/5 via-black to-black">
          {selectedRoom ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b-2 flex items-center justify-between border-marvel-red/50 bg-black/80 backdrop-blur-md z-10 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 bg-marvel-navy border-2 border-marvel-gold shadow-[0_0_15px_rgba(247,143,63,0.3)]">
                    <img src={getPartner(selectedRoom)?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${getPartner(selectedRoom)?.id}`} alt="Partner" className="w-full h-full object-cover grayscale" />
                    <div className="absolute inset-0 bg-marvel-gold mix-blend-color-burn opacity-50" />
                  </div>
                  <div>
                    <h3 className="font-sans font-black text-xl text-white uppercase tracking-[0.2em] leading-tight">
                      {getPartner(selectedRoom)?.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {getPartner(selectedRoom)?.isOnline ? (
                        <>
                          <Activity className="w-3 h-3 text-green-500 animate-pulse" />
                          <span className="text-[10px] text-green-500 font-mono tracking-widest">LINK ACTIVE</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3 h-3 text-slate-500" />
                          <span className="text-[10px] text-slate-500 font-mono tracking-widest">
                            {getPartner(selectedRoom)?.lastSeen ? `LAST PING ${formatTimeIST(getPartner(selectedRoom)!.lastSeen!)}` : 'LINK OFFLINE'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-marvel-red/50 font-mono text-[10px] tracking-widest">
                  <Cpu className="w-4 h-4" /> SECURE CHANNEL
                </div>
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar relative z-0">
                <AnimatePresence>
                  {messages.map(msg => {
                    const isMe = msg.sender.id === user?.id;
                    return (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        key={msg.id} 
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[75%] relative ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                          
                          {/* Holographic Bubble */}
                          <div className={`p-4 border ${
                            isMe 
                              ? 'bg-marvel-red/20 border-marvel-red shadow-[0_0_15px_rgba(226,54,54,0.3)]' 
                              : 'bg-marvel-blue/10 border-marvel-blue/50 shadow-[0_0_15px_rgba(81,140,202,0.2)]'
                          }`}>
                            {msg.mediaUrl && (
                              <div className="mb-3 border border-white/20 p-1 bg-black">
                                {msg.mediaType === 'IMAGE' && <img src={msg.mediaUrl} alt="Attachment" className="max-w-full h-auto grayscale hover:grayscale-0 transition-all" />}
                                {msg.mediaType === 'VIDEO' && <video src={msg.mediaUrl} controls className="max-w-full h-auto" />}
                                {msg.mediaType === 'AUDIO' && <audio src={msg.mediaUrl} controls className="w-full" />}
                              </div>
                            )}
                            {msg.content && (
                              <p className="text-sm font-sans tracking-wide text-white whitespace-pre-wrap leading-relaxed">
                                {msg.content}
                              </p>
                            )}
                          </div>

                          {/* Decorative HUD Details */}
                          <div className={`flex items-center gap-2 mt-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                            <span className="w-1 h-1 bg-white" />
                            <span className="w-8 h-[1px] bg-white/30" />
                            <span className="text-[9px] font-mono text-marvel-gold tracking-widest">
                              {formatTimeIST(msg.createdAt)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  {typingUsers[selectedRoom.id] && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-start">
                      <div className="bg-marvel-blue/10 border border-marvel-blue/50 p-3 shadow-[0_0_15px_rgba(81,140,202,0.2)] flex gap-2 items-center">
                        <ScanLine className="w-4 h-4 text-marvel-blue animate-pulse" />
                        <span className="text-[10px] font-mono text-marvel-blue uppercase tracking-[0.3em] animate-pulse">Transmitting...</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Attachment Preview */}
              {attachment && (
                <div className="p-4 border-t-2 border-marvel-red/50 bg-black">
                  <div className="relative inline-block border border-marvel-gold p-1">
                    {attachment.type === 'IMAGE' && <img src={attachment.url} alt="Preview" className="h-24 object-cover" />}
                    {attachment.type === 'VIDEO' && <video src={attachment.url} className="h-24" />}
                    {attachment.type === 'AUDIO' && <div className="h-10 px-6 bg-marvel-blue/20 text-marvel-blue font-mono text-xs flex items-center">AUDIO DATA LOADED</div>}
                    <button onClick={() => setAttachment(null)} className="absolute -top-3 -right-3 bg-marvel-red border border-white text-white p-1 hover:bg-white hover:text-marvel-red transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="p-4 border-t-2 flex items-end gap-3 border-marvel-red/50 bg-black/90 backdrop-blur-md relative z-20">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*,audio/*" />
                <button
                  type="button"
                  onClick={() => { playClick(); fileInputRef.current?.click(); }}
                  className="p-3 bg-white/5 border border-white/20 text-white hover:bg-marvel-gold hover:text-black hover:border-marvel-gold transition-all"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <textarea
                  value={newMessage}
                  onChange={handleInputChange}
                  placeholder="COMPOSE TRANSMISSION..."
                  className="flex-1 bg-black/50 border border-white/20 px-4 py-3 min-h-[50px] max-h-32 resize-none text-white font-mono text-sm placeholder:text-white/30 focus:outline-none focus:border-marvel-red focus:shadow-[inset_0_0_10px_rgba(226,54,54,0.3)] transition-all uppercase"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
                  }}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={isUploading || (!newMessage.trim() && !attachment)}
                  className="p-3 bg-marvel-red border border-marvel-red text-white hover:bg-white hover:text-marvel-red disabled:opacity-50 transition-all disabled:cursor-not-allowed shadow-[0_0_15px_rgba(226,54,54,0.4)]"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
              <div className="relative w-48 h-48 flex items-center justify-center mb-8">
                <motion.div className="absolute inset-0 border-[4px] border-marvel-blue/30 border-dashed rounded-full" animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} />
                <motion.div className="absolute inset-4 border-[2px] border-marvel-gold/50 border-dotted rounded-full" animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }} />
                <Cpu className="w-16 h-16 text-marvel-blue opacity-80" />
              </div>
              <h3 className="text-3xl font-sans font-black text-white uppercase tracking-[0.3em]">Standby Mode</h3>
              <p className="text-xs font-mono mt-4 text-marvel-blue tracking-widest uppercase">
                Awaiting channel selection.<br/>Initiate comms sequence.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
