import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Menu, X, User as UserIcon, LogOut, ShieldCheck, Sparkles, Gift, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Daily Love', path: '/daily-love' },
    { name: 'Draws', path: '/draws' },
    { name: 'Memories', path: '/memories' },
    { name: 'Friends', path: '/friends' },
    { name: 'Private Chat', path: '/chat' },
    { name: 'How It Works', path: '/#how-it-works' },
  ];

  const handleNavClick = (path: string) => {
    if (path.includes('#')) {
      const element = document.getElementById('how-it-works');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/');
        setTimeout(() => {
          document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      navigate(path);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'py-3 glass-panel shadow-2xl backdrop-blur-xl' : 'py-3 bg-white/70 dark:bg-plum-950/60 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-burgundy-700 via-rose-500 to-gold-400 p-0.5 shadow-lg group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-plum-900 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-rose-400 fill-rose-400 group-hover:animate-ping" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold rose-gradient-text tracking-wide">
                LoveDraw
              </span>
              <span className="text-[9px] text-gold-400 tracking-widest uppercase font-medium -mt-1">
                Luck & Love ❤️
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              if ((link.path === '/chat' || link.path === '/friends') && !isAuthenticated) return null;
              const isActive = location.pathname === link.path;
              return (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link.path)}
                  className={`relative text-sm font-medium transition-colors text-slate-600 dark:text-slate-200 hover:text-rose-500 dark:text-blush-200 dark:hover:text-rose-300 ${
                    isActive ? 'text-rose-500 dark:text-rose-400 font-semibold' : ''
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-rose-400 to-gold-400 rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Desktop Right CTA / User Profile */}
          <div className="hidden md:flex items-center gap-4">
            {/* Animated Pill Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="relative w-16 h-8 rounded-full bg-background-secondary border border-border flex items-center p-1 cursor-pointer transition-all hover:shadow-[0_0_15px_var(--glow-color)]"
              aria-label="Toggle Theme"
            >
              <div className="flex w-full justify-between px-1.5 z-0 text-sm">
                <span>🌙</span>
                <span>☀️</span>
              </div>
              <motion.div
                layout
                className="absolute w-6 h-6 bg-card rounded-full shadow-md flex items-center justify-center z-10"
                initial={false}
                animate={{
                  left: theme === 'dark' ? '4px' : 'calc(100% - 28px)'
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                {theme === 'dark' ? (
                  <Moon className="w-3.5 h-3.5 text-accent" />
                ) : (
                  <Sun className="w-3.5 h-3.5 text-primary" />
                )}
              </motion.div>
            </button>

            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full glass-card hover:border-rose-400/40 transition-all"
                >
                  <img
                    src={user.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=Love'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border border-rose-400/30 object-cover"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-blush-100 max-w-[100px] truncate">
                    {user.name}
                  </span>
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 glass-panel rounded-2xl p-2 shadow-2xl border border-rose-400/30 overflow-hidden"
                    >
                      <div className="px-3 py-2 border-b border-rose-500/20">
                        <p className="text-xs text-rose-300 font-medium">Signed in as</p>
                        <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{user.email}</p>
                      </div>

                      <Link
                        to="/profile"
                        className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-700 dark:text-blush-100 hover:bg-rose-500/10 dark:hover:bg-rose-500/20 rounded-xl transition-colors mt-1"
                      >
                        <UserIcon className="w-4 h-4 text-rose-400" />
                        My Profile & History
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-gold-300 hover:bg-gold-500/20 rounded-xl transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-gold-400" />
                          Admin Dashboard
                        </Link>
                      )}

                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-rose-400 hover:bg-rose-500/20 rounded-xl transition-colors mt-1 border-t border-rose-500/20"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-100 hover:text-slate-900 dark:text-white dark:hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-rose-500 to-burgundy-600 hover:from-rose-400 hover:to-burgundy-500 text-white shadow-lg shadow-rose-900/40 hover:shadow-rose-600/50 transition-all transform hover:-translate-y-0.5 flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-gold-300 animate-pulse" />
                  Join Now
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Theme & Hamburger Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl glass-card text-slate-700 dark:text-blush-200 hover:text-slate-900 dark:text-white dark:hover:text-white"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-gold-300" /> : <Moon className="w-5 h-5 text-slate-800 dark:text-white" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl glass-card text-slate-700 dark:text-blush-200 hover:text-slate-900 dark:text-white dark:hover:text-white"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Animated Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-panel border-b border-rose-500/30 overflow-hidden"
          >
            <div className="px-4 pt-3 pb-6 space-y-3">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link.path)}
                  className="w-full text-left px-4 py-3 rounded-xl text-base font-medium text-slate-700 dark:text-slate-100 hover:bg-rose-50 dark:text-blush-100 dark:hover:bg-rose-500/20 transition-colors flex items-center justify-between"
                >
                  {link.name}
                  <Heart className="w-4 h-4 text-rose-400/40" />
                </button>
              ))}

              <div className="pt-4 border-t border-rose-500/20 space-y-2">
                {isAuthenticated && user ? (
                  <>
                    <Link
                      to="/profile"
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-500/20 text-white font-medium"
                    >
                      <UserIcon className="w-5 h-5 text-rose-400" />
                      Profile ({user.name})
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gold-500/20 text-gold-300 font-medium"
                      >
                        <ShieldCheck className="w-5 h-5 text-gold-400" />
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 font-medium"
                    >
                      <LogOut className="w-5 h-5" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Link
                      to="/login"
                      className="w-full py-3 text-center rounded-xl glass-card text-slate-700 dark:text-blush-100 font-medium"
                    >
                      Log In
                    </Link>
                    <Link
                      to="/register"
                      className="w-full py-3 text-center rounded-xl bg-gradient-to-r from-rose-500 to-burgundy-600 text-white font-semibold shadow-lg"
                    >
                      Join Now
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
