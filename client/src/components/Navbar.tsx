import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Menu, X, User as UserIcon, LogOut, ShieldCheck, Zap, Sun, Moon, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSound } from '../context/SoundContext';

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { soundEnabled, toggleSound, playClick } = useSound();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) setScrolled(true);
      else setScrolled(false);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Multiverse HQ', path: '/' },
    { name: 'Spider-Notes', path: '/daily-love' },
    { name: 'Strange Draws', path: '/draws' },
    { name: 'Cap Memories', path: '/memories' },
    { name: 'Avengers Comms', path: '/friends' },
    { name: 'Stark Chat', path: '/chat' },
  ];

  const handleNavClick = (path: string) => {
    playClick();
    navigate(path);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 border-b ${
        scrolled 
          ? 'py-3 glass-panel border-primary/50 shadow-[0_4px_30px_var(--glow-color)]' 
          : 'py-4 bg-transparent border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo - Arc Reactor / HUD Style */}
          <Link to="/" onClick={playClick} className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <motion.div 
                className="absolute inset-0 rounded-full border-2 border-accent border-dashed opacity-50 group-hover:opacity-100"
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              />
              <div className="w-10 h-10 rounded-full bg-marvel-navy border border-primary flex items-center justify-center shadow-[0_0_15px_var(--primary)] group-hover:shadow-[0_0_25px_var(--accent)] transition-all">
                <Heart className="w-5 h-5 text-primary fill-primary animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold cinematic-gradient-text tracking-widest uppercase">
                LoveDraw
              </span>
              <span className="text-[9px] text-accent tracking-[0.2em] font-sans uppercase -mt-1 flex items-center gap-1">
                <Zap className="w-2.5 h-2.5" /> Cinematic Universe
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              if ((link.path === '/chat' || link.path === '/friends') && !isAuthenticated) return null;
              const isActive = location.pathname === link.path;
              return (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link.path)}
                  className={`relative px-3 py-2 text-xs uppercase tracking-widest font-sans font-bold transition-all hover:text-primary ${
                    isActive ? 'text-primary hologram-text' : 'text-text-secondary'
                  }`}
                  onMouseEnter={playClick}
                >
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="activeHud"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary shadow-[0_0_10px_var(--primary)]"
                    />
                  )}
                  {/* Subtle hover bracket effect */}
                  <div className="absolute inset-0 border border-primary/0 hover:border-primary/50 transition-colors rounded opacity-0 hover:opacity-100" />
                </button>
              );
            })}
          </nav>

          {/* Desktop Right Controls */}
          <div className="hidden md:flex items-center gap-4">
            
            {/* Sound Toggle */}
            <button
              onClick={() => { playClick(); toggleSound(); }}
              className="p-2 rounded-full glass-card text-text-secondary hover:text-accent border border-border hover:border-accent hover:shadow-[0_0_15px_var(--glow-color)] transition-all"
              title="Toggle Sound"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Theme Toggle (Light/Dark Universe) */}
            <button
              onClick={() => { playClick(); toggleTheme(); }}
              className="p-2 rounded-full glass-card text-text-secondary hover:text-primary border border-border hover:border-primary hover:shadow-[0_0_15px_var(--glow-color)] transition-all"
              title="Toggle Universe"
            >
              {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => { playClick(); setUserDropdownOpen(!userDropdownOpen); }}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-full glass-card border border-border hover:border-accent hover:shadow-[0_0_15px_var(--glow-color)] transition-all"
                >
                  <div className="w-8 h-8 rounded-full border-2 border-primary overflow-hidden flex items-center justify-center bg-marvel-navy">
                    <img
                      src={user.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=Love'}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs font-bold text-text-primary uppercase tracking-wider max-w-[100px] truncate">
                    {user.name}
                  </span>
                </button>

                {/* Holographic Dropdown Menu */}
                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-56 glass-panel rounded-xl p-2 shadow-2xl border border-primary/50 overflow-hidden"
                    >
                      <div className="scanlines" />
                      <div className="px-3 py-2 border-b border-primary/20 relative z-10">
                        <p className="text-[10px] text-accent font-bold uppercase tracking-widest">Hero ID</p>
                        <p className="text-xs font-semibold text-text-primary truncate">{user.email}</p>
                      </div>

                      <div className="relative z-10 mt-1">
                        <Link
                          to="/profile"
                          className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold uppercase text-text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        >
                          <UserIcon className="w-4 h-4" />
                          Suit Dashboard
                        </Link>

                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold uppercase text-marvel-blue hover:text-white hover:bg-marvel-blue/20 rounded-lg transition-colors mt-1"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            S.H.I.E.L.D Comms
                          </Link>
                        )}

                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold uppercase text-primary hover:bg-primary/20 rounded-lg transition-colors mt-1 border-t border-primary/20"
                        >
                          <LogOut className="w-4 h-4" />
                          Disconnect
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  onClick={playClick}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-text-secondary hover:text-primary transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={playClick}
                  className="px-5 py-2.5 rounded-none bg-primary/20 border border-primary text-primary hover:bg-primary hover:text-white text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_var(--glow-color)] transition-all"
                  style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
                >
                  Join Initiative
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger & Controls */}
          <div className="md:hidden flex items-center gap-2">
            <button onClick={() => { playClick(); toggleTheme(); }} className="p-2 text-primary">
              {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <button
              onClick={() => { playClick(); setMobileMenuOpen(!mobileMenuOpen); }}
              className="p-2 text-primary"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Holographic Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-panel border-b border-primary/50 overflow-hidden relative"
          >
            <div className="scanlines" />
            <div className="px-4 pt-3 pb-6 space-y-2 relative z-10">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link.path)}
                  className="w-full text-left px-4 py-3 rounded-lg bg-background-secondary border border-border text-xs font-bold uppercase tracking-widest text-text-primary hover:border-primary transition-colors flex items-center justify-between"
                >
                  {link.name}
                  <Zap className="w-3 h-3 text-primary" />
                </button>
              ))}

              <div className="pt-4 border-t border-primary/20 space-y-2 mt-4">
                {isAuthenticated && user ? (
                  <>
                    <Link to="/profile" className="w-full flex items-center gap-3 px-4 py-3 bg-primary/10 text-primary font-bold text-xs uppercase rounded-lg border border-primary/30">
                      <UserIcon className="w-4 h-4" /> Suit Dashboard
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="w-full flex items-center gap-3 px-4 py-3 bg-marvel-blue/10 text-marvel-blue font-bold text-xs uppercase rounded-lg border border-marvel-blue/30">
                        <ShieldCheck className="w-4 h-4" /> S.H.I.E.L.D Comms
                      </Link>
                    )}
                    <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-primary font-bold text-xs uppercase">
                      <LogOut className="w-4 h-4" /> Disconnect
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Link to="/login" className="w-full py-3 text-center bg-background-secondary border border-border text-text-primary font-bold text-xs uppercase">
                      Log In
                    </Link>
                    <Link to="/register" className="w-full py-3 text-center bg-primary text-white font-bold text-xs uppercase">
                      Join
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
