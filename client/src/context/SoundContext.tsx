import React, { createContext, useContext, useState, useEffect } from 'react';

interface SoundContextType {
  soundEnabled: boolean;
  toggleSound: () => void;
  playClick: () => void;
  playPortal: () => void;
  playNotification: () => void;
  playSuccess: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('marvelSoundEnabled');
    if (saved === 'true') setSoundEnabled(true);
  }, []);

  const toggleSound = () => {
    const newVal = !soundEnabled;
    setSoundEnabled(newVal);
    localStorage.setItem('marvelSoundEnabled', String(newVal));
  };

  // Sound generator using Web Audio API so we don't need external assets
  const playTone = (frequency: number, type: OscillatorType, duration: number, vol = 0.1) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);

      gainNode.gain.setValueAtTime(vol, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.error('Audio failed', e);
    }
  };

  const playClick = () => playTone(600, 'sine', 0.1, 0.05); // Short HUD click
  const playPortal = () => playTone(200, 'lowpass' as any || 'sine', 1.5, 0.2); // Deep whoosh
  const playNotification = () => { playTone(800, 'sine', 0.1, 0.05); setTimeout(() => playTone(1200, 'sine', 0.2, 0.05), 100); }; // Double ping
  const playSuccess = () => playTone(440, 'triangle', 0.5, 0.1); // Warm chord

  return (
    <SoundContext.Provider value={{ soundEnabled, toggleSound, playClick, playPortal, playNotification, playSuccess }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};
