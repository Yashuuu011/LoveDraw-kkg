import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Users, Gift, ArrowRight, Zap, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { Draw } from '../types';
import CountdownTimer from './CountdownTimer';
import { useSound } from '../context/SoundContext';

interface DrawCardProps {
  draw: Draw;
}

export const DrawCard: React.FC<DrawCardProps> = ({ draw }) => {
  const isCompleted = draw.status === 'COMPLETED';
  const { playClick, playPortal } = useSound();

  return (
    <motion.div 
      whileHover={{ y: -10, scale: 1.02 }}
      className="bg-black/80 backdrop-blur-xl border border-marvel-purple/40 flex flex-col justify-between group shadow-[0_0_20px_rgba(108,66,152,0.15)] hover:shadow-[0_0_40px_rgba(247,143,63,0.3)] transition-all relative overflow-hidden"
    >
      {/* Magic Ring Hover Effect */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none mix-blend-screen">
        <motion.div 
          className="w-full aspect-square rounded-full border-2 border-marvel-gold/30 border-dashed"
          animate={{ rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Top Image & Portal View */}
      <div className="relative aspect-[4/3] overflow-hidden border-b-2 border-marvel-purple/50 z-10 p-[2px]">
        <div className="w-full h-full relative overflow-hidden clip-portal">
          <img
            src={draw.prizeImage}
            alt={draw.prizeTitle}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 saturate-150"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-marvel-purple/20 to-transparent mix-blend-multiply" />
        </div>

        {/* Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
          <span className="px-4 py-1.5 bg-black/70 backdrop-blur-md text-marvel-gold border border-marvel-gold text-[10px] font-bold uppercase tracking-widest shadow-[0_0_10px_var(--marvel-gold)]">
            {draw.type} ANOMALY
          </span>

          <span
            className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md border ${
              isCompleted
                ? 'bg-marvel-blue/30 text-white border-marvel-blue'
                : 'bg-marvel-red/30 text-white border-marvel-red'
            }`}
          >
            {isCompleted ? 'Timeline Closed' : 'Portal Open'}
          </span>
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent z-20">
          <p className="text-[10px] text-marvel-gold font-black uppercase tracking-[0.2em] flex items-center gap-2 mb-1">
            <Gift className="w-3.5 h-3.5" /> Artifact: {draw.prizeTitle}
          </p>
          <h3 className="font-serif text-2xl font-bold text-white group-hover:text-marvel-gold transition-colors leading-tight">
            {draw.title}
          </h3>
        </div>
      </div>

      {/* Card Content & Details */}
      <div className="p-6 space-y-6 flex-1 flex flex-col justify-between relative z-10">
        <p className="text-xs text-text-secondary line-clamp-3 leading-relaxed font-sans uppercase tracking-widest font-bold">
          {draw.description}
        </p>

        {/* Stats Panel */}
        <div className="bg-marvel-purple/10 border border-marvel-purple/30 p-4 space-y-3">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-white">
            <div className="flex items-center gap-2 text-marvel-purple">
              <Users className="w-4 h-4" />
              <span>{draw.participantsCount || 0} Entities</span>
            </div>
            <div className="text-right">
              <span className="text-marvel-gold text-sm">₹{draw.entryPriceINR}</span>
            </div>
          </div>

          {!isCompleted && (
            <div className="pt-3 border-t border-marvel-purple/30">
              <p className="text-[9px] text-marvel-gold font-bold uppercase tracking-[0.3em] mb-2 text-center">Portal Closes In</p>
              <CountdownTimer targetDate={draw.endDate} />
            </div>
          )}
        </div>

        {/* Completed Winner Preview */}
        {isCompleted && draw.winner && (
          <div className="p-4 bg-marvel-blue/10 border border-marvel-blue/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6 text-marvel-blue" />
              <div>
                <p className="text-[9px] text-marvel-blue uppercase font-bold tracking-widest">Chosen One</p>
                <p className="text-xs font-bold text-white uppercase tracking-widest">{draw.winner.user?.name}</p>
              </div>
            </div>
            <Zap className="w-4 h-4 text-marvel-gold animate-pulse" />
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          {isCompleted ? (
            <Link
              to={`/draw/${draw.id}/winner`}
              onClick={playPortal}
              className="w-full py-4 bg-black border-2 border-marvel-blue text-marvel-blue font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-marvel-blue hover:text-white transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Witness Reality
            </Link>
          ) : (
            <Link
              to={`/draw/${draw.id}`}
              onClick={playClick}
              className="w-full py-4 bg-marvel-purple border border-marvel-purple text-white font-bold text-xs uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(108,66,152,0.5)] hover:bg-marvel-gold hover:border-marvel-gold hover:text-black transition-all flex items-center justify-center gap-3 group/btn"
            >
              <span>Enter Portal</span>
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default DrawCard;
