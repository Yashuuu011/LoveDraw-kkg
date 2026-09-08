import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Sparkles, Calendar, Users, Gift, ShieldCheck, CheckCircle2, QrCode, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import { Draw, Entry } from '../types';
import CountdownTimer from '../components/CountdownTimer';
import DemoQRModal from '../components/DemoQRModal';
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
        <p className="text-rose-300 font-serif italic text-lg animate-pulse">
          Sending a little love your way... 💕
        </p>
      </div>
    );
  }

  if (!draw) {
    return (
      <div className="pt-32 pb-20 max-w-md mx-auto text-center px-4">
        <div className="glass-card rounded-3xl p-8 space-y-4">
          <p className="text-xl font-serif text-white">Draw not found. ❤️</p>
          <Link to="/draws" className="text-sm font-semibold text-rose-300 hover:text-white">
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
        className="inline-flex items-center gap-2 text-sm text-blush-200 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Draws</span>
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
          <div className="glass-panel rounded-3xl p-8 border border-rose-400/20 space-y-4">
            <h3 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
              <Gift className="w-5 h-5 text-gold-400" />
              About the Prize
            </h3>
            <p className="text-sm text-blush-200 leading-relaxed">
              {draw.prizeDescription}
            </p>
            <p className="text-sm text-blush-200/90 leading-relaxed pt-2 border-t border-rose-500/20">
              {draw.description}
            </p>
          </div>
        </div>

        {/* Right Column: Draw Info, Countdown & Action */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel rounded-3xl p-8 border border-rose-400/30 shadow-2xl space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs text-rose-300 font-medium mb-1">
                <Users className="w-4 h-4 text-rose-400" />
                <span>{draw.participantsCount || 0} Couples Participated</span>
              </div>
              <h1 className="font-serif text-3xl font-extrabold text-white">{draw.title}</h1>
            </div>

            {/* Countdown Box */}
            <div className="p-4 rounded-2xl glass-card border border-rose-400/20 text-center space-y-3">
              <p className="text-xs text-gold-300 font-semibold uppercase tracking-wider">
                {isCompleted ? 'Draw Completed' : 'Time Remaining'}
              </p>
              <CountdownTimer targetDate={draw.endDate} />
            </div>

            {/* Price & Demo Mode Info */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-plum-900/80 border border-rose-400/20">
              <div>
                <p className="text-[10px] text-blush-300 uppercase font-semibold">Participation Fee</p>
                <p className="text-xl font-bold text-gold-300">₹{draw.entryPriceINR}</p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-emerald-400 uppercase bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-400/20">
                  DEMO MODE
                </span>
                <p className="text-[10px] text-blush-300 mt-1">No Real Money Charged</p>
              </div>
            </div>

            {/* Entry Action Button */}
            {isCompleted ? (
              <Link
                to={`/draw/${draw.id}/winner`}
                className="w-full py-4 rounded-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-burgundy-950 font-bold text-base shadow-xl flex items-center justify-center gap-2 transition-all"
              >
                <Sparkles className="w-5 h-5" />
                <span>View Winner Reveal 🎉</span>
              </Link>
            ) : entry ? (
              <button
                onClick={() => setIsQrModalOpen(true)}
                className="w-full py-4 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-base shadow-xl flex items-center justify-center gap-2.5 transition-all"
              >
                <QrCode className="w-5 h-5" />
                <span>View My Demo Entry & QR Code</span>
              </button>
            ) : (
              <button
                onClick={handleJoinDraw}
                disabled={submitting}
                className="w-full py-4 rounded-full bg-gradient-to-r from-rose-500 via-rose-600 to-burgundy-600 hover:from-rose-400 hover:to-burgundy-500 text-white font-bold text-base shadow-xl shadow-rose-900/50 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                <Sparkles className="w-5 h-5 text-gold-300" />
                <span>{submitting ? 'Generating Entry...' : `Join Draw — ₹${draw.entryPriceINR}`}</span>
              </button>
            )}

            {/* Safety Guarantee */}
            <div className="pt-2 text-center text-xs text-blush-300/80 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-gold-400" />
              <span>Safe server-side random draw mechanism</span>
            </div>
          </div>
        </div>
      </div>

      {/* Demo QR Modal */}
      {entry && (
        <DemoQRModal
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
          draw={draw}
          entry={entry}
          onSuccess={fetchDrawDetail}
        />
      )}
    </div>
  );
};

export default DrawDetail;
