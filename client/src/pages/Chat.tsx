import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Image as ImageIcon, Video, Mic, Paperclip, X, Heart, User as UserIcon } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

interface User {
  id: string;
  name: string;
  avatarUrl: string;
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
}

export const Chat: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [attachment, setAttachment] = useState<{ url: string, type: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { user } = useAuth();
  const { showToast } = useToast();
  const { theme } = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers(searchQuery);
    }, 500);

    return () => {
      clearTimeout(delayDebounceFn);
      stopPolling();
    };
  }, [searchQuery]);

  useEffect(() => {
    if (selectedRoom) {
      fetchMessages(selectedRoom.id);
      startPolling(selectedRoom.id);
    } else {
      stopPolling();
    }
  }, [selectedRoom]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchUsers = async (query = '') => {
    try {
      const res = await api.get(`/chat/users${query ? `?search=${encodeURIComponent(query)}` : ''}`);
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };

  const startChat = async (partnerId: string) => {
    try {
      const res = await api.post('/chat/rooms', { partnerId });
      if (res.data.success) {
        setSelectedRoom(res.data.data);
      }
    } catch (error) {
      showToast('Failed to start chat', 'error');
    }
  };

  const fetchMessages = async (roomId: string) => {
    try {
      const res = await api.get(`/chat/rooms/${roomId}/messages`);
      if (res.data.success) {
        setMessages(res.data.data);
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      console.error('Failed to fetch messages', error);
    }
  };

  const startPolling = (roomId: string) => {
    stopPolling();
    pollIntervalRef.current = setInterval(() => {
      fetchMessages(roomId);
    }, 3000);
  };

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('File size must be less than 5MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      let type = 'IMAGE';
      if (file.type.startsWith('video/')) type = 'VIDEO';
      if (file.type.startsWith('audio/')) type = 'AUDIO';
      
      setAttachment({ url: base64String, type });
    };
    reader.readAsDataURL(file);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !attachment) || !selectedRoom) return;

    setIsUploading(true);
    try {
      const res = await api.post(`/chat/rooms/${selectedRoom.id}/messages`, {
        content: newMessage.trim() || null,
        mediaUrl: attachment?.url || null,
        mediaType: attachment?.type || null
      });

      if (res.data.success) {
        setMessages([...messages, res.data.data]);
        setNewMessage('');
        setAttachment(null);
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      showToast('Failed to send message', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const getPartner = (room: ChatRoom) => {
    return room.participants.find(p => p.user.id !== user?.id)?.user;
  };

  return (
    <div className="pt-24 pb-8 max-w-6xl mx-auto px-4 h-screen flex flex-col">
      <div className="flex-1 flex overflow-hidden rounded-3xl shadow-2xl bg-white border-rose-200 dark:glass-panel dark:border-rose-400/30">
        
        {/* Sidebar - Users */}
        <div className="w-1/3 border-r flex flex-col border-rose-100 dark:border-rose-400/30">
          <div className="p-4 border-b border-rose-100 dark:border-rose-400/30 space-y-4">
            <h2 className="font-serif text-xl font-bold text-slate-800 dark:text-white">
              Conversations
            </h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by phone number or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 text-sm rounded-full bg-slate-100 dark:bg-plum-900/50 border border-slate-200 dark:border-rose-400/20 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400/50"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {users.map(u => (
              <button
                key={u.id}
                onClick={() => startChat(u.id)}
                className="w-full flex items-center gap-3 p-3 rounded-2xl transition-all hover:bg-rose-50 text-slate-700 dark:hover:bg-rose-500/10 dark:text-white"
              >
                <img src={u.avatarUrl} alt={u.name} className="w-10 h-10 rounded-full bg-slate-200" />
                <span className="font-medium text-sm">{u.name}</span>
              </button>
            ))}
            {users.length === 0 && (
              <p className="text-center text-xs text-slate-500 mt-10">No other users registered yet.</p>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="w-2/3 flex flex-col bg-opacity-50 relative">
          {selectedRoom ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center gap-3 border-rose-100 bg-rose-50 dark:border-rose-400/30 dark:bg-plum-900/50">
                <img src={getPartner(selectedRoom)?.avatarUrl} alt="Partner" className="w-10 h-10 rounded-full bg-white" />
                <h3 className="font-serif font-bold text-slate-800 dark:text-white">
                  {getPartner(selectedRoom)?.name}
                </h3>
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(msg => {
                  const isMe = msg.sender.id === user?.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl p-3 ${
                        isMe 
                          ? 'bg-rose-500 text-white rounded-tr-sm' 
                          : 'bg-slate-100 text-slate-800 rounded-tl-sm dark:bg-plum-800 dark:text-white'
                      }`}>
                        {msg.mediaUrl && (
                          <div className="mb-2 rounded-xl overflow-hidden">
                            {msg.mediaType === 'IMAGE' && <img src={msg.mediaUrl} alt="Attachment" className="max-w-full h-auto" />}
                            {msg.mediaType === 'VIDEO' && <video src={msg.mediaUrl} controls className="max-w-full h-auto" />}
                            {msg.mediaType === 'AUDIO' && <audio src={msg.mediaUrl} controls className="w-full" />}
                          </div>
                        )}
                        {msg.content && <p className="text-sm whitespace-pre-wrap">{msg.content}</p>}
                        <span className="text-[10px] opacity-70 mt-1 block text-right">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Attachment Preview */}
              {attachment && (
                <div className="p-3 border-t border-rose-100 bg-white dark:border-rose-400/30 dark:bg-plum-900/80">
                  <div className="relative inline-block">
                    {attachment.type === 'IMAGE' && <img src={attachment.url} alt="Preview" className="h-20 rounded-lg" />}
                    {attachment.type === 'VIDEO' && <video src={attachment.url} className="h-20 rounded-lg" />}
                    {attachment.type === 'AUDIO' && <div className="h-10 px-4 bg-slate-200 rounded-lg flex items-center text-xs text-slate-800">Audio attached</div>}
                    <button onClick={() => setAttachment(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Input Area */}
              <form onSubmit={sendMessage} className="p-3 border-t flex items-end gap-2 border-rose-100 bg-rose-50 dark:border-rose-400/30 dark:bg-plum-900/50">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/*,video/*,audio/*"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 rounded-full transition-colors bg-white text-rose-500 hover:bg-slate-100 shadow-sm dark:bg-plum-800 dark:text-rose-300 dark:hover:bg-plum-700"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-2xl px-4 py-3 min-h-[44px] max-h-32 resize-none focus:outline-none bg-white border border-rose-200 text-slate-800 dark:bg-plum-800 dark:text-white dark:placeholder-blush-300/50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(e);
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={isUploading || (!newMessage.trim() && !attachment)}
                  className="p-3 rounded-full bg-rose-500 text-white shadow-md hover:bg-rose-600 disabled:opacity-50 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
              <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-10 h-10 text-rose-500 fill-rose-500 opacity-50" />
              </div>
              <h3 className="text-xl font-serif font-bold text-slate-700 dark:text-white">Your Private Space</h3>
              <p className="text-sm mt-2 max-w-sm text-slate-500 dark:text-blush-200">
                Select a user from the sidebar to start sharing memories, photos, videos, and sweet messages securely.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
