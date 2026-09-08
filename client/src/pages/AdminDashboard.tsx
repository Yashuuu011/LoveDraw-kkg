import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Users, Trophy, Gift, Plus, Edit, Trash2, Sparkles, CheckCircle2, Lock, X } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Draw, DailyMessage } from '../types';

export const AdminDashboard: React.FC = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [stats, setStats] = useState<any>(null);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [messages, setMessages] = useState<DailyMessage[]>([]);
  const [activeTab, setActiveTab] = useState<'STATS' | 'DRAWS' | 'MESSAGES'>('STATS');

  const [isDrawModalOpen, setIsDrawModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Draw form state
  const [newDraw, setNewDraw] = useState({
    title: '',
    description: '',
    type: 'MONTHLY',
    prizeTitle: '',
    prizeDescription: '',
    prizeImage: '',
    entryPriceINR: 99
  });

  // New Message form state
  const [newMessage, setNewMessage] = useState({
    message: '',
    category: 'Romantic'
  });

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      showToast('Admin privileges required.', 'error');
      navigate('/login');
      return;
    }
    if (isAdmin) {
      fetchAdminData();
    }
  }, [authLoading, isAdmin]);

  const fetchAdminData = async () => {
    try {
      const [dashRes, drawsRes, msgRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/draws'),
        api.get('/messages?limit=50')
      ]);

      if (dashRes.data.success) setStats(dashRes.data);
      if (drawsRes.data.success) setDraws(drawsRes.data.data);
      if (msgRes.data.success) setMessages(msgRes.data.data);
    } catch (error) {
      console.error('Error loading admin dashboard:', error);
    }
  };

  const handleCreateDraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await api.post('/admin/draws', newDraw);
      if (response.data.success) {
        showToast('New draw created successfully! ❤️', 'love');
        setIsDrawModalOpen(false);
        fetchAdminData();
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to create draw.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectWinner = async (drawId: string) => {
    if (!window.confirm('Are you sure you want to run the server-side cryptographically fair winner draw?')) return;

    try {
      const response = await api.post(`/admin/draws/${drawId}/select-winner`, {
        announcementNote: 'Congratulations to our lucky winner! ❤️'
      });
      if (response.data.success) {
        showToast('Winner selected fair and square! 🎉', 'love');
        fetchAdminData();
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Error selecting winner.', 'error');
    }
  };

  const handleCreateMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await api.post('/admin/messages', newMessage);
      if (response.data.success) {
        showToast('Daily message added! 💌', 'love');
        setIsMessageModalOpen(false);
        fetchAdminData();
      }
    } catch (error: any) {
      showToast('Failed to add message.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await api.delete(`/admin/messages/${id}`);
      showToast('Message deleted.', 'info');
      fetchAdminData();
    } catch (error) {
      showToast('Failed to delete message.', 'error');
    }
  };

  return (
    <div className="pt-28 pb-20 max-w-6xl mx-auto px-4 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-gold-400/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gold-500/20 border border-gold-400/30 flex items-center justify-center text-gold-400">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-white">Admin Management Portal</h1>
            <p className="text-xs text-gold-300">Signed in as {user?.email} (SUPER_ADMIN)</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDrawModalOpen(true)}
            className="px-4 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Draw</span>
          </button>
          <button
            onClick={() => setIsMessageModalOpen(true)}
            className="px-4 py-2.5 rounded-full glass-card hover:border-rose-400/40 text-blush-100 font-semibold text-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-gold-400" />
            <span>Add Love Message</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="p-1.5 rounded-full glass-panel border border-rose-400/30 inline-flex gap-2">
          {(['STATS', 'DRAWS', 'MESSAGES'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-rose-500 to-burgundy-600 text-white shadow-lg'
                  : 'text-blush-200 hover:text-white'
              }`}
            >
              {tab === 'STATS' && 'Overview Metrics'}
              {tab === 'DRAWS' && 'Draws Management'}
              {tab === 'MESSAGES' && 'Daily Messages Table'}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Stats Metrics */}
      {activeTab === 'STATS' && stats && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="glass-card rounded-2xl p-5 border border-rose-400/20 space-y-1">
              <p className="text-xs text-blush-300 font-semibold uppercase">Total Registered Users</p>
              <p className="font-serif text-3xl font-bold text-white">{stats.stats.totalUsers}</p>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-rose-400/20 space-y-1">
              <p className="text-xs text-rose-300 font-semibold uppercase">Active Draws</p>
              <p className="font-serif text-3xl font-bold text-rose-400">{stats.stats.activeDraws}</p>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-rose-400/20 space-y-1">
              <p className="text-xs text-gold-300 font-semibold uppercase">Completed Draws</p>
              <p className="font-serif text-3xl font-bold text-gold-300">{stats.stats.completedDraws}</p>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-rose-400/20 space-y-1">
              <p className="text-xs text-emerald-300 font-semibold uppercase">Total Demo Entries</p>
              <p className="font-serif text-3xl font-bold text-emerald-400">{stats.stats.totalEntries}</p>
            </div>
          </div>

          {/* Recent Entries Audit Table */}
          <div className="glass-panel rounded-3xl p-6 border border-rose-400/20 space-y-4">
            <h3 className="font-serif text-lg font-bold text-white">Recent Entry Logs</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-blush-200">
                <thead className="bg-plum-900/60 text-gold-300 font-semibold uppercase">
                  <tr>
                    <th className="p-3">User</th>
                    <th className="p-3">Draw</th>
                    <th className="p-3">Reference Code</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-500/10">
                  {stats.recentEntries?.map((e: any) => (
                    <tr key={e.id}>
                      <td className="p-3 font-semibold text-white">{e.user?.name}</td>
                      <td className="p-3">{e.draw?.title}</td>
                      <td className="p-3 font-mono text-gold-300">{e.referenceCode}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold">
                          {e.paymentMode}
                        </span>
                      </td>
                      <td className="p-3">{new Date(e.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Draws Management */}
      {activeTab === 'DRAWS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {draws.map((d) => (
              <div key={d.id} className="glass-card rounded-2xl p-6 border border-rose-400/20 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-gold-300 bg-gold-500/10 px-2.5 py-1 rounded-full">
                    {d.type} • Status: {d.status}
                  </span>

                  {d.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleSelectWinner(d.id)}
                      className="px-3 py-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-burgundy-950 font-bold text-xs flex items-center gap-1 shadow-lg"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Select Winner Now
                    </button>
                  )}
                </div>

                <div>
                  <h3 className="font-serif text-xl font-bold text-white">{d.title}</h3>
                  <p className="text-xs text-blush-200 line-clamp-2 mt-1">{d.description}</p>
                </div>

                <div className="flex items-center justify-between text-xs text-blush-300 pt-2 border-t border-rose-500/20">
                  <span>Price: ₹{d.entryPriceINR}</span>
                  <span>Entries: {d.participantsCount || 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Daily Messages Table */}
      {activeTab === 'MESSAGES' && (
        <div className="glass-panel rounded-3xl p-6 border border-rose-400/20 space-y-4">
          <h3 className="font-serif text-lg font-bold text-white">Daily Messages Archive</h3>
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-left text-xs text-blush-200">
              <thead className="bg-plum-900/60 text-gold-300 font-semibold uppercase sticky top-0">
                <tr>
                  <th className="p-3">Category</th>
                  <th className="p-3">Message Quote</th>
                  <th className="p-3">Used Date</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-500/10">
                {messages.map((m) => (
                  <tr key={m.id}>
                    <td className="p-3 font-semibold text-rose-300">{m.category}</td>
                    <td className="p-3 font-serif italic text-white max-w-md">"{m.message}"</td>
                    <td className="p-3 text-blush-300">{m.usedDate || 'Unused'}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeleteMessage(m.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Create Draw */}
      <AnimatePresence>
        {isDrawModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-plum-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-lg glass-panel rounded-3xl p-6 border border-rose-400/30 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsDrawModalOpen(false)}
                className="absolute top-4 right-4 text-blush-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-serif text-2xl font-bold rose-gradient-text">Create New Draw</h3>

              <form onSubmit={handleCreateDraw} className="space-y-3 text-xs">
                <div>
                  <label className="text-blush-200">Draw Title</label>
                  <input
                    type="text"
                    required
                    value={newDraw.title}
                    onChange={(e) => setNewDraw({ ...newDraw, title: e.target.value })}
                    placeholder="October Romance Draw ❤️"
                    className="w-full p-2.5 rounded-xl glass-card text-white border border-rose-400/20"
                  />
                </div>

                <div>
                  <label className="text-blush-200">Description</label>
                  <textarea
                    required
                    value={newDraw.description}
                    onChange={(e) => setNewDraw({ ...newDraw, description: e.target.value })}
                    placeholder="Explain the draw..."
                    className="w-full p-2.5 rounded-xl glass-card text-white border border-rose-400/20 h-20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-blush-200">Draw Type</label>
                    <select
                      value={newDraw.type}
                      onChange={(e) => setNewDraw({ ...newDraw, type: e.target.value })}
                      className="w-full p-2.5 rounded-xl glass-card text-white border border-rose-400/20 bg-plum-900"
                    >
                      <option value="WEEKLY">WEEKLY</option>
                      <option value="MONTHLY">MONTHLY</option>
                      <option value="SPECIAL">SPECIAL</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-blush-200">Entry Price (INR)</label>
                    <input
                      type="number"
                      required
                      value={newDraw.entryPriceINR}
                      onChange={(e) => setNewDraw({ ...newDraw, entryPriceINR: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl glass-card text-white border border-rose-400/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-blush-200">Prize Title</label>
                  <input
                    type="text"
                    required
                    value={newDraw.prizeTitle}
                    onChange={(e) => setNewDraw({ ...newDraw, prizeTitle: e.target.value })}
                    placeholder="Luxury Candlelit Dinner Voucher"
                    className="w-full p-2.5 rounded-xl glass-card text-white border border-rose-400/20"
                  />
                </div>

                <div>
                  <label className="text-blush-200">Prize Image URL (Unsplash/Cloudinary)</label>
                  <input
                    type="url"
                    required
                    value={newDraw.prizeImage}
                    onChange={(e) => setNewDraw({ ...newDraw, prizeImage: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full p-2.5 rounded-xl glass-card text-white border border-rose-400/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-lg mt-2"
                >
                  {submitting ? 'Creating...' : 'Publish Romantic Draw'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Add Message */}
      <AnimatePresence>
        {isMessageModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-plum-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-md glass-panel rounded-3xl p-6 border border-rose-400/30 shadow-2xl space-y-4"
            >
              <button
                onClick={() => setIsMessageModalOpen(false)}
                className="absolute top-4 right-4 text-blush-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-serif text-2xl font-bold rose-gradient-text">Add Daily Love Note</h3>

              <form onSubmit={handleCreateMessage} className="space-y-3 text-xs">
                <div>
                  <label className="text-blush-200">Category</label>
                  <input
                    type="text"
                    required
                    value={newMessage.category}
                    onChange={(e) => setNewMessage({ ...newMessage, category: e.target.value })}
                    placeholder="Romantic, Cute, Good morning..."
                    className="w-full p-2.5 rounded-xl glass-card text-white border border-rose-400/20"
                  />
                </div>

                <div>
                  <label className="text-blush-200">Message Quote</label>
                  <textarea
                    required
                    value={newMessage.message}
                    onChange={(e) => setNewMessage({ ...newMessage, message: e.target.value })}
                    placeholder="Enter unique quote..."
                    className="w-full p-2.5 rounded-xl glass-card text-white border border-rose-400/20 h-24"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-lg mt-2"
                >
                  {submitting ? 'Saving...' : 'Save Love Message'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
