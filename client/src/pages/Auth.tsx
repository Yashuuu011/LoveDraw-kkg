import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Crosshair, Lock, Mail, User as UserIcon, Phone, KeyRound, Zap } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useSound } from '../context/SoundContext';

export const Auth: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();
  const { playClick, playPortal, playNotification } = useSound();

  const isRegister = location.pathname === '/register';
  const isForgotPassword = location.pathname === '/forgot-password';

  const [usePhone, setUsePhone] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    otp: '',
    bio: '',
    dateOfBirth: ''
  });
  
  // Cinematic loading states
  const [authLoading, setAuthLoading] = useState(false);
  const [introFinished, setIntroFinished] = useState(false);

  // Initial cinematic portal delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIntroFinished(true);
      playPortal();
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleSendOtp = async (e: React.MouseEvent) => {
    e.preventDefault();
    playClick();
    if (!formData.phone || formData.phone.length < 10) {
      addToast('INVALID COMM CHANNEL DETECTED', 'error');
      return;
    }
    setAuthLoading(true);
    try {
      const response = await api.post('/auth/send-otp', { phone: formData.phone });
      if (response.data.success) {
        addToast('OTP TRANSMITTED. CHECK COMM DEVICE.', 'success');
        setOtpSent(true);
        playNotification();
      }
    } catch (error: any) {
      addToast(error.response?.data?.message || 'TRANSMISSION FAILED.', 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playClick();
    setAuthLoading(true);

    try {
      if (isForgotPassword) {
        await api.post('/auth/forgot-password', { email: formData.email });
        addToast('RESET LINK TRANSMITTED ⚡', 'success');
        navigate('/login');
        return;
      }

      // If OTP login flow
      if (!isRegister && usePhone && otpSent) {
        const response = await api.post('/auth/verify-otp', {
          phone: formData.phone,
          otp: formData.otp
        });
        if (response.data.success) {
          playPortal();
          login(response.data.token, response.data.user);
          navigate('/');
        }
        return;
      }

      // Standard Registration / Email Login
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const payload = isRegister ? formData : { email: formData.email, password: formData.password };
      
      const response = await api.post(endpoint, payload);

      if (response.data.success) {
        playPortal();
        login(response.data.token, response.data.user);
        navigate('/');
      }
    } catch (error: any) {
      addToast(error.response?.data?.message || 'ACCESS DENIED. INVALID CREDENTIALS.', 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black flex items-center justify-center px-4 overflow-hidden">
      
      {/* Cinematic Starfield Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(60)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute bg-white rounded-full"
            style={{
              width: Math.random() * 3 + 'px',
              height: Math.random() * 3 + 'px',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{ opacity: [0.1, 0.8, 0.1] }}
            transition={{ duration: 2 + Math.random() * 3, repeat: Infinity }}
          />
        ))}
      </div>

      <AnimatePresence>
        {!introFinished && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center bg-black"
            exit={{ opacity: 0, scale: 2 }}
            transition={{ duration: 1.5, ease: "easeIn" }}
          >
            <div className="relative flex items-center justify-center">
              <motion.div 
                className="w-32 h-32 border-4 border-marvel-blue border-dashed rounded-full shadow-[0_0_50px_var(--secondary)]"
                animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <p className="absolute text-marvel-blue font-sans text-xs font-bold uppercase tracking-widest animate-pulse">
                Opening Portal...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: introFinished ? 1 : 0, scale: introFinished ? 1 : 0.8 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="relative z-10 w-full max-w-md bg-card/80 backdrop-blur-2xl p-8 border border-primary/50 shadow-[0_0_40px_rgba(226,54,54,0.2)]"
      >
        {/* Holographic scanning overlay */}
        <div className="scanlines" />
        <div className="absolute top-0 left-0 w-full h-[2px] bg-primary group-hover:animate-scanline opacity-50 z-20 pointer-events-none" />

        <div className="text-center space-y-4 mb-8 relative z-10">
          <Crosshair className="w-10 h-10 text-primary mx-auto animate-spin-slow" />
          <h1 className="font-serif text-3xl font-black text-white uppercase tracking-widest">
            {isRegister ? 'Hero ID Creation' : isForgotPassword ? 'Reset Codes' : 'Access Terminal'}
          </h1>
          <p className="text-[10px] text-primary uppercase font-bold tracking-[0.2em]">
            Secure S.H.I.E.L.D. Subnet
          </p>
        </div>

        {!isRegister && !isForgotPassword && (
          <div className="flex justify-center mb-6 relative z-10">
            <div className="flex bg-black/50 border border-primary/30 p-1">
              <button
                type="button"
                onClick={() => { playClick(); setUsePhone(false); setOtpSent(false); }}
                className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${!usePhone ? 'bg-primary text-white shadow-[0_0_10px_var(--primary)]' : 'text-text-muted hover:text-white'}`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => { playClick(); setUsePhone(true); }}
                className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${usePhone ? 'bg-primary text-white shadow-[0_0_10px_var(--primary)]' : 'text-text-muted hover:text-white'}`}
              >
                Comm Channel (OTP)
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {isRegister && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-marvel-blue uppercase tracking-widest">Codename / Designation</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-marvel-blue absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Peter Parker"
                  autoComplete="name"
                  className="w-full pl-10 pr-4 py-2.5 bg-black/60 border border-marvel-blue/50 text-white text-sm focus:outline-none focus:border-marvel-blue focus:shadow-[0_0_15px_rgba(81,140,202,0.4)] transition-all font-sans"
                />
              </div>
            </div>
          )}

          {isRegister && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-marvel-blue uppercase tracking-widest">Date of Birth</label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-4 py-2.5 bg-black/60 border border-marvel-blue/50 text-white text-sm focus:outline-none focus:border-marvel-blue focus:shadow-[0_0_15px_rgba(81,140,202,0.4)] transition-all font-sans [color-scheme:dark]"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-marvel-blue uppercase tracking-widest">Hero Bio</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Short bio..."
                    className="w-full px-4 py-2.5 bg-black/60 border border-marvel-blue/50 text-white text-sm focus:outline-none focus:border-marvel-blue focus:shadow-[0_0_15px_rgba(81,140,202,0.4)] transition-all font-sans"
                  />
                </div>
              </div>
            </div>
          )}

          {(!usePhone || isRegister || isForgotPassword) && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-marvel-blue uppercase tracking-widest">
                Registered Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-marvel-blue absolute left-3 top-3" />
                <input
                  type="email"
                  required={!isRegister && !usePhone}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="agent@shield.gov"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2.5 bg-black/60 border border-marvel-blue/50 text-white text-sm focus:outline-none focus:border-marvel-blue focus:shadow-[0_0_15px_rgba(81,140,202,0.4)] transition-all font-sans"
                />
              </div>
            </div>
          )}

          {(usePhone || isRegister) && !isForgotPassword && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-marvel-blue uppercase tracking-widest">
                Secure Comm Line (Phone)
              </label>
              <div className="relative flex gap-2">
                <div className="relative flex-grow">
                  <Phone className="w-4 h-4 text-marvel-blue absolute left-3 top-3" />
                  <input
                    type="tel"
                    required={usePhone && !isRegister}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+919876543210"
                    disabled={otpSent}
                    autoComplete="tel"
                    className={`w-full pl-10 pr-4 py-2.5 bg-black/60 border border-marvel-blue/50 text-white text-sm focus:outline-none focus:border-marvel-blue focus:shadow-[0_0_15px_rgba(81,140,202,0.4)] transition-all font-sans ${otpSent ? 'opacity-50' : ''}`}
                  />
                </div>
                {!isRegister && usePhone && !otpSent && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={authLoading}
                    className="px-4 py-2 bg-marvel-blue text-white font-bold text-[10px] uppercase tracking-widest hover:bg-white hover:text-marvel-blue transition-colors shadow-[0_0_15px_rgba(81,140,202,0.3)]"
                  >
                    Transmit
                  </button>
                )}
              </div>
            </div>
          )}

          {/* OTP Input for Login */}
          {!isRegister && usePhone && otpSent && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-marvel-gold uppercase tracking-widest">Authorization Code</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-marvel-gold absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={formData.otp}
                  onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                  placeholder="123456"
                  autoComplete="one-time-code"
                  className="w-full pl-10 pr-4 py-2.5 bg-black/60 border border-marvel-gold/50 text-marvel-gold text-lg tracking-[0.5em] focus:outline-none focus:border-marvel-gold focus:shadow-[0_0_15px_rgba(247,143,63,0.4)] transition-all font-mono"
                />
              </div>
            </div>
          )}

          {(!usePhone || isRegister) && !isForgotPassword && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-marvel-blue uppercase tracking-widest">Passcode</label>
                {!isRegister && (
                  <Link to="/forgot-password" onClick={playClick} className="text-[10px] text-primary hover:text-white uppercase tracking-widest">
                    Override?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-marvel-blue absolute left-3 top-3" />
                <input
                  type="password"
                  required={!usePhone}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  className="w-full pl-10 pr-4 py-2.5 bg-black/60 border border-marvel-blue/50 text-white text-sm focus:outline-none focus:border-marvel-blue focus:shadow-[0_0_15px_rgba(81,140,202,0.4)] transition-all font-sans"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={authLoading || (!isRegister && usePhone && !otpSent)}
            className="w-full py-4 mt-6 bg-primary text-white font-black text-sm uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(226,54,54,0.5)] hover:bg-white hover:text-primary transition-all disabled:opacity-50 flex items-center justify-center gap-3 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0" />
            <span className="relative z-10 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              {authLoading
                ? 'ESTABLISHING CONNECTION...'
                : isRegister
                ? 'CREATE HERO ID'
                : isForgotPassword
                ? 'TRANSMIT RESET LINK'
                : 'ENTER THE UNIVERSE'}
            </span>
          </button>
        </form>

        <div className="text-center pt-6 mt-6 border-t border-primary/20 relative z-10">
          {isRegister ? (
            <p className="text-[10px] text-text-muted uppercase tracking-widest">
              Already initialized?{' '}
              <Link to="/login" onClick={playClick} className="text-marvel-blue font-bold hover:text-white">
                Access Terminal
              </Link>
            </p>
          ) : (
            <p className="text-[10px] text-text-muted uppercase tracking-widest">
              Unregistered entity?{' '}
              <Link to="/register" onClick={playClick} className="text-primary font-bold hover:text-white">
                Create Hero ID
              </Link>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
