import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Lock, Mail, User as UserIcon, Phone, KeyRound } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

export const Auth: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();
  const { theme } = useTheme();

  const isRegister = location.pathname === '/register';
  const isForgotPassword = location.pathname === '/forgot-password';

  const [usePhone, setUsePhone] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    otp: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!formData.phone || formData.phone.length < 10) {
      showToast('Please enter a valid phone number', 'error');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/auth/send-otp', { phone: formData.phone });
      if (response.data.success) {
        showToast('OTP sent successfully! Check your phone.', 'love');
        setOtpSent(true);
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Error sending OTP.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isForgotPassword) {
        await api.post('/auth/forgot-password', { email: formData.email });
        showToast('Password reset link sent to your email! 💕', 'love');
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
          login(response.data.token, response.data.user);
          showToast(response.data.message || 'Welcome back to LoveDraw! ❤️', 'love');
          navigate('/');
        }
        return;
      }

      // Standard Registration / Email Login
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const payload = isRegister ? formData : { email: formData.email, password: formData.password };
      
      const response = await api.post(endpoint, payload);

      if (response.data.success) {
        login(response.data.token, response.data.user);
        showToast(response.data.message || 'Welcome to LoveDraw! ❤️', 'love');
        navigate('/');
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Authentication error. Please check inputs.', 'error');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-[85vh] pt-28 pb-20 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl p-8 shadow-2xl space-y-6 bg-white border-rose-200 dark:glass-panel dark:border-rose-400/30"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-rose-500 to-gold-400 p-0.5 mx-auto">
            <div className="w-full h-full bg-plum-900 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-rose-400 fill-rose-400" />
            </div>
          </div>

          <h1 className="font-serif text-3xl font-bold text-rose-600 dark:rose-gradient-text">
            {isRegister && 'Create Account ❤️'}
            {!isRegister && !isForgotPassword && 'Welcome Back ❤️'}
            {isForgotPassword && 'Reset Password 🔑'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-blush-200">
            {isRegister && 'Join the LoveDraw community today'}
            {!isRegister && !isForgotPassword && 'Log in to view draws and save love notes'}
            {isForgotPassword && 'Enter your email to receive a reset link'}
          </p>
        </div>

        {/* Toggle Phone/Email Login */}
        {!isRegister && !isForgotPassword && (
          <div className="flex justify-center mb-4">
            <div className="flex rounded-full p-1 bg-slate-100 dark:bg-plum-900">
              <button
                type="button"
                onClick={() => { setUsePhone(false); setOtpSent(false); }}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${!usePhone ? 'bg-rose-500 text-white shadow' : 'text-slate-500 dark:text-blush-200'}`}
              >
                Use Email
              </button>
              <button
                type="button"
                onClick={() => setUsePhone(true)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${usePhone ? 'bg-rose-500 text-white shadow' : 'text-slate-500 dark:text-blush-200'}`}
              >
                Use Phone (OTP)
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-200">Your Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-rose-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Sarah Jenkins"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border text-sm focus:outline-none focus:border-rose-400 bg-rose-50/50 border-rose-200 text-slate-800 dark:text-white placeholder-slate-400 dark:glass-card dark:border-rose-400/30 dark:text-white dark:placeholder-blush-300/40"
                />
              </div>
            </div>
          )}

          {(!usePhone || isRegister || isForgotPassword) && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-200">
                {isRegister ? 'Email Address (Optional if using phone)' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-rose-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required={!isRegister && !usePhone}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your.email@lovedraw.com"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border text-sm focus:outline-none focus:border-rose-400 bg-rose-50/50 border-rose-200 text-slate-800 dark:text-white placeholder-slate-400 dark:glass-card dark:border-rose-400/30 dark:text-white dark:placeholder-blush-300/40"
                />
              </div>
            </div>
          )}

          {(usePhone || isRegister) && !isForgotPassword && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-200">
                Phone Number {isRegister && '(Optional if using email)'}
              </label>
              <div className="relative flex gap-2">
                <div className="relative flex-grow">
                  <Phone className="w-4 h-4 text-rose-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    required={usePhone && !isRegister}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+919876543210"
                    disabled={otpSent}
                    className={`w-full pl-10 pr-4 py-3 rounded-2xl border text-sm focus:outline-none focus:border-rose-400 bg-rose-50/50 border-rose-200 text-slate-800 dark:text-white placeholder-slate-400 dark:glass-card dark:border-rose-400/30 dark:text-white dark:placeholder-blush-300/40 ${otpSent ? 'opacity-50' : ''}`}
                  />
                </div>
                {!isRegister && usePhone && !otpSent && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="px-4 py-3 rounded-xl bg-rose-500 text-white font-semibold text-xs whitespace-nowrap shadow-md hover:bg-rose-600"
                  >
                    Send OTP
                  </button>
                )}
              </div>
            </div>
          )}

          {/* OTP Input for Login */}
          {!isRegister && usePhone && otpSent && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-200">Enter OTP</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-rose-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={formData.otp}
                  onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                  placeholder="123456"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border text-sm focus:outline-none focus:border-rose-400 tracking-widest bg-rose-50/50 border-rose-200 text-slate-800 dark:text-white placeholder-slate-400 dark:glass-card dark:border-rose-400/30 dark:text-white dark:placeholder-blush-300/40"
                />
              </div>
            </div>
          )}

          {/* Password Input (for Email login or Registration) */}
          {(!usePhone || isRegister) && !isForgotPassword && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-200">Password</label>
                {!isRegister && (
                  <Link to="/forgot-password" className="text-[11px] text-rose-500 hover:underline">
                    Forgot?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-rose-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required={!usePhone}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border text-sm focus:outline-none focus:border-rose-400 bg-rose-50/50 border-rose-200 text-slate-800 dark:text-white placeholder-slate-400 dark:glass-card dark:border-rose-400/30 dark:text-white dark:placeholder-blush-300/40"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (!isRegister && usePhone && !otpSent)}
            className="w-full py-3.5 rounded-full bg-gradient-to-r from-rose-500 via-rose-600 to-burgundy-600 hover:from-rose-400 hover:to-burgundy-500 text-white font-bold text-sm shadow-lg shadow-rose-900/50 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-gold-300" />
            <span>
              {loading
                ? 'Please wait...'
                : isRegister
                ? 'Create Account'
                : isForgotPassword
                ? 'Send Reset Link'
                : usePhone
                ? 'Verify & Log In'
                : 'Log In'}
            </span>
          </button>
        </form>

        {/* Footer Navigation Switcher */}
        <div className="text-center pt-2 text-xs text-slate-500 dark:text-slate-300">
          {isRegister ? (
            <p>
              Already have an account?{' '}
              <Link to="/login" className="text-rose-500 font-semibold hover:underline">
                Log In
              </Link>
            </p>
          ) : (
            <p>
              Don't have an account yet?{' '}
              <Link to="/register" className="text-rose-500 font-semibold hover:underline">
                Create Account
              </Link>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;

