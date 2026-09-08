import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Lock, Mail, User as UserIcon, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Auth: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const isRegister = location.pathname === '/register';
  const isForgotPassword = location.pathname === '/forgot-password';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

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

      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const response = await api.post(endpoint, formData);

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
        className="w-full max-w-md glass-panel rounded-3xl p-8 border border-rose-400/30 shadow-2xl space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-rose-500 to-gold-400 p-0.5 mx-auto">
            <div className="w-full h-full bg-plum-900 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-rose-400 fill-rose-400" />
            </div>
          </div>

          <h1 className="font-serif text-3xl font-bold rose-gradient-text">
            {isRegister && 'Create Account ❤️'}
            {!isRegister && !isForgotPassword && 'Welcome Back ❤️'}
            {isForgotPassword && 'Reset Password 🔑'}
          </h1>
          <p className="text-xs text-blush-200">
            {isRegister && 'Join the LoveDraw community today'}
            {!isRegister && !isForgotPassword && 'Log in to view draws and save love notes'}
            {isForgotPassword && 'Enter your email to receive a reset link'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="space-y-1">
              <label className="text-xs text-blush-200 font-medium">Your Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-rose-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Sarah Jenkins"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl glass-card border border-rose-400/30 text-white placeholder-blush-300/40 text-sm focus:outline-none focus:border-rose-400"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs text-blush-200 font-medium">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-rose-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your.email@lovedraw.com"
                className="w-full pl-10 pr-4 py-3 rounded-2xl glass-card border border-rose-400/30 text-white placeholder-blush-300/40 text-sm focus:outline-none focus:border-rose-400"
              />
            </div>
          </div>

          {!isForgotPassword && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs text-blush-200 font-medium">Password</label>
                {!isRegister && (
                  <Link to="/forgot-password" className="text-[11px] text-rose-300 hover:underline">
                    Forgot?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-rose-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl glass-card border border-rose-400/30 text-white placeholder-blush-300/40 text-sm focus:outline-none focus:border-rose-400"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-gradient-to-r from-rose-500 via-rose-600 to-burgundy-600 hover:from-rose-400 hover:to-burgundy-500 text-white font-bold text-sm shadow-lg shadow-rose-900/50 flex items-center justify-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4 text-gold-300" />
            <span>
              {loading
                ? 'Please wait...'
                : isRegister
                ? 'Create Account'
                : isForgotPassword
                ? 'Send Reset Link'
                : 'Log In'}
            </span>
          </button>
        </form>

        {/* Footer Navigation Switcher */}
        <div className="text-center pt-2 text-xs text-blush-300">
          {isRegister ? (
            <p>
              Already have an account?{' '}
              <Link to="/login" className="text-rose-300 font-semibold hover:underline">
                Log In
              </Link>
            </p>
          ) : (
            <p>
              Don't have an account yet?{' '}
              <Link to="/register" className="text-rose-300 font-semibold hover:underline">
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
