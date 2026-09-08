import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Sparkles, QrCode } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

interface PaymentQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  price: number;
  onSuccess: () => void;
  type: 'message' | 'draw';
}

const CUTE_PROMPTS = [
  "Buy it ketuu baby 🥺",
  "Buy for our love shona jaanu 💖",
  "For us mere babu 💕",
  "Spoil me my love 🥰",
  "Just ₹1 for a smile jaan ✨"
];

export const PaymentQRModal: React.FC<PaymentQRModalProps> = ({
  isOpen,
  onClose,
  title,
  price,
  onSuccess,
  type
}) => {
  const [processing, setProcessing] = useState(false);
  const [promptText, setPromptText] = useState(CUTE_PROMPTS[0]);
  const { showToast } = useToast();
  const { theme } = useTheme();

  useEffect(() => {
    if (isOpen) {
      const randomPrompt = CUTE_PROMPTS[Math.floor(Math.random() * CUTE_PROMPTS.length)];
      setPromptText(randomPrompt);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSimulatePayment = () => {
    setProcessing(true);
    // Simulate payment delay
    setTimeout(() => {
      setProcessing(false);
      showToast('Payment successful! ❤️', 'love');
      onSuccess();
      onClose();
    }, 1500);
  };

  const isDark = theme === 'dark';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className={`relative w-full max-w-sm rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 ${
            isDark 
              ? 'glass-panel border border-rose-400/30' 
              : 'bg-white border border-rose-200'
          }`}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
              isDark ? 'glass-card text-blush-200 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center space-y-1.5">
            <h3 className={`font-serif text-2xl font-bold ${isDark ? 'rose-gradient-text' : 'text-rose-600'}`}>
              {type === 'message' ? 'Unlock Daily Love 💌' : 'Join the Draw ❤️'}
            </h3>
            <p className={`text-sm font-medium ${isDark ? 'text-blush-200' : 'text-slate-600'}`}>{title}</p>
          </div>

          {/* Static QR Code Image */}
          <div className={`flex flex-col items-center justify-center p-4 rounded-2xl shadow-inner ${
            isDark ? 'glass-card border border-rose-400/20 bg-white/5' : 'bg-rose-50 border border-rose-100'
          }`}>
            <div className="p-2 bg-white rounded-xl shadow-md border border-rose-100">
              {/* Ensure user saves their QR code as public/payment-qr.png */}
              <img 
                src="/payment-qr.png" 
                alt="Payment QR Code" 
                className="w-48 h-48 object-contain rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=Placeholder+QR';
                }}
              />
            </div>
            
            {/* Cute Prompt */}
            <p className="font-romantic text-2xl text-rose-500 mt-4 font-bold text-center animate-pulse">
              {promptText}
            </p>
            
            <p className={`text-[12px] font-semibold mt-2 flex items-center gap-1 ${
              isDark ? 'text-gold-300' : 'text-rose-600'
            }`}>
              <QrCode className="w-4 h-4" />
              Scan to pay ₹{price}
            </p>
          </div>

          {/* Instructions */}
          <div className={`p-3.5 rounded-xl border text-xs space-y-1 ${
            isDark 
              ? 'bg-rose-500/10 border-rose-400/20 text-blush-200' 
              : 'bg-rose-50 border-rose-200 text-slate-600'
          }`}>
            <p className={`font-semibold flex items-center gap-1 ${isDark ? 'text-rose-300' : 'text-rose-600'}`}>
              <ShieldCheck className="w-4 h-4" />
              Payment Verification
            </p>
            <p>
              After scanning and paying via UPI, click the confirm button below.
            </p>
          </div>

          {/* Confirmation CTA */}
          <button
            onClick={handleSimulatePayment}
            disabled={processing}
            className="w-full py-3.5 rounded-full bg-gradient-to-r from-rose-500 via-rose-600 to-burgundy-600 hover:from-rose-400 hover:to-burgundy-500 text-white font-semibold shadow-lg shadow-rose-900/50 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-gold-300 animate-pulse" />
            <span>{processing ? 'Verifying Payment...' : 'I have paid ₹' + price}</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PaymentQRModal;
