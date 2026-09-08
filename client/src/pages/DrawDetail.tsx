import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Sparkles, Calendar, Users, Gift, ShieldCheck, CheckCircle2, QrCode, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import { Draw, Entry } from '../types';
import CountdownTimer from '../components/CountdownTimer';
import PaymentQRModal from '../components/PaymentQRModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const DrawDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [draw, setDraw] = useState<Draw | null>(null);
  const [entry, setEntry] = useState<Entry | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDrawDetail();
  }, [id]);

  const fetchDrawDetail = async () => {
    try {
      const response = await api.get(`/draws/${id}`);
      if (response.data.success) {
        setDraw(response.data.data);
        if (response.data.data.userEntry) {
          setEntry(response.data.data.userEntry);
        }
      }
    } catch (error) {
      console.error('Error fetching draw details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinDraw = async () => {
    if (!isAuthenticated) {
      showToast('Please log in or register to join the draw!', 'info');
      navigate('/login');
      return;
    }

    if (entry) {
      setIsQrModalOpen(true);
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post(`/draws/${id}/entry`);
      if (response.data.success) {
        setEntry(response.data.data);
        setIsQrModalOpen(true);
        showToast('Demo entry reference generated! View QR code below. ❤️', 'love');
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to enter draw.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-32 pb-20 text-center">
        <p className="text-rose-500 dark:text-rose-300 font-serif italic text-lg animate-pulse">
          Sending a little love your way... 💕
        </p>
      </div>
    );
  }

  if (!draw) {
    return (
      <div className="pt-32 pb-20 max-w-md mx-auto text-center px-4">
        <div className="bg-white/80 dark:glass-card rounded-3xl p-8 space-y-4 border border-slate-200 dark:border-rose-400/20 shadow-md">
          <p className="text-xl font-serif text-slate-800 dark:text-white">Draw not found. ❤️</p>
          <Link to="/draws" className="text-sm font-semibold text-rose-500 hover:text-rose-600 dark:text-rose-300 dark:hover:text-white">
            Return to Draws List
          </Link>
        </div>
      </div>
    );
  }

  const isCompleted = draw.status === 'COMPLETED';

  return (
    <div className="pt-28 pb-20 max-w-5xl mx-auto px-4 space-y-12">
      {/* Back button */}
      <Link
        to="/draws"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 dark:text-blush-200 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to all draws
      </Link>

      {/* Main Grid Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Prize Photo Card */}
        <div className="lg:col-span-7 space-y-6">
          <div className="relative aspect-[16/11] rounded-3xl overflow-hidden glass-card border border-rose-400/30 shadow-2xl">
            <img
              src={draw.prizeImage}
              alt={draw.prizeTitle}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-plum-950 via-transparent to-transparent opacity-60" />

            <div className="absolute top-4 left-4">
              <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-burgundy-900/90 text-gold-300 border border-gold-400/40 shadow-lg">
                {draw.type} DRAW
              </span>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-white/50 dark:bg-plum-950/40 backdrop-blur-sm rounded-3xl p-8 border border-slate-200 dark:border-rose-400/20 space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/80 dark:glass-card border border-slate-200 dark:border-rose-400/20 flex flex-col gap-1 shadow-sm">
                  <span className="text-xs text-gold-500 dark:text-gold-300 uppercase tracking-widest font-semibold flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    Max Entries
                  </span>
                  <span className="font-serif font-bold text-slate-900 dark:text-white">
                    {draw.maxEntries}
                  </span>
                </div>
            </div>
            <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Gift className="w-5 h-5 text-gold-500 dark:text-gold-400" />
              About the Prize
            </h3>
            <p className="text-sm text-slate-600 dark:text-blush-200 leading-relaxed">
              {draw.prizeDescription}
            </p>
            <p className="text-sm text-slate-500 dark:text-blush-200/90 leading-relaxed pt-2 border-t border-slate-200 dark:border-rose-500/20">
              {draw.description}
            </p>
          </div>
        </div>

        {/* Right Column: Draw Info, Countdown & Action */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:glass-panel rounded-3xl p-8 border border-slate-200 dark:border-rose-400/30 shadow-2xl space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-400/30">
                <Sparkles className="w-4 h-4 text-gold-500 dark:text-gold-400" />
                <span>{isCompleted ? 'Completed Draw' : 'Active Draw'}</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">
                {draw.title}
              </h1>
            </div>

            {/* Countdown Box */}
            <div className="p-6 rounded-3xl bg-white/80 dark:glass-panel border border-slate-200 dark:border-rose-400/30 text-center space-y-4 shadow-md">
              <p className="text-xs text-rose-500 dark:text-rose-300 font-semibold uppercase tracking-wider">
                Time Remaining
              </p>
              <CountdownTimer targetDate={draw.endDate} />
            </div>

            {/* Price & Demo Mode Info */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-plum-900/80 border border-slate-200 dark:border-rose-400/20">
              <div>
                <p className="text-[10px] text-slate-500 dark:text-blush-300 uppercase font-semibold">End Date</p>
                <span className="font-serif font-bold text-slate-900 dark:text-white">
                {new Date(draw.endDate).toLocaleDateString()}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase bg-emerald-100 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-400/20">
                  DEMO MODE
                </span>
                <p className="text-[10px] text-slate-400 dark:text-blush-300 mt-1">No Real Money Charged</p>
              </div>
            </div>

            {/* Entry Action Button */}
            {isCompleted ? (
              <Link
                to={`/draw/${draw.id}/winner`}
                className="w-full py-4 rounded-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-white font-bold text-base shadow-xl flex items-center justify-center gap-2 transition-all"
              >
                <Sparkles className="w-5 h-5" />
                <span>View Winner Reveal 🎉</span>
              </Link>
            ) : entry ? (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-400/20 text-emerald-700 dark:text-emerald-300 text-sm font-semibold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Your entry is confirmed. Good luck!
                  </div>
                  <button
                    onClick={() => setIsQrModalOpen(true)}
                    className="w-full py-4 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-base shadow-xl flex items-center justify-center gap-2.5 transition-all"
                  >
                    <QrCode className="w-5 h-5" />
                    <span>View QR Code</span>
                  </button>
                </div>
            ) : (
              <button
                onClick={handleJoinDraw}
                disabled={submitting}
                className="w-full py-4 rounded-full bg-gradient-to-r from-rose-500 via-rose-600 to-burgundy-600 hover:from-rose-400 hover:to-burgundy-500 text-white font-bold text-base shadow-xl shadow-rose-900/20 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                <Sparkles className="w-5 h-5 text-gold-300" />
                <span>{submitting ? 'Generating Entry...' : `Join Draw — ₹${draw.entryPriceINR}`}</span>
              </button>
            )}

            {/* Safety Guarantee */}
            <div className="pt-2 text-center text-xs text-slate-400 dark:text-blush-300/80 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-gold-500 dark:text-gold-400" />
              <span>Safe server-side random draw mechanism</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment QR Modal */}
      {entry && (
        <PaymentQRModal
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
          title={draw.title}
          price={draw.entryPriceINR}
          type="draw"
          onSuccess={fetchDrawDetail}
        />
      )}
    </div>
  );
};

export default DrawDetail;
