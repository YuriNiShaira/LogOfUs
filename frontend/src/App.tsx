import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import JoinPage from './pages/JoinPage';
import Dashboard from './pages/Dashboard';
import YearDetailPage from './pages/YearDetailPage';
import BucketListPage from './pages/BucketListPage';
import MemoryCalendarPage from './pages/MemoryCalendarPage';
import WatchlistPlaylistPage from './pages/WatchlistPlaylistPage';
import GamesArenaPage from './pages/GamesArenaPage';
import ContactPage from './pages/ContactPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import RomanticBackground from './components/RomanticBackground';
import SupportButton from './components/SupportButton';
import './index.css';
import NotFoundPage from './pages/NotFoundPage';

const queryClient = new QueryClient();

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated === undefined) {
    return null;
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider> 
        <AuthProvider>
          <Router>
            <div className="relative min-h-screen">
              <RomanticBackground />
              <div className="relative z-10">
                <Toaster 
                  position="top-center"
                  toastOptions={{
                    style: {
                      background: '#FFF5F5',
                      color: '#FF6B6B',
                      border: '1px solid #FFB7B2',
                    },
                  }}
                />
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/join" element={<JoinPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/dashboard" element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  } />
                  <Route path="/year/:yearId" element={
                    <PrivateRoute>
                      <YearDetailPage />
                    </PrivateRoute>
                  } />
                  <Route path="/bucketlist" element={
                    <PrivateRoute>
                      <BucketListPage />
                    </PrivateRoute>
                  } />
                  <Route path="/calendar" element={
                    <PrivateRoute>
                      <MemoryCalendarPage />
                    </PrivateRoute>
                  } />
                  <Route path="/watchlist-playlist" element={
                    <PrivateRoute>
                      <WatchlistPlaylistPage />
                    </PrivateRoute>
                  } />
                  <Route path="/games" element={
                    <PrivateRoute>
                      <GamesArenaPage />
                    </PrivateRoute>
                  } />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
                <SupportButton />
              </div>
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>  
    </QueryClientProvider>
  );
}

export default App;