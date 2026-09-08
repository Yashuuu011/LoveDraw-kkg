import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import FloatingHearts from './components/FloatingHearts';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import DailyLove from './pages/DailyLove';
import Draws from './pages/Draws';
import DrawDetail from './pages/DrawDetail';
import WinnerReveal from './pages/WinnerReveal';
import Memories from './pages/Memories';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import AdminDashboard from './pages/AdminDashboard';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <div className="relative min-h-screen flex flex-col justify-between">
            {/* Ambient Background Particles */}
            <FloatingHearts />

            {/* Top Navigation */}
            <Navbar />

            {/* Main Application Body */}
            <main className="flex-grow relative z-10">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/daily-love" element={<DailyLove />} />
                <Route path="/draws" element={<Draws />} />
                <Route path="/draw/:id" element={<DrawDetail />} />
                <Route path="/draw/:id/winner" element={<WinnerReveal />} />
                <Route path="/memories" element={<Memories />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/login" element={<Auth />} />
                <Route path="/register" element={<Auth />} />
                <Route path="/forgot-password" element={<Auth />} />
                <Route path="/admin" element={<AdminDashboard />} />
              </Routes>
            </main>

            {/* Footer */}
            <Footer />
          </div>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
