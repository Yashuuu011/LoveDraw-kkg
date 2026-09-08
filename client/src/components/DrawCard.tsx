import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Users, Gift, Trophy, ArrowRight } from 'lucide-react';
import { Draw } from '../types';
import CountdownTimer from './CountdownTimer';

interface DrawCardProps {
  draw: Draw;
}

export const DrawCard: React.FC<DrawCardProps> = ({ draw }) => {
  const isCompleted = draw.status === 'COMPLETED';

  return (
    <div className="glass-card rounded-3xl overflow-hidden border border-rose-400/20 flex flex-col justify-between group">
      {/* Top Image & Badge */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={draw.prizeImage}
          alt={draw.prizeTitle}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-plum-950 via-plum-950/40 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-burgundy-900/90 backdrop-blur-md text-gold-300 border border-gold-400/40 shadow-lg">
            {draw.type} DRAW
          </span>

          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border ${
              isCompleted
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                : 'bg-rose-500/20 text-rose-300 border-rose-400/30'
            }`}
          >
            {isCompleted ? 'Winner Revealed 🎉' : 'Active Entry 🎟️'}
          </span>
        </div>

        {/* Bottom Image Overlay Title */}
        <div className="absolute bottom-4 left-4 right-4 space-y-1">
          <p className="text-xs text-rose-300 font-medium flex items-center gap-1">
            <Gift className="w-3.5 h-3.5 text-gold-400" />
            Prize: {draw.prizeTitle}
          </p>
          <h3 className="font-serif text-xl font-bold text-white group-hover:text-rose-200 transition-colors">
            {draw.title}
          </h3>
        </div>
      </div>

      {/* Card Content & Details */}
      <div className="p-6 space-y-5 flex-1 flex flex-col justify-between">
        <p className="text-sm text-blush-200/90 line-clamp-2 leading-relaxed">
          {draw.description}
        </p>

        {/* Participant & Pricing Stats */}
        <div className="flex items-center justify-between text-xs text-blush-200 pt-3 border-t border-rose-500/20">
          <div className="flex items-center gap-1.5 text-blush-200">
            <Users className="w-4 h-4 text-rose-400" />
            <span>{draw.participantsCount || 0} Couples Joined</span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-blush-300 block uppercase">Demo Entry</span>
            <span className="text-sm font-bold text-gold-300">₹{draw.entryPriceINR}</span>
          </div>
        </div>

        {/* Countdown preview if active */}
        {!isCompleted && (
          <div className="pt-2">
            <p className="text-[11px] text-center text-rose-300 font-medium mb-2">Draw Countdown</p>
            <CountdownTimer targetDate={draw.endDate} />
          </div>
        )}

        {/* Completed Winner Preview */}
        {isCompleted && draw.winner && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-400/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Trophy className="w-5 h-5 text-gold-400" />
              <div>
                <p className="text-[10px] text-gold-300 uppercase font-semibold">Winner</p>
                <p className="text-xs font-bold text-white">{draw.winner.user?.name}</p>
              </div>
            </div>
            <span className="text-xs text-rose-300 font-medium">Congrats! ❤️</span>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          {isCompleted ? (
            <Link
              to={`/draw/${draw.id}/winner`}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-burgundy-950 font-bold text-sm shadow-lg shadow-gold-900/30 flex items-center justify-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Watch Winner Reveal</span>
            </Link>
          ) : (
            <Link
              to={`/draw/${draw.id}`}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-burgundy-600 hover:from-rose-400 hover:to-burgundy-500 text-white font-semibold text-sm shadow-lg shadow-rose-900/40 flex items-center justify-center gap-2 transition-all group-hover:translate-x-0.5"
            >
              <span>View Draw Details</span>
              <ArrowRight className="w-4 h-4 text-rose-200" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default DrawCard;
