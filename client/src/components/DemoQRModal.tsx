import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Copy, Check, QrCode, Sparkles, Lock } from 'lucide-react';
import { Draw, Entry } from '../types';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

interface DemoQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  draw: Draw;
  entry: Entry;
  onSuccess: () => void;
}

export const DemoQRModal: React.FC<DemoQRModalProps> = ({
  isOpen,
  onClose,
  draw,
  entry,
  onSuccess,
}) => {
  const [copied, setCopied] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleCopyRef = () => {
    navigator.clipboard.writeText(entry.referenceCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulatePayment = async () => {
    setProcessing(true);
    try {
      const response = await api.post('/payment/demo', {
        drawId: draw.id,
        referenceCode: entry.referenceCode,
      });

      if (response.data.success) {
        showToast('Demo payment confirmed! Entry officially activated! ❤️', 'love');
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Error processing demo payment.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  // Construct dynamic QR payload URL
  const qrPayload = `${window.location.origin}/payment/${entry.referenceCode}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-plum-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md glass-panel rounded-3xl p-6 sm:p-8 border border-rose-400/30 shadow-2xl space-y-6"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full glass-card text-blush-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-400/30 text-gold-300 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>DEMO PAYMENT MODE</span>
            </div>
            <h3 className="font-serif text-2xl font-bold rose-gradient-text">
              Join the Draw ❤️
            </h3>
            <p className="text-xs text-blush-200">{draw.title}</p>
          </div>

          {/* Dynamic QR Code Card */}
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl glass-card border border-rose-400/20 bg-white/95 shadow-inner">
            <div className="p-2 bg-white rounded-xl shadow-md border border-rose-100">
              <QRCodeSVG
                value={qrPayload}
                size={180}
                bgColor="#FFFFFF"
                fgColor="#3B0910"
                level="H"
                includeMargin={true}
              />
            </div>
            <p className="text-[11px] text-burgundy-900 font-semibold mt-3 flex items-center gap-1">
              <QrCode className="w-3.5 h-3.5 text-rose-600" />
              Scan Demo QR or copy reference below
            </p>
          </div>

          {/* Reference Identifier */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-blush-200">
              <span>Draw Entry Reference</span>
              <span className="text-gold-300 font-semibold">₹{draw.entryPriceINR} (DEMO)</span>
            </div>

            <div className="flex items-center justify-between px-4 py-3 rounded-xl glass-card border border-rose-400/30 bg-plum-900/60">
              <span className="font-mono text-sm font-bold text-white">{entry.referenceCode}</span>
              <button
                onClick={handleCopyRef}
                className="flex items-center gap-1 text-xs text-rose-300 hover:text-white font-medium"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-400/20 text-xs text-blush-200 space-y-1">
            <p className="font-semibold text-rose-300 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              Safe Demo Flow:
            </p>
            <p>
              No real money is transferred. Click the simulation button below to confirm your entry reference.
            </p>
          </div>

          {/* Simulation CTA */}
          <button
            onClick={handleSimulatePayment}
            disabled={processing}
            className="w-full py-3.5 rounded-full bg-gradient-to-r from-rose-500 via-rose-600 to-burgundy-600 hover:from-rose-400 hover:to-burgundy-500 text-white font-semibold shadow-lg shadow-rose-900/50 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-gold-300 animate-pulse" />
            <span>{processing ? 'Processing Demo Entry...' : 'Simulate Payment & Confirm Entry'}</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DemoQRModal;
