import React from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();

  // Determine transition colors based on path for thematic consistency
  let colorClass = 'bg-primary';
  if (location.pathname.includes('draw')) colorClass = 'bg-marvel-purple';
  if (location.pathname.includes('friends')) colorClass = 'bg-marvel-blue';
  if (location.pathname.includes('profile')) colorClass = 'bg-marvel-gold';
  if (location.pathname.includes('memories')) colorClass = 'bg-marvel-silver';

  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-full"
    >
      {/* Quick cinematic wipe transition */}
      <motion.div
        className={`fixed inset-0 z-[150] ${colorClass} pointer-events-none origin-bottom`}
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        exit={{ scaleY: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
      {children}
    </motion.div>
  );
};

export default PageTransition;
