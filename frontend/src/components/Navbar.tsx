import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Calendar,
  LogOut,
  Home,
  ListChecks,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import ThemeToggle from './ThemeToggle';
import SettingsDropdown from './SettingsDropdown';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [isNavOpen, setIsNavOpen] = useState(false);

  const navItems: NavItem[] = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: ListChecks, label: 'Bucket List', path: '/bucketlist' },
    { icon: Calendar, label: 'Calendar', path: '/calendar' },
  ];

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      await api.post('/auth/logout/', { refresh: refreshToken });
    } catch (error) {
      // Still logout locally
    }
    logout();
    toast.success('See you soon! 💕');
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const isDark = theme === 'dark';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Cormorant+Garamond:wght@400;500;600;700&display=swap');

        .navbar-paper-texture {
          background-image: 
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 2px,
              rgba(139, 117, 91, 0.02) 2px,
              rgba(139, 117, 91, 0.02) 4px
            ),
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 1px,
              rgba(139, 117, 91, 0.01) 1px,
              rgba(139, 117, 91, 0.01) 2px
            );
        }

        .navbar-paper-texture::before {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          bottom: -1px;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(139, 117, 91, 0.15), transparent);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .diary-spine-left {
          position: relative;
          width: 4px;
          background: linear-gradient(90deg, rgba(139, 117, 91, 0.4), rgba(139, 117, 91, 0.15), rgba(139, 117, 91, 0.4));
          margin-right: 12px;
          border-radius: 2px;
          box-shadow: inset -1px 0 2px rgba(0, 0, 0, 0.1);
        }

        .nav-link-underline {
          position: relative;
        }

        .nav-link-underline::after {
          content: '';
          position: absolute;
          bottom: -6px;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, currentColor, transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
          filter: drop-shadow(0 0 3px currentColor);
        }

        .nav-link-underline:hover::after,
        .nav-link-underline.active::after {
          opacity: 1;
        }

        .logo-container {
          position: relative;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .logo-container:hover {
          transform: translateY(-2px);
        }

        .logo-shine {
          position: absolute;
          inset: 0;
          border-radius: 8px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 50%, rgba(255, 255, 255, 0.1) 100%);
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .logo-container:hover .logo-shine {
          opacity: 1;
        }

        .book-title-font {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 700;
          letter-spacing: 2.5px;
        }

        .ribbon-bookmark-left {
          position: absolute;
          left: -8px;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 40px;
          background: linear-gradient(180deg, rgba(220, 38, 38, 0.5) 0%, rgba(220, 38, 38, 0.3) 50%, rgba(220, 38, 38, 0.5) 100%);
          border-radius: 1.5px;
          box-shadow: 0 0 8px rgba(220, 38, 38, 0.25);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .logo-container:hover .ribbon-bookmark-left {
          opacity: 1;
        }

        .nav-item-hover {
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
        }

        .nav-item-hover:hover {
          transform: translateY(-3px);
        }

        .nav-item-active-indicator {
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #dc2626, transparent);
          border-radius: 1px;
          box-shadow: 0 0 6px rgba(220, 38, 38, 0.4);
        }

        .mobile-nav-ribbon {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: linear-gradient(180deg, rgba(220, 38, 38, 0.4), rgba(220, 38, 38, 0.2), rgba(220, 38, 38, 0.4));
          border-radius: 0 2px 2px 0;
          box-shadow: 1px 0 4px rgba(220, 38, 38, 0.2);
        }

        .page-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, currentColor, transparent);
          opacity: 0.15;
        }

        .nav-icon-glow {
          position: relative;
          transition: all 0.3s ease;
        }

        .nav-icon-glow:hover {
          filter: drop-shadow(0 0 6px rgba(220, 38, 38, 0.3));
        }
      `}</style>

      <motion.nav
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-all duration-300 navbar-paper-texture relative ${
          isDark
            ? 'bg-linear-to-r from-amber-950/75 via-amber-900/65 to-amber-950/75 border-amber-800/50 shadow-xl shadow-amber-950/30'
            : 'bg-linear-to-r from-amber-50/70 via-yellow-50/60 to-amber-50/70 border-amber-200/50 shadow-lg shadow-amber-200/15'
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
          {/* Logo Section */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="logo-container flex items-center gap-4 cursor-pointer shrink-0 group relative"
            onClick={() => navigate('/dashboard')}
          >
            <div className="ribbon-bookmark-left" />
            <div className="diary-spine-left" />
            <div className="relative w-11 h-11 rounded-lg flex items-center justify-center shadow-lg overflow-hidden">
              <div className="logo-shine" />
              <img 
                src="/favicon.svg" 
                alt="LogOfUs" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <h1 className={`text-2xl book-title-font leading-none transition-colors duration-300 ${
                isDark ? 'text-amber-100' : 'text-amber-900'
              }`}>
                LogOfUs
              </h1>
              <p className={`text-xs leading-none font-serif italic font-medium transition-colors duration-300 ${
                isDark ? 'text-amber-300/75' : 'text-amber-700/65'
              }`}>
                {user?.couple_name || 'Loading...'} 💕
              </p>
            </div>
          </motion.div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-2 mx-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <motion.button
                  key={item.path}
                  whileHover={{ scale: 1.06, y: -3 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => navigate(item.path)}
                  className={`nav-item-hover nav-link-underline relative flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 font-semibold tracking-wide text-sm group ${
                    active
                      ? `${isDark 
                          ? 'text-red-400 bg-red-950/40 shadow-md shadow-red-900/20' 
                          : 'text-red-600 bg-red-100/60 shadow-md shadow-red-200/30'
                        } ${active ? 'active' : ''}`
                      : isDark
                      ? 'text-amber-200/75 hover:bg-amber-900/40 hover:text-amber-100'
                      : 'text-amber-800/75 hover:bg-amber-100/50 hover:text-amber-900'
                  }`}
                >
                  <Icon className="nav-icon-glow w-4 h-4 transition-all" />
                  <span>{item.label}</span>
                  {active && <div className="nav-item-active-indicator" />}
                </motion.button>
              );
            })}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            <SettingsDropdown />
            <ThemeToggle />
            
            {/* Mobile menu button */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setIsNavOpen(!isNavOpen)}
              className={`md:hidden p-2.5 rounded-lg transition-all ${
                isDark
                  ? 'text-amber-300/70 hover:bg-amber-900/50'
                  : 'text-amber-800/70 hover:bg-amber-100/50'
              }`}
            >
              {isNavOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.06, y: -3 }}
              whileTap={{ scale: 0.94 }}
              onClick={handleLogout}
              className={`hidden md:flex nav-item-hover items-center gap-2 px-4 py-2.5 rounded-lg transition-all text-sm font-semibold tracking-wide ${
                isDark
                  ? 'text-amber-200/75 hover:bg-amber-900/40 hover:text-amber-100'
                  : 'text-amber-800/75 hover:bg-amber-100/50 hover:text-amber-900'
              }`}
            >
              <LogOut className="w-4 h-4" />
              <span>Leave</span>
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isNavOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className={`md:hidden border-t relative overflow-hidden ${
                isDark
                  ? 'border-amber-800/40 bg-linear-to-b from-amber-900/90 to-amber-950/90'
                  : 'border-amber-200/50 bg-linear-to-b from-amber-50/90 to-yellow-50/90'
              } backdrop-blur-xl`}
            >
              <div className="mobile-nav-ribbon" />
              <div className="px-6 py-4 space-y-1">
                {navItems.map((item, idx) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <motion.button
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.08 }}
                      whileHover={{ x: 6, scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        navigate(item.path);
                        setIsNavOpen(false);
                      }}
                      className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-lg transition-all relative group font-semibold tracking-wide ${
                        active
                          ? `${isDark 
                              ? 'bg-red-950/50 text-red-400 shadow-md shadow-red-900/20' 
                              : 'bg-red-100/70 text-red-600 shadow-md shadow-red-200/30'
                            }`
                          : isDark
                          ? 'text-amber-200/75 hover:bg-amber-900/50'
                          : 'text-amber-800/75 hover:bg-amber-100/60'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{item.label}</span>
                      {active && (
                        <motion.div
                          layoutId="mobile-active"
                          className="absolute right-3 h-2 w-2 rounded-full bg-red-500 shadow-lg shadow-red-500/50"
                        />
                      )}
                    </motion.button>
                  );
                })}

                <div className={`my-2 page-divider ${isDark ? 'text-amber-700' : 'text-amber-300'}`} />

                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.24 }}
                  whileHover={{ x: 6, scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    handleLogout();
                    setIsNavOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-lg transition-all font-semibold tracking-wide ${
                    isDark
                      ? 'text-amber-200/75 hover:bg-amber-900/50'
                      : 'text-amber-800/75 hover:bg-amber-100/60'
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Leave</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
};

export default Navbar;