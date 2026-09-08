import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isExpired: false
      });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (timeLeft.isExpired) {
    return (
      <div className="px-6 py-3 rounded-2xl glass-card border border-rose-500/40 text-center">
        <span className="text-sm font-semibold text-rose-300">Draw Ended — Selecting Winner! 🎉</span>
      </div>
    );
  }

  const TimeUnit = ({ label, value }: { label: string; value: number }) => (
    <div className="flex flex-col items-center">
      <div className="w-14 sm:w-18 h-14 sm:h-18 rounded-2xl glass-card bg-burgundy-900/80 border border-rose-400/30 flex items-center justify-center shadow-lg relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
        <span className="font-serif text-xl sm:text-3xl font-bold text-white group-hover:scale-110 transition-transform">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-[10px] sm:text-xs font-medium text-gold-300 uppercase tracking-widest mt-2">
        {label}
      </span>
    </div>
  );

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      <TimeUnit label="Days" value={timeLeft.days} />
      <span className="text-xl sm:text-2xl font-bold text-rose-400 -mt-6">:</span>
      <TimeUnit label="Hours" value={timeLeft.hours} />
      <span className="text-xl sm:text-2xl font-bold text-rose-400 -mt-6">:</span>
      <TimeUnit label="Mins" value={timeLeft.minutes} />
      <span className="text-xl sm:text-2xl font-bold text-rose-400 -mt-6">:</span>
      <TimeUnit label="Secs" value={timeLeft.seconds} />
    </div>
  );
};

export default CountdownTimer;
