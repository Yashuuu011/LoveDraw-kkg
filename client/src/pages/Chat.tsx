import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Paperclip, X, Heart, MessageCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useSocket } from '../context/SocketContext';
import { useLocation } from 'react-router-dom';
import { formatTimeIST, formatDateIST } from '../utils/dateFormatter';

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

  const { user } = useAuth();
  const { addToast } = useToast();
  const { socket } = useSocket();
  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (rooms.length > 0 && location.state?.roomId) {
      const targetRoom = rooms.find(r => r.id === location.state.roomId);
      if (targetRoom) {
        setSelectedRoom(targetRoom);
      }
    }
  }, [rooms, location.state]);

  useEffect(() => {
    if (selectedRoom) {
      fetchMessages(selectedRoom.id);
      if (socket) {
        socket.emit('join_room', selectedRoom.id);
      }
    }
  }, [selectedRoom, socket]);

  useEffect(() => {
    if (!socket) return;

    socket.on('new_message', (message: ChatMessage) => {
      // Append if it belongs to current room
      if (selectedRoom && message.sender.id !== user?.id) {
        setMessages(prev => [...prev, message]);
        setTimeout(scrollToBottom, 100);
      }
      // Update room list
      fetchRooms(); 
    });

    socket.on('typing', ({ userId, roomId }) => {
      if (userId !== user?.id) {
        setTypingUsers(prev => ({ ...prev, [roomId]: userId }));
      }
    });

    socket.on('stop_typing', ({ userId, roomId }) => {
      setTypingUsers(prev => {
        const next = { ...prev };
        delete next[roomId];
        return next;
      });
    });

    socket.on('user_online', ({ userId }) => {
      updateUserStatus(userId, true);
    });

    socket.on('user_offline', ({ userId, lastSeen }) => {
      updateUserStatus(userId, false, lastSeen);
    });

    return () => {
      socket.off('new_message');
      socket.off('typing');
      socket.off('stop_typing');
      socket.off('user_online');
      socket.off('user_offline');
    };
  }, [socket, selectedRoom, user]);

  const updateUserStatus = (userId: string, isOnline: boolean, lastSeen?: string) => {
    setRooms(prevRooms => prevRooms.map(room => ({
      ...room,
      participants: room.participants.map(p => 
        p.user.id === userId 
          ? { ...p, user: { ...p.user, isOnline, lastSeen } } 
          : p
      )
    })));
    if (selectedRoom) {
      setSelectedRoom(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          participants: prev.participants.map(p => 
            p.user.id === userId 
              ? { ...p, user: { ...p.user, isOnline, lastSeen } } 
              : p
          )
        };
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchRooms = async () => {
    try {
      const res = await api.get('/chat/rooms');
      if (res.data.success) {
        setRooms(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch rooms', error);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      addToast('File size must be less than 5MB', 'error');
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

    if (socket) {
      socket.emit('stop_typing', { roomId: selectedRoom.id, receiverId: getPartner(selectedRoom)?.id });
    }

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
        fetchRooms();
      }
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to send message', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const getPartner = (room: ChatRoom) => {
    return room.participants.find(p => p.user.id !== user?.id)?.user;
  };

  return (
    <div className="pt-24 pb-8 max-w-6xl mx-auto px-4 h-screen flex flex-col">
      <div className="flex-1 flex overflow-hidden rounded-3xl shadow-2xl bg-card border border-border">
        
        {/* Sidebar - Rooms */}
        <div className="w-1/3 border-r flex flex-col border-border bg-background-secondary">
          <div className="p-4 border-b border-border bg-card">
            <h2 className="font-serif text-xl font-bold text-text-primary flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" /> Messages
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {rooms.map(room => {
              const partner = getPartner(room);
              const lastMessage = room.messages?.[0];
              return (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${selectedRoom?.id === room.id ? 'bg-border' : 'hover:bg-border/50'}`}
                >
                  <div className="relative">
                    <img src={partner?.avatarUrl || '/default-avatar.png'} alt={partner?.name} className="w-12 h-12 rounded-full bg-background object-cover" />
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${partner?.isOnline ? 'bg-emerald-500' : 'bg-text-muted'}`}></div>
                  </div>
                  <div className="flex-1 text-left overflow-hidden">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-text-primary truncate">{partner?.name}</span>
                      {lastMessage && (
                        <span className="text-[10px] text-text-muted">
                          {new Date(lastMessage.createdAt).toLocaleDateString() === new Date().toLocaleDateString() 
                            ? formatTimeIST(lastMessage.createdAt)
                            : formatDateIST(lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    {lastMessage ? (
                      <p className="text-xs text-text-secondary truncate mt-0.5">
                        {lastMessage.sender.id === user?.id ? 'You: ' : ''}
                        {lastMessage.content || (lastMessage.mediaUrl ? 'Attachment' : '')}
                      </p>
                    ) : (
                      <p className="text-xs text-primary italic mt-0.5">Say hi! ❤️</p>
                    )}
                  </div>
                </button>
              );
            })}
            {rooms.length === 0 && (
              <p className="text-center text-sm text-text-muted mt-10 p-4">No active conversations. Head to the Friends page to start a chat!</p>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="w-2/3 flex flex-col bg-background relative">
          {selectedRoom ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center justify-between border-border bg-card/80 backdrop-blur-md z-10">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img src={getPartner(selectedRoom)?.avatarUrl || '/default-avatar.png'} alt="Partner" className="w-10 h-10 rounded-full bg-card object-cover" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-text-primary leading-tight">
                      {getPartner(selectedRoom)?.name}
                    </h3>
                    <p className="text-xs text-text-secondary">
                      {getPartner(selectedRoom)?.isOnline ? (
                        <span className="text-emerald-500 font-medium">Online</span>
                      ) : getPartner(selectedRoom)?.lastSeen ? (
                        `Last seen ${formatTimeIST(getPartner(selectedRoom)!.lastSeen!)}`
                      ) : 'Offline'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(msg => {
                  const isMe = msg.sender.id === user?.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl p-3 shadow-sm ${
                        isMe 
                          // The specific dark mode and light mode colors requested for Sent
                          ? 'bg-primary dark:bg-[#C92F5C] text-white rounded-tr-sm' 
                          // The specific dark mode and light mode colors requested for Received
                          : 'bg-card dark:bg-card-elevated text-text-primary rounded-tl-sm border border-border'
                      }`}>
                        {msg.mediaUrl && (
                          <div className="mb-2 rounded-xl overflow-hidden">
                            {msg.mediaType === 'IMAGE' && <img src={msg.mediaUrl} alt="Attachment" className="max-w-full h-auto" />}
                            {msg.mediaType === 'VIDEO' && <video src={msg.mediaUrl} controls className="max-w-full h-auto" />}
                            {msg.mediaType === 'AUDIO' && <audio src={msg.mediaUrl} controls className="w-full" />}
                          </div>
                        )}
                        {msg.content && <p className="text-[15px] whitespace-pre-wrap leading-relaxed">{msg.content}</p>}
                        <span className={`text-[10px] mt-1 block text-right ${isMe ? 'text-white/70' : 'text-text-muted'}`}>
                          {formatTimeIST(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {typingUsers[selectedRoom.id] && (
                  <div className="flex justify-start">
                    <div className="bg-card dark:bg-card-elevated border border-border rounded-2xl rounded-tl-sm p-3 shadow-sm flex gap-1 items-center">
                      <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Attachment Preview */}
              {attachment && (
                <div className="p-3 border-t border-border bg-card">
                  <div className="relative inline-block">
                    {attachment.type === 'IMAGE' && <img src={attachment.url} alt="Preview" className="h-20 rounded-lg shadow-sm" />}
                    {attachment.type === 'VIDEO' && <video src={attachment.url} className="h-20 rounded-lg shadow-sm" />}
                    {attachment.type === 'AUDIO' && <div className="h-10 px-4 bg-background-secondary rounded-lg flex items-center text-xs text-text-primary">Audio attached</div>}
                    <button onClick={() => setAttachment(null)} className="absolute -top-2 -right-2 bg-primary text-white rounded-full p-1 shadow-md hover:brightness-110 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="p-3 border-t flex items-end gap-2 border-border bg-card/80 backdrop-blur-md">
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
                  className="p-3 rounded-full transition-colors text-text-muted hover:text-primary hover:bg-background-secondary"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <textarea
                  value={newMessage}
                  onChange={handleInputChange}
                  placeholder="Type a message..."
                  className="flex-1 rounded-2xl px-4 py-3 min-h-[48px] max-h-32 resize-none focus:outline-none bg-background border border-border text-text-primary placeholder:text-text-muted focus:border-primary transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={isUploading || (!newMessage.trim() && !attachment)}
                  className="p-3 rounded-full bg-gradient-to-r from-primary to-accent text-white shadow-md hover:brightness-110 disabled:opacity-50 transition-colors disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
              <div className="w-24 h-24 bg-background-secondary rounded-full flex items-center justify-center mb-6 shadow-inner border border-border">
                <Heart className="w-12 h-12 text-primary fill-primary opacity-60" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-text-primary">Your Private Space</h3>
              <p className="text-sm mt-3 max-w-sm text-text-secondary leading-relaxed">
                Select a friend from the sidebar to start sharing memories, photos, and sweet messages securely.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
