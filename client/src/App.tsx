import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
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
import Auth from './pages/Auth';
import AdminDashboard from './pages/AdminDashboard';
import Chat from './pages/Chat';
import ProtectedRoute from './components/ProtectedRoute';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
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
                <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
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
    </ThemeProvider>
  );
};

export default App;
