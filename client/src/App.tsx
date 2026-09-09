import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import { SoundProvider } from './context/SoundContext';

import CustomCursor from './components/CustomCursor';
import PageTransition from './components/PageTransition';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import DailyLove from './pages/DailyLove';
import Draws from './pages/Draws';
import DrawDetail from './pages/DrawDetail';
import WinnerReveal from './pages/WinnerReveal';
import Memories from './pages/Memories';
import Auth from './pages/Auth';
import AdminDashboard from './pages/AdminDashboard';
import Chat from './pages/Chat';
import Friends from './pages/Friends';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/daily-love" element={<PageTransition><DailyLove /></PageTransition>} />
        <Route path="/draws" element={<PageTransition><Draws /></PageTransition>} />
        <Route path="/draw/:id" element={<PageTransition><DrawDetail /></PageTransition>} />
        <Route path="/draw/:id/winner" element={<PageTransition><WinnerReveal /></PageTransition>} />
        <Route path="/memories" element={<PageTransition><Memories /></PageTransition>} />
        <Route path="/friends" element={<ProtectedRoute><PageTransition><Friends /></PageTransition></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><PageTransition><Chat /></PageTransition></ProtectedRoute>} />
        <Route path="/login" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/forgot-password" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/profile" element={<ProtectedRoute><PageTransition><Profile /></PageTransition></ProtectedRoute>} />
        <Route path="/admin" element={<PageTransition><AdminDashboard /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <SoundProvider>
        <AuthProvider>
          <SocketProvider>
            <ToastProvider>
              <Router>
                <CustomCursor />
                <div className="relative min-h-screen flex flex-col justify-between">
                  <div className="film-grain" />
                  {/* Scanline overlay for cinematic HUD effect */}
                  <div className="scanlines" />

                  {/* Top Navigation HUD */}
                  <Navbar />

                  {/* Main Application Body */}
                  <main className="flex-grow relative z-10">
                    <AnimatedRoutes />
                  </main>

                  {/* Footer */}
                  <Footer />
                </div>
              </Router>
            </ToastProvider>
          </SocketProvider>
        </AuthProvider>
      </SoundProvider>
    </ThemeProvider>
  );
};

export default App;
