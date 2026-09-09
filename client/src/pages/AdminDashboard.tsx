import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Plus, Trash2, Sparkles, X, Fingerprint, Database, Eye, Globe, Terminal, Activity, FileText } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Draw, DailyMessage } from '../types';
import { useSound } from '../context/SoundContext';

export const AdminDashboard: React.FC = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const { playClick, playNotification, playSuccess } = useSound();

  const [stats, setStats] = useState<any>(null);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [messages, setMessages] = useState<DailyMessage[]>([]);
  const [activeTab, setActiveTab] = useState<'STATS' | 'DRAWS' | 'MESSAGES'>('STATS');

  const [isDrawModalOpen, setIsDrawModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Draw form state
  const [newDraw, setNewDraw] = useState({
    title: '', description: '', type: 'MONTHLY',
    prizeTitle: '', prizeDescription: '', prizeImage: '', entryPriceINR: 99
  });

  // New Message form state
  const [newMessage, setNewMessage] = useState({ message: '', category: 'Romantic' });

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      addToast('UNAUTHORIZED ACCESS DETECTED', 'error');
      navigate('/login');
      return;
    }
    if (isAdmin) fetchAdminData();
  }, [authLoading, isAdmin]);

  const fetchAdminData = async () => {
    try {
      const [dashRes, drawsRes, msgRes] = await Promise.all([
        api.get('/admin/dashboard'), api.get('/draws'), api.get('/messages?limit=50')
      ]);
      if (dashRes.data.success) setStats(dashRes.data);
      if (drawsRes.data.success) setDraws(drawsRes.data.data);
      if (msgRes.data.success) setMessages(msgRes.data.data);
    } catch (error) {
      console.error('Comms error:', error);
    }
  };

  const handleCreateDraw = async (e: React.FormEvent) => {
    e.preventDefault();
    playClick();
    setSubmitting(true);
    try {
      const response = await api.post('/admin/draws', newDraw);
      if (response.data.success) {
        playSuccess();
        addToast('PROTOCOL INITIALIZED', 'success');
        setIsDrawModalOpen(false);
        fetchAdminData();
      }
    } catch (error: any) { addToast('INITIALIZATION FAILED', 'error'); } 
    finally { setSubmitting(false); }
  };

  const handleSelectWinner = async (drawId: string) => {
    playClick();
    if (!window.confirm('AUTHORIZE CRYPTOGRAPHIC ANOMALY RESOLUTION?')) return;
    try {
      const response = await api.post(`/admin/draws/${drawId}/select-winner`, { announcementNote: 'Anomaly resolved. Target acquired.' });
      if (response.data.success) {
        playNotification();
        addToast('TARGET SELECTED', 'success');
        fetchAdminData();
      }
    } catch (error: any) { addToast('RESOLUTION FAILED', 'error'); }
  };

  const handleCreateMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    playClick();
    setSubmitting(true);
    try {
      const response = await api.post('/admin/messages', newMessage);
      if (response.data.success) {
        playSuccess();
        addToast('DIRECTIVE INJECTED', 'success');
        setIsMessageModalOpen(false);
        fetchAdminData();
      }
    } catch (error: any) { addToast('INJECTION FAILED', 'error'); } 
    finally { setSubmitting(false); }
  };

  const handleDeleteMessage = async (id: string) => {
    playClick();
    if (!window.confirm('PURGE DIRECTIVE FROM DATABASE?')) return;
    try {
      await api.delete(`/admin/messages/${id}`);
      addToast('DIRECTIVE PURGED', 'info');
      fetchAdminData();
    } catch (error) { addToast('PURGE FAILED', 'error'); }
  };

  if (authLoading || !isAdmin) return <div className="h-screen bg-black" />;

  return (
    <div className="relative min-h-screen bg-slate-900 overflow-hidden pt-24 pb-20 selection:bg-marvel-blue/30 font-sans">
      
      {/* S.H.I.E.L.D Helicarrier Background Effects */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black" />
        {/* Radar overlay */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] border border-slate-700/50 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] border border-slate-700/30 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-slate-700/20 rounded-full" />
        <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-slate-700/30" />
        <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-slate-700/30" />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10 space-y-8">
        
        {/* Authorization Overlay Banner */}
        <div className="w-full bg-marvel-gold text-black text-center py-1 font-bold tracking-[0.5em] text-[10px] uppercase shadow-[0_0_15px_rgba(247,143,63,0.5)]">
          CLASSIFIED // AUTHORIZATION LEVEL: DIRECTOR
        </div>

        {/* Header HUD */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-800/80 backdrop-blur-md border border-slate-600 p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-marvel-blue/5 via-transparent to-transparent pointer-events-none" />
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 bg-slate-900 border-2 border-marvel-blue flex items-center justify-center text-marvel-blue shadow-[0_0_15px_rgba(81,140,202,0.3)]">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white uppercase tracking-[0.2em]">Command Center</h1>
              <div className="flex items-center gap-2 mt-1">
                <Fingerprint className="w-4 h-4 text-marvel-gold" />
                <p className="text-[10px] font-mono text-marvel-gold uppercase tracking-widest">
                  IDENT: {user?.email} [DIRECTOR]
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10">
            <button
              onClick={() => { playClick(); setIsDrawModalOpen(true); }}
              className="w-full sm:w-auto px-6 py-3 bg-marvel-blue/20 border border-marvel-blue text-marvel-blue font-bold text-[10px] uppercase tracking-widest hover:bg-marvel-blue hover:text-white transition-all shadow-[0_0_10px_rgba(81,140,202,0.3)] flex items-center gap-2"
            >
              <Activity className="w-4 h-4" />
              Initialize Anomaly Protocol
            </button>
            <button
              onClick={() => { playClick(); setIsMessageModalOpen(true); }}
              className="w-full sm:w-auto px-6 py-3 bg-slate-700/50 border border-slate-500 text-slate-300 font-bold text-[10px] uppercase tracking-widest hover:border-white hover:text-white transition-all flex items-center gap-2"
            >
              <Terminal className="w-4 h-4" />
              Inject Directive
            </button>
          </div>
        </div>

        {/* Tactical Navigation Tabs */}
        <div className="flex border-b border-slate-700">
          {(['STATS', 'DRAWS', 'MESSAGES'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { playClick(); setActiveTab(tab); }}
              className={`px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] transition-all flex items-center gap-2 border-b-2 ${
                activeTab === tab
                  ? 'border-marvel-blue text-marvel-blue bg-marvel-blue/10 shadow-[inset_0_-20px_20px_-20px_rgba(81,140,202,0.3)]'
                  : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              {tab === 'STATS' && <Globe className="w-4 h-4" />}
              {tab === 'DRAWS' && <Eye className="w-4 h-4" />}
              {tab === 'MESSAGES' && <FileText className="w-4 h-4" />}
              
              {tab === 'STATS' && 'Global Metrics'}
              {tab === 'DRAWS' && 'Anomaly Monitor'}
              {tab === 'MESSAGES' && 'Directive Database'}
            </button>
          ))}
        </div>

        {/* Tab 1: Global Metrics (Stats) */}
        {activeTab === 'STATS' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/80 border-l-4 border-marvel-blue p-5 shadow-lg">
                <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">Active Operatives</p>
                <p className="font-sans text-4xl font-black text-white mt-1">{stats.stats.totalUsers}</p>
              </div>
              <div className="bg-slate-800/80 border-l-4 border-marvel-red p-5 shadow-lg">
                <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">Active Anomalies</p>
                <p className="font-sans text-4xl font-black text-white mt-1">{stats.stats.activeDraws}</p>
              </div>
              <div className="bg-slate-800/80 border-l-4 border-slate-500 p-5 shadow-lg">
                <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">Resolved Anomalies</p>
                <p className="font-sans text-4xl font-black text-slate-300 mt-1">{stats.stats.completedDraws}</p>
              </div>
              <div className="bg-slate-800/80 border-l-4 border-green-500 p-5 shadow-lg">
                <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">Total Engagements</p>
                <p className="font-sans text-4xl font-black text-green-500 mt-1">{stats.stats.totalEntries}</p>
              </div>
            </div>

            {/* Tactical Audit Table */}
            <div className="bg-slate-800/80 border border-slate-700 shadow-xl">
              <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex items-center gap-2">
                <Database className="w-5 h-5 text-marvel-blue" />
                <h3 className="font-sans text-sm font-bold text-white uppercase tracking-widest">Recent Engagement Logs</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider border-b border-slate-700">
                    <tr>
                      <th className="p-4 font-medium">Operative</th>
                      <th className="p-4 font-medium">Anomaly Target</th>
                      <th className="p-4 font-medium">Clearance Code</th>
                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 font-medium">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {stats.recentEntries?.map((e: any) => (
                      <tr key={e.id} className="hover:bg-slate-700/50 transition-colors text-slate-300">
                        <td className="p-4 font-bold text-white">{e.user?.name}</td>
                        <td className="p-4 uppercase">{e.draw?.title}</td>
                        <td className="p-4 text-marvel-gold">{e.referenceCode}</td>
                        <td className="p-4">
                          <span className="px-2 py-1 bg-green-500/10 text-green-500 border border-green-500/30">
                            {e.paymentMode} OK
                          </span>
                        </td>
                        <td className="p-4">{new Date(e.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Anomaly Monitor (Draws) */}
        {activeTab === 'DRAWS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {draws.map((d) => (
              <div key={d.id} className="bg-slate-800/80 border border-slate-700 p-6 relative overflow-hidden group">
                <div className={`absolute top-0 right-0 w-32 h-32 blur-[40px] rounded-full pointer-events-none ${d.status === 'ACTIVE' ? 'bg-marvel-red/20' : 'bg-slate-500/20'}`} />
                
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <span className="text-[9px] font-bold uppercase text-white bg-slate-900 px-3 py-1 border border-slate-600 tracking-widest shadow-[2px_2px_0_0_rgba(0,0,0,0.5)]">
                    CLASS: {d.type} • SYS: {d.status}
                  </span>

                  {d.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleSelectWinner(d.id)}
                      className="px-4 py-2 bg-marvel-red/20 border border-marvel-red text-marvel-red hover:bg-marvel-red hover:text-white font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-[0_0_10px_rgba(226,54,54,0.3)] transition-colors"
                    >
                      <Activity className="w-3 h-3" /> Execute Resolution
                    </button>
                  )}
                </div>

                <div className="relative z-10 space-y-2">
                  <h3 className="font-sans text-2xl font-black text-white uppercase tracking-wider">{d.title}</h3>
                  <p className="text-[10px] font-mono text-slate-400 line-clamp-2 uppercase leading-relaxed">{d.description}</p>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-marvel-blue pt-4 mt-4 border-t border-slate-700 relative z-10">
                  <span>REQ FUNDS: ₹{d.entryPriceINR}</span>
                  <span>ENGAGED ENTITIES: {d.participantsCount || 0}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Directive Database (Messages) */}
        {activeTab === 'MESSAGES' && (
          <div className="bg-slate-800/80 border border-slate-700 shadow-xl">
             <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex items-center gap-2">
                <Database className="w-5 h-5 text-marvel-gold" />
                <h3 className="font-sans text-sm font-bold text-white uppercase tracking-widest">Global Directives Cache</h3>
              </div>
            <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider sticky top-0 border-b border-slate-700 z-10">
                  <tr>
                    <th className="p-4 font-medium">Category Code</th>
                    <th className="p-4 font-medium">Directive Payload</th>
                    <th className="p-4 font-medium">Execution Date</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {messages.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-700/50 transition-colors text-slate-300">
                      <td className="p-4 font-bold text-marvel-gold">{m.category}</td>
                      <td className="p-4 text-white uppercase tracking-wide max-w-md truncate">"{m.message}"</td>
                      <td className="p-4 text-slate-500">{m.usedDate || 'STANDBY'}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteMessage(m.id)}
                          className="p-2 border border-slate-600 text-slate-400 hover:text-marvel-red hover:border-marvel-red transition-colors"
                          title="Purge"
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

        {/* Modal: Initialize Anomaly Protocol (Create Draw) */}
        <AnimatePresence>
          {isDrawModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-2xl bg-slate-900 border border-marvel-blue p-8 shadow-[0_0_50px_rgba(81,140,202,0.2)] relative max-h-[90vh] overflow-y-auto custom-scrollbar"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-marvel-blue" />
                <button onClick={() => setIsDrawModalOpen(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white">
                  <X className="w-6 h-6" />
                </button>

                <h3 className="text-2xl font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                  <Activity className="w-6 h-6 text-marvel-blue animate-pulse" />
                  Initialize Anomaly Protocol
                </h3>

                <form onSubmit={handleCreateDraw} className="space-y-4 font-mono text-[10px] uppercase">
                  <div className="space-y-1">
                    <label className="text-marvel-blue tracking-widest">Protocol Designation (Title)</label>
                    <input
                      type="text" required value={newDraw.title} onChange={(e) => setNewDraw({ ...newDraw, title: e.target.value })}
                      className="w-full p-3 bg-black border border-slate-700 text-white focus:outline-none focus:border-marvel-blue"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-marvel-blue tracking-widest">Operation Parameters (Desc)</label>
                    <textarea
                      required value={newDraw.description} onChange={(e) => setNewDraw({ ...newDraw, description: e.target.value })}
                      className="w-full p-3 bg-black border border-slate-700 text-white focus:outline-none focus:border-marvel-blue h-20 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-marvel-blue tracking-widest">Classification Level</label>
                      <select
                        value={newDraw.type} onChange={(e) => setNewDraw({ ...newDraw, type: e.target.value })}
                        className="w-full p-3 bg-black border border-slate-700 text-white focus:outline-none focus:border-marvel-blue"
                      >
                        <option value="WEEKLY">WEEKLY</option>
                        <option value="MONTHLY">MONTHLY</option>
                        <option value="SPECIAL">SPECIAL</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-marvel-blue tracking-widest">Required Clearance (INR)</label>
                      <input
                        type="number" required value={newDraw.entryPriceINR} onChange={(e) => setNewDraw({ ...newDraw, entryPriceINR: Number(e.target.value) })}
                        className="w-full p-3 bg-black border border-slate-700 text-white focus:outline-none focus:border-marvel-blue"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-marvel-blue tracking-widest">Target Artifact (Prize)</label>
                    <input
                      type="text" required value={newDraw.prizeTitle} onChange={(e) => setNewDraw({ ...newDraw, prizeTitle: e.target.value })}
                      className="w-full p-3 bg-black border border-slate-700 text-white focus:outline-none focus:border-marvel-blue"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-marvel-blue tracking-widest">Visual Telemetry URL (Image)</label>
                    <input
                      type="url" required value={newDraw.prizeImage} onChange={(e) => setNewDraw({ ...newDraw, prizeImage: e.target.value })}
                      className="w-full p-3 bg-black border border-slate-700 text-white focus:outline-none focus:border-marvel-blue"
                    />
                  </div>

                  <button
                    type="submit" disabled={submitting}
                    className="w-full py-4 bg-marvel-blue/20 border border-marvel-blue text-marvel-blue font-bold text-xs uppercase tracking-[0.3em] hover:bg-marvel-blue hover:text-black transition-all mt-4"
                  >
                    {submitting ? 'EXECUTING...' : 'EXECUTE PROTOCOL'}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal: Inject Directive (Add Message) */}
        <AnimatePresence>
          {isMessageModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-md bg-slate-900 border border-slate-500 p-8 shadow-[0_0_50px_rgba(255,255,255,0.1)] relative"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-slate-500" />
                <button onClick={() => setIsMessageModalOpen(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white">
                  <X className="w-6 h-6" />
                </button>

                <h3 className="text-2xl font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                  <Terminal className="w-6 h-6 text-slate-400" />
                  Inject Directive
                </h3>

                <form onSubmit={handleCreateMessage} className="space-y-4 font-mono text-[10px] uppercase">
                  <div className="space-y-1">
                    <label className="text-slate-400 tracking-widest">Directive Category</label>
                    <input
                      type="text" required value={newMessage.category} onChange={(e) => setNewMessage({ ...newMessage, category: e.target.value })}
                      className="w-full p-3 bg-black border border-slate-700 text-white focus:outline-none focus:border-slate-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 tracking-widest">Payload (Message Quote)</label>
                    <textarea
                      required value={newMessage.message} onChange={(e) => setNewMessage({ ...newMessage, message: e.target.value })}
                      className="w-full p-3 bg-black border border-slate-700 text-white focus:outline-none focus:border-slate-500 h-24 resize-none"
                    />
                  </div>

                  <button
                    type="submit" disabled={submitting}
                    className="w-full py-4 bg-slate-800 border border-slate-500 text-white font-bold text-xs uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all mt-4"
                  >
                    {submitting ? 'UPLOADING...' : 'COMMIT TO DATABASE'}
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

export default AdminDashboard;
