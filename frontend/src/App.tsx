// frontend/src/App.tsx
import React, { useEffect } from 'react';
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
import ContactPage from './pages/ContactPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import RomanticBackground from './components/RomanticBackground';
import SupportButton from './components/SupportButton';
import './index.css';
import NotFoundPage from './pages/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated === undefined) {
    return null;
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
};

function App() {
  useEffect(() => {
    // Detect if device is low performance and add classes to body
    const checkPerformance = () => {
      const isMobile = window.innerWidth < 768;
      
      // Check for low-end devices
      let isLowMemory = false;
      try {
        const memory = (performance as any).memory;
        if (memory && memory.jsHeapSizeLimit < 2 * 1024 * 1024 * 1024) {
          isLowMemory = true;
        }
      } catch (e) {
        // Memory API not available
      }
      
      if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
        isLowMemory = true;
      }
      
      if (isMobile || isLowMemory) {
        document.body.classList.add('reduce-motion');
        document.body.classList.add('reduce-effects');
        
        // Also reduce Framer Motion animations via CSS
        document.body.style.setProperty('--animation-duration', '0.01ms');
      } else {
        document.body.classList.remove('reduce-motion');
        document.body.classList.remove('reduce-effects');
      }
    };
    
    checkPerformance();
    
    const handleResize = () => {
      if (window.innerWidth < 768) {
        document.body.classList.add('reduce-motion');
        document.body.classList.add('reduce-effects');
      } else {
        document.body.classList.remove('reduce-motion');
        // Only remove reduce-effects if not low memory
        try {
          const memory = (performance as any).memory;
          if (!memory || memory.jsHeapSizeLimit >= 2 * 1024 * 1024 * 1024) {
            document.body.classList.remove('reduce-effects');
          }
        } catch (e) {
          document.body.classList.remove('reduce-effects');
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider> 
        <AuthProvider>
          <Router>
            <div className="relative min-h-screen gpu-accelerated">
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