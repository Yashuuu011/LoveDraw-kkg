import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, Sparkles, Mail, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 bg-plum-950 border-t border-rose-500/20 pt-16 pb-12 overflow-hidden">
      {/* Glow effect */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-rose-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Column 1: Brand & Tagline */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-500 to-gold-400 p-0.5">
                <div className="w-full h-full bg-plum-900 rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
                </div>
              </div>
              <span className="font-serif text-2xl font-bold rose-gradient-text">LoveDraw</span>
            </Link>
            <p className="text-sm text-blush-300/80 leading-relaxed">
              A romantic community platform dedicated to spreading daily love notes, memorable prize draws, and everlasting couple memories.
            </p>
            <div className="flex items-center gap-2 text-xs text-gold-300/90 bg-gold-500/10 px-3 py-1.5 rounded-full w-fit border border-gold-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>A Little Luck. A Lot of Love. ❤️</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider font-serif">Explore</h4>
            <ul className="space-y-2 text-sm text-blush-200">
              <li>
                <Link to="/daily-love" className="hover:text-rose-300 transition-colors">Daily Love Note</Link>
              </li>
              <li>
                <Link to="/draws" className="hover:text-rose-300 transition-colors">Monthly & Weekly Draws</Link>
              </li>
              <li>
                <Link to="/memories" className="hover:text-rose-300 transition-colors">Couple Memories Gallery</Link>
              </li>
              <li>
                <Link to="/#how-it-works" className="hover:text-rose-300 transition-colors">How It Works</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust & Legal */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider font-serif">Legal & Safety</h4>
            <ul className="space-y-2 text-sm text-blush-200">
              <li className="hover:text-rose-300 transition-colors cursor-pointer">Draw Rules & Eligibility</li>
              <li className="hover:text-rose-300 transition-colors cursor-pointer">Terms of Service</li>
              <li className="hover:text-rose-300 transition-colors cursor-pointer">Privacy Policy</li>
              <li className="hover:text-rose-300 transition-colors cursor-pointer">Responsible Community</li>
            </ul>
          </div>

          {/* Column 4: Demo Mode Notice */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gold-300 uppercase tracking-wider font-serif flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-gold-400" />
              Demo Mode Notice
            </h4>
            <div className="p-3.5 rounded-2xl glass-card border border-gold-500/30 text-xs text-blush-200 leading-snug space-y-2">
              <div className="flex items-center gap-1.5 text-gold-300 font-semibold">
                <Lock className="w-3.5 h-3.5" />
                <span>PAYMENT_MODE = demo</span>
              </div>
              <p>
                This application runs in development demo mode. All entry references and QR scans simulate mock transactions. No actual financial credentials are stored or processed.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-rose-500/20 flex flex-col sm:flex-row items-center justify-between text-xs text-blush-300/70 gap-4">
          <p>© {new Date().getFullYear()} LoveDraw Community. Crafted with deep love & romantic passion.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-rose-300">
              Made with <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400 mx-0.5" /> for lovers everywhere
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
