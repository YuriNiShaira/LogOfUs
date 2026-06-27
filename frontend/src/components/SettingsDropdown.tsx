import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Heart,
  Lock,
  Palette,
  LogOut,
  Save,
  Eye,
  EyeOff,
  Users,
  Settings,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { api } from '../services/api';
import toast from 'react-hot-toast';

interface UserProfile {
  id: number;
  username: string;
  display_name: string;
  couple: {
    id: number;
    name: string;
    anniversary_date: string;
    invite_code: string;
    member_count: number;
    partner1_name: string | null;
    partner2_name: string | null;
  } | null;
}

interface PasswordChangeData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

const SettingsDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'couple' | 'security' | 'preferences'>('profile');
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Profile state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [coupleName, setCoupleName] = useState('');
  const [anniversaryDate, setAnniversaryDate] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [hasPartner, setHasPartner] = useState(false);
  
  // Password state
  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState({
    enablePetals: true,
    enableAnimations: true,
    enableNotifications: true,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch profile data - with better error handling
  useEffect(() => {
    if (isOpen) {
      const fetchProfile = async () => {
        try {
          setLoading(true);
          setError(null);
          
          // Try to get profile data
          try {
            const [profileRes, coupleRes] = await Promise.all([
              api.get('/auth/profile/'),
              api.get('/auth/couple-info/'),
            ]);
            
            setProfile(profileRes.data);
            setDisplayName(profileRes.data.display_name || '');
            
            const couple = coupleRes.data;
            setCoupleName(couple.name || '');
            setAnniversaryDate(couple.anniversary_date || '');
            setInviteCode(couple.invite_code || '');
            setPartnerName(couple.partner_name || '');
            setHasPartner(couple.member_count >= 2);
            
          } catch (err: any) {
            console.warn('Profile endpoints not available yet:', err.message);
            setError('Profile settings coming soon!');
            
            // Use existing user data as fallback
            if (user) {
              setDisplayName(user.display_name || '');
              setCoupleName(user.couple_name || '');
            }
          }
          
        } catch (error: any) {
          console.error('Error fetching profile:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    }
  }, [isOpen, user]);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('user_settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch('/auth/profile/', { display_name: displayName });
      
      if (profile?.couple?.id) {
        await api.patch('/auth/update-couple/', {
          name: coupleName,
          anniversary_date: anniversaryDate,
        });
      }
      toast.success('Profile updated! 💕');
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error('Profile settings are not available yet. Please check back soon!');
      } else {
        toast.error(error.response?.data?.error || 'Failed to update profile');
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordData.new_password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setSaving(true);
    try {
      await api.post('/auth/change-password/', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      toast.success('Password changed! 🔒');
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error('Password change is not available yet. Please check back soon!');
      } else {
        toast.error(error.response?.data?.error || 'Failed to change password');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSettingToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    localStorage.setItem('user_settings', JSON.stringify({
      ...settings,
      [key]: !settings[key],
    }));
  };

  const copyInviteCode = async () => {
    if (!inviteCode) return;
    try {
      await navigator.clipboard.writeText(inviteCode);
      toast.success('Invite code copied! 💕');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleCoupleUpdate = async () => {
    if (!profile?.couple?.id) {
      toast.error('No couple found');
      return;
    }
    
    setSaving(true);
    try {
      await api.patch('/auth/update-couple/', {
        name: coupleName,
        anniversary_date: anniversaryDate,
      });
      toast.success('Couple info updated! 💕');
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error('Couple settings are not available yet. Please check back soon!');
      } else {
        toast.error(error.response?.data?.error || 'Failed to update couple info');
      }
    } finally {
      setSaving(false);
    }
  };

  const isDark = theme === 'dark';

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'couple' as const, label: 'Couple', icon: Heart },
    { id: 'security' as const, label: 'Security', icon: Lock },
    { id: 'preferences' as const, label: 'Preferences', icon: Palette },
  ];

  return (
    <div className="relative z-10" ref={dropdownRef}>
      {/* Settings Button */}
      <motion.button
        whileHover={{ scale: 1.06, y: -2 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 font-semibold tracking-wide text-sm ${
          isDark
            ? 'text-amber-200/80 hover:bg-amber-900/40 hover:text-amber-100 border border-amber-700/20 hover:border-amber-600/40'
            : 'text-amber-800/80 hover:bg-amber-100/50 hover:text-amber-900 border border-amber-200/30 hover:border-amber-300/50'
        } ${isOpen ? (isDark ? 'bg-amber-900/40 border-amber-600/40' : 'bg-amber-100/50 border-amber-300/50') : ''}`}
      >
        <Settings className="w-4 h-4" />
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`absolute right-0 top-12 w-[480px] max-h-[90vh] overflow-hidden rounded-xl shadow-2xl border ${
              isDark
                ? 'bg-[#2a2626] border-stone-800 shadow-stone-900/50'
                : 'bg-white border-stone-200 shadow-2xl'
            }`}
          >
            <div className="flex h-[500px]">
              {/* Sidebar */}
              <div className={`w-36 shrink-0 p-3 border-r ${
                isDark ? 'border-stone-800' : 'border-stone-200'
              }`}>
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-serif transition-all ${
                        isActive
                          ? isDark
                            ? 'bg-rose-900/40 text-rose-300'
                            : 'bg-rose-50 text-rose-600'
                          : isDark
                            ? 'text-stone-400 hover:bg-stone-800 hover:text-stone-200'
                            : 'text-stone-600 hover:bg-stone-100 hover:text-stone-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
                
                <div className={`my-3 border-t ${isDark ? 'border-stone-800' : 'border-stone-200'}`} />
                
                <button
                  onClick={() => {
                    const refreshToken = localStorage.getItem('refreshToken');
                    if (refreshToken) {
                      api.post('/auth/logout/', { refresh: refreshToken }).catch(() => {});
                    }
                    logout();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-serif text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-8 h-8 border-2 border-rose-300 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mb-4">
                      <Settings className="w-8 h-8 text-amber-500 dark:text-amber-400" />
                    </div>
                    <h3 className={`font-serif text-lg mb-2 ${isDark ? 'text-amber-200' : 'text-amber-800'}`}>
                      Settings Coming Soon!
                    </h3>
                    <p className={`text-sm font-serif italic ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                      We're adding more customization options for you.
                    </p>
                    <button
                      onClick={() => setError(null)}
                      className={`mt-4 px-4 py-2 rounded-lg font-serif text-sm transition-all ${
                        isDark
                          ? 'bg-amber-800/50 text-amber-200 hover:bg-amber-700/50'
                          : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                      }`}
                    >
                      Try again
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                      <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <h3 className={`font-serif text-lg ${isDark ? 'text-rose-200' : 'text-rose-800'}`}>
                          Profile
                        </h3>
                        <div>
                          <label className={`block text-xs font-serif mb-1 ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                            Username
                          </label>
                          <div className={`px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-stone-800 border-stone-700 text-stone-400' : 'bg-stone-50 border-stone-200 text-stone-500'}`}>
                            {profile?.username || user?.username || 'Guest'}
                          </div>
                        </div>
                        <div>
                          <label className={`block text-xs font-serif mb-1 ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                            Display Name
                          </label>
                          <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className={`w-full px-3 py-2 rounded-lg border text-sm transition-all focus:ring-2 focus:ring-rose-300 outline-none ${
                              isDark ? 'bg-stone-800 border-stone-700 text-stone-200' : 'bg-white border-stone-200 text-stone-800'
                            }`}
                            placeholder="Your display name"
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={saving}
                          className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg font-serif text-sm transition-all ${
                            isDark
                              ? 'bg-rose-900 text-rose-50 hover:bg-rose-800'
                              : 'bg-rose-600 text-white hover:bg-rose-700'
                          } disabled:opacity-50`}
                        >
                          {saving ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              Save
                            </>
                          )}
                        </button>
                      </form>
                    )}

                    {/* Couple Tab */}
                    {activeTab === 'couple' && (
                      <div className="space-y-4">
                        <h3 className={`font-serif text-lg ${isDark ? 'text-rose-200' : 'text-rose-800'}`}>
                          Couple
                        </h3>
                        <div>
                          <label className={`block text-xs font-serif mb-1 ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                            Couple Name
                          </label>
                          <input
                            type="text"
                            value={coupleName}
                            onChange={(e) => setCoupleName(e.target.value)}
                            className={`w-full px-3 py-2 rounded-lg border text-sm transition-all focus:ring-2 focus:ring-rose-300 outline-none ${
                              isDark ? 'bg-stone-800 border-stone-700 text-stone-200' : 'bg-white border-stone-200 text-stone-800'
                            }`}
                            placeholder="Your couple name"
                          />
                        </div>
                        <div>
                          <label className={`block text-xs font-serif mb-1 ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                            Anniversary Date
                          </label>
                          <input
                            type="date"
                            value={anniversaryDate}
                            onChange={(e) => setAnniversaryDate(e.target.value)}
                            className={`w-full px-3 py-2 rounded-lg border text-sm transition-all focus:ring-2 focus:ring-rose-300 outline-none ${
                              isDark ? 'bg-stone-800 border-stone-700 text-stone-200' : 'bg-white border-stone-200 text-stone-800'
                            }`}
                          />
                        </div>
                        <div className={`p-3 rounded-lg border ${isDark ? 'border-rose-900/30 bg-rose-900/10' : 'border-rose-200 bg-rose-50'}`}>
                          <div className="flex items-center gap-2">
                            <Users className={`w-4 h-4 ${isDark ? 'text-rose-300' : 'text-rose-500'}`} />
                            <p className={`text-sm font-serif ${isDark ? 'text-rose-200' : 'text-rose-800'}`}>
                              {hasPartner ? `💕 ${partnerName}` : '⏳ Waiting for partner'}
                            </p>
                          </div>
                        </div>
                        {!hasPartner && inviteCode && (
                          <div className="flex gap-2">
                            <div className={`flex-1 px-3 py-2 rounded-lg border font-mono text-center text-sm tracking-widest ${
                              isDark ? 'bg-stone-800 border-stone-700 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-700'
                            }`}>
                              {inviteCode}
                            </div>
                            <button
                              onClick={copyInviteCode}
                              className={`px-3 py-2 rounded-lg font-serif text-sm transition-all ${
                                isDark ? 'bg-rose-900 text-rose-50 hover:bg-rose-800' : 'bg-rose-600 text-white hover:bg-rose-700'
                              }`}
                            >
                              Copy
                            </button>
                          </div>
                        )}
                        <button
                          onClick={handleCoupleUpdate}
                          disabled={saving}
                          className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg font-serif text-sm transition-all ${
                            isDark
                              ? 'bg-rose-900 text-rose-50 hover:bg-rose-800'
                              : 'bg-rose-600 text-white hover:bg-rose-700'
                          } disabled:opacity-50`}
                        >
                          <Save className="w-4 h-4" />
                          Save
                        </button>
                      </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                      <form onSubmit={handlePasswordChange} className="space-y-4">
                        <h3 className={`font-serif text-lg ${isDark ? 'text-rose-200' : 'text-rose-800'}`}>
                          Change Password
                        </h3>
                        <div>
                          <label className={`block text-xs font-serif mb-1 ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                            Current Password
                          </label>
                          <div className="relative">
                            <input
                              type={showCurrentPassword ? 'text' : 'password'}
                              value={passwordData.current_password}
                              onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                              className={`w-full px-3 py-2 rounded-lg border text-sm transition-all focus:ring-2 focus:ring-rose-300 outline-none pr-10 ${
                                isDark ? 'bg-stone-800 border-stone-700 text-stone-200' : 'bg-white border-stone-200 text-stone-800'
                              }`}
                              placeholder="Current password"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400"
                            >
                              {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className={`block text-xs font-serif mb-1 ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                            New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showNewPassword ? 'text' : 'password'}
                              value={passwordData.new_password}
                              onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                              className={`w-full px-3 py-2 rounded-lg border text-sm transition-all focus:ring-2 focus:ring-rose-300 outline-none pr-10 ${
                                isDark ? 'bg-stone-800 border-stone-700 text-stone-200' : 'bg-white border-stone-200 text-stone-800'
                              }`}
                              placeholder="New password (min 8 chars)"
                              required
                              minLength={8}
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400"
                            >
                              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className={`block text-xs font-serif mb-1 ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                            Confirm Password
                          </label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              value={passwordData.confirm_password}
                              onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                              className={`w-full px-3 py-2 rounded-lg border text-sm transition-all focus:ring-2 focus:ring-rose-300 outline-none pr-10 ${
                                isDark ? 'bg-stone-800 border-stone-700 text-stone-200' : 'bg-white border-stone-200 text-stone-800'
                              }`}
                              placeholder="Confirm new password"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400"
                            >
                              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <button
                          type="submit"
                          disabled={saving}
                          className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg font-serif text-sm transition-all ${
                            isDark
                              ? 'bg-rose-900 text-rose-50 hover:bg-rose-800'
                              : 'bg-rose-600 text-white hover:bg-rose-700'
                          } disabled:opacity-50`}
                        >
                          {saving ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <Lock className="w-4 h-4" />
                              Change Password
                            </>
                          )}
                        </button>
                      </form>
                    )}

                    {/* Preferences Tab */}
                    {activeTab === 'preferences' && (
                      <div className="space-y-4">
                        <h3 className={`font-serif text-lg ${isDark ? 'text-rose-200' : 'text-rose-800'}`}>
                          Preferences
                        </h3>
                        
                        {/* Dark Mode */}
                        <div className="flex items-center justify-between py-2 border-b border-stone-200 dark:border-stone-700">
                          <div>
                            <p className={`font-serif text-sm ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>Dark Mode</p>
                            <p className={`text-xs font-serif italic ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>Toggle theme</p>
                          </div>
                          <button
                            onClick={toggleTheme}
                            className={`relative w-10 h-5 rounded-full transition-all ${isDark ? 'bg-rose-600' : 'bg-stone-300'}`}
                          >
                            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${isDark ? 'right-0.5' : 'left-0.5'}`} />
                          </button>
                        </div>

                        {/* Falling Petals */}
                        <div className="flex items-center justify-between py-2 border-b border-stone-200 dark:border-stone-700">
                          <div>
                            <p className={`font-serif text-sm ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>Falling Petals</p>
                            <p className={`text-xs font-serif italic ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>Romantic animation</p>
                          </div>
                          <button
                            onClick={() => handleSettingToggle('enablePetals')}
                            className={`relative w-10 h-5 rounded-full transition-all ${settings.enablePetals ? 'bg-rose-600' : 'bg-stone-300'}`}
                          >
                            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${settings.enablePetals ? 'right-0.5' : 'left-0.5'}`} />
                          </button>
                        </div>

                        {/* Animations */}
                        <div className="flex items-center justify-between py-2 border-b border-stone-200 dark:border-stone-700">
                          <div>
                            <p className={`font-serif text-sm ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>Animations</p>
                            <p className={`text-xs font-serif italic ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>Smooth transitions</p>
                          </div>
                          <button
                            onClick={() => handleSettingToggle('enableAnimations')}
                            className={`relative w-10 h-5 rounded-full transition-all ${settings.enableAnimations ? 'bg-rose-600' : 'bg-stone-300'}`}
                          >
                            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${settings.enableAnimations ? 'right-0.5' : 'left-0.5'}`} />
                          </button>
                        </div>

                        {/* Notifications */}
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className={`font-serif text-sm ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>Notifications</p>
                            <p className={`text-xs font-serif italic ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>Love diary updates</p>
                          </div>
                          <button
                            onClick={() => handleSettingToggle('enableNotifications')}
                            className={`relative w-10 h-5 rounded-full transition-all ${settings.enableNotifications ? 'bg-rose-600' : 'bg-stone-300'}`}
                          >
                            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${settings.enableNotifications ? 'right-0.5' : 'left-0.5'}`} />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettingsDropdown;