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
  Settings,
  BookHeart
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

  // Fetch profile data
  useEffect(() => {
    if (isOpen) {
      const fetchProfile = async () => {
        try {
          setLoading(true);
          setError(null);
          
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

  // Handle setting toggle with storage event
  const handleSettingToggle = (key: keyof typeof settings) => {
    const newValue = !settings[key];
    const newSettings = { ...settings, [key]: newValue };
    setSettings(newSettings);
    
    localStorage.setItem('user_settings', JSON.stringify(newSettings));
    
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'user_settings',
      newValue: JSON.stringify(newSettings),
    }));
  };

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
      toast.success('Journal updated! 🖋️');
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
      toast.success('Diary locked securely! 🔒');
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error('Password change is not available yet.');
      } else {
        toast.error(error.response?.data?.error || 'Failed to change password');
      }
    } finally {
      setSaving(false);
    }
  };

  const copyInviteCode = async () => {
    if (!inviteCode) return;
    try {
      await navigator.clipboard.writeText(inviteCode);
      toast.success('Invite code copied! Send it to your partner 💕');
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
      toast.success('Our Story updated! 📖');
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error('Couple settings are not available yet.');
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
    { id: 'couple' as const, label: 'Couple', icon: BookHeart },
    { id: 'security' as const, label: 'Privacy', icon: Lock },
    { id: 'preferences' as const, label: 'Preferences', icon: Palette },
  ];

  return (
    <div className="relative z-50" ref={dropdownRef}>
      {/* Settings Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 p-2.5 rounded-full transition-all duration-300 shadow-sm ${
          isDark
            ? 'bg-[#2a2626] text-amber-200/80 hover:text-amber-100 hover:shadow-amber-900/20 border border-stone-800'
            : 'bg-[#fdfbf7] text-amber-900/70 hover:text-amber-900 hover:shadow-amber-200/50 border border-stone-200'
        } ${isOpen ? 'ring-2 ring-rose-400/50' : ''}`}
      >
        <Settings className="w-5 h-5" />
      </motion.button>

      {/* Dropdown / Journal Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -15, rotateX: -10, transformPerspective: 1000 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, y: -10, rotateX: -10, transition: { duration: 0.15 } }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`absolute right-0 top-14 w-[520px] max-h-[85vh] overflow-hidden rounded-xl shadow-2xl border ${
              isDark
                ? 'bg-[#242121] border-[#3a3535] shadow-black/60'
                : 'bg-[#faf8f5] border-[#e8e4dc] shadow-stone-300/60'
            }`}
          >
            <div className="flex h-[520px]">
              
              {/* Sidebar Tabs (Looks like journal bookmarks) */}
              <div className={`w-40 shrink-0 py-6 px-3 flex flex-col gap-1 border-r relative z-10 ${
                isDark ? 'border-[#3a3535] bg-[#1c1a1a]/50' : 'border-[#e8e4dc] bg-[#f2efe9]/50'
              }`}>
                {/* Decorative binding line */}
                <div className={`absolute right-0 top-0 bottom-0 w-[1px] shadow-[-2px_0_4px_rgba(0,0,0,0.05)] ${isDark ? 'bg-black/20' : 'bg-black/5'}`} />

                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-l-xl text-sm font-serif transition-all relative ${
                        isActive
                          ? isDark
                            ? 'bg-[#242121] text-rose-300 shadow-[-4px_0_10px_rgba(0,0,0,0.1)] translate-x-1'
                            : 'bg-[#faf8f5] text-rose-600 shadow-[-4px_0_10px_rgba(0,0,0,0.03)] translate-x-1'
                          : isDark
                            ? 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
                            : 'text-stone-500 hover:text-stone-800 hover:bg-black/5'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse duration-1000' : ''}`} />
                      <span className="tracking-wide">{tab.label}</span>
                      
                      {/* Active tab extending element */}
                      {isActive && (
                        <div className={`absolute -right-3 top-0 bottom-0 w-3 ${isDark ? 'bg-[#242121]' : 'bg-[#faf8f5]'}`} />
                      )}
                    </button>
                  );
                })}
                
                <div className="mt-auto pt-4 border-t border-stone-300/30 dark:border-stone-700/50">
                  <button
                    onClick={() => {
                      const refreshToken = localStorage.getItem('refreshToken');
                      if (refreshToken) {
                        api.post('/auth/logout/', { refresh: refreshToken }).catch(() => {});
                      }
                      logout();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-serif text-rose-500/80 hover:text-rose-600 hover:bg-rose-500/10 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="tracking-wide">Close Diary</span>
                  </button>
                </div>
              </div>

              {/* Content Area (The "Paper") */}
              <div className="flex-1 overflow-y-auto p-8 relative">
                {/* Subtle paper texture/lines overlay could go here */}
                
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-6 h-6 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center h-full text-center opacity-80">
                    <BookHeart className="w-12 h-12 text-rose-400/50 mb-4" />
                    <h3 className={`font-serif text-xl mb-2 ${isDark ? 'text-amber-100' : 'text-amber-900'}`}>
                      Pages Still Blank
                    </h3>
                    <p className={`text-sm font-serif italic mb-6 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                      We're still binding these pages. Check back soon.
                    </p>
                    <button
                      onClick={() => setError(null)}
                      className="px-6 py-2 rounded-full font-serif text-sm border border-rose-300/50 hover:bg-rose-300/10 transition-all text-rose-500"
                    >
                      Turn back
                    </button>
                  </div>
                ) : (
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                      <form onSubmit={handleProfileUpdate} className="space-y-6">
                        <div className="pb-4 border-b border-stone-200/50 dark:border-stone-700/50">
                          <h3 className={`font-serif text-2xl ${isDark ? 'text-rose-200' : 'text-rose-800'}`}>
                            My Identity
                          </h3>
                          <p className={`text-xs font-serif italic mt-1 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                            How you appear in the pages of this journal.
                          </p>
                        </div>

                        <div className="space-y-5">
                          <div>
                            <label className={`block text-xs font-serif tracking-widest uppercase mb-2 ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                              Author Handle
                            </label>
                            <div className={`px-4 py-3 rounded-lg font-mono text-sm ${isDark ? 'bg-black/20 text-stone-400' : 'bg-stone-100/50 text-stone-500'}`}>
                              @{profile?.username || user?.username || 'guest_writer'}
                            </div>
                          </div>
                          <div>
                            <label className={`block text-xs font-serif tracking-widest uppercase mb-2 ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                              Pen Name (Display)
                            </label>
                            <input
                              type="text"
                              value={displayName}
                              onChange={(e) => setDisplayName(e.target.value)}
                              className={`w-full px-4 py-3 rounded-lg text-md font-serif transition-all outline-none border-b-2 ${
                                isDark 
                                  ? 'bg-black/20 border-stone-700 focus:border-rose-400 text-stone-200' 
                                  : 'bg-white/60 border-stone-200 focus:border-rose-400 text-stone-800'
                              }`}
                              placeholder="How should we call you?"
                              required
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={saving}
                          className={`mt-8 w-full flex items-center justify-center gap-2 py-3 rounded-lg font-serif tracking-wide transition-all ${
                            isDark
                              ? 'bg-rose-900/50 text-rose-200 hover:bg-rose-800/60 border border-rose-800/50'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200 border border-rose-200'
                          } disabled:opacity-50`}
                        >
                          {saving ? (
                            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <Save className="w-4 h-4" /> Ink these changes
                            </>
                          )}
                        </button>
                      </form>
                    )}

                    {/* Couple Tab */}
                    {activeTab === 'couple' && (
                      <div className="space-y-6">
                        <div className="pb-4 border-b border-stone-200/50 dark:border-stone-700/50">
                          <h3 className={`font-serif text-2xl ${isDark ? 'text-rose-200' : 'text-rose-800'}`}>
                            Our Story
                          </h3>
                          <p className={`text-xs font-serif italic mt-1 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                            The details of your shared journey.
                          </p>
                        </div>

                        <div className="space-y-5">
                          <div className={`p-4 rounded-xl border ${isDark ? 'border-rose-900/30 bg-rose-950/20' : 'border-rose-200/50 bg-rose-50/50'}`}>
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-full ${isDark ? 'bg-rose-900/40' : 'bg-rose-200/50'}`}>
                                <Heart className={`w-5 h-5 ${isDark ? 'text-rose-300' : 'text-rose-600'} ${hasPartner ? 'fill-current' : ''}`} />
                              </div>
                              <div>
                                <p className={`text-xs font-serif uppercase tracking-widest ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                                  Co-Author
                                </p>
                                <p className={`text-lg font-serif ${isDark ? 'text-rose-100' : 'text-rose-900'}`}>
                                  {hasPartner ? partnerName : 'Pages awaiting a partner...'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {!hasPartner && inviteCode && (
                            <div className="pt-2">
                              <label className={`block text-xs font-serif tracking-widest uppercase mb-2 ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                                Invitation Letter Code
                              </label>
                              <div className="flex gap-2">
                                <div className={`flex-1 px-4 py-3 rounded-lg font-mono text-center text-lg tracking-[0.25em] ${
                                  isDark ? 'bg-black/20 text-rose-300' : 'bg-rose-50/50 text-rose-700 border border-rose-100'
                                }`}>
                                  {inviteCode}
                                </div>
                                <button
                                  onClick={copyInviteCode}
                                  className={`px-6 py-3 rounded-lg font-serif transition-all ${
                                    isDark ? 'bg-rose-900/50 text-rose-200 hover:bg-rose-800/60' : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                                  }`}
                                >
                                  Copy
                                </button>
                              </div>
                            </div>
                          )}

                          <div>
                            <label className={`block text-xs font-serif tracking-widest uppercase mb-2 ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                              Chapter Title (Couple Name)
                            </label>
                            <input
                              type="text"
                              value={coupleName}
                              onChange={(e) => setCoupleName(e.target.value)}
                              className={`w-full px-4 py-3 rounded-lg text-md font-serif transition-all outline-none border-b-2 ${
                                isDark 
                                  ? 'bg-black/20 border-stone-700 focus:border-rose-400 text-stone-200' 
                                  : 'bg-white/60 border-stone-200 focus:border-rose-400 text-stone-800'
                              }`}
                              placeholder="e.g. Jack & Rose"
                            />
                          </div>
                          
                          <div>
                            <label className={`block text-xs font-serif tracking-widest uppercase mb-2 ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                              The Day It Began
                            </label>
                            <input
                              type="date"
                              value={anniversaryDate}
                              onChange={(e) => setAnniversaryDate(e.target.value)}
                              className={`w-full px-4 py-3 rounded-lg text-md font-serif transition-all outline-none border-b-2 ${
                                isDark 
                                  ? 'bg-black/20 border-stone-700 focus:border-rose-400 text-stone-200' 
                                  : 'bg-white/60 border-stone-200 focus:border-rose-400 text-stone-800'
                              }`}
                            />
                          </div>
                        </div>

                        <button
                          onClick={handleCoupleUpdate}
                          disabled={saving}
                          className={`mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-lg font-serif tracking-wide transition-all ${
                            isDark
                              ? 'bg-rose-900/50 text-rose-200 hover:bg-rose-800/60 border border-rose-800/50'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200 border border-rose-200'
                          } disabled:opacity-50`}
                        >
                          <Save className="w-4 h-4" /> Update Our Story
                        </button>
                      </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                      <form onSubmit={handlePasswordChange} className="space-y-6">
                        <div className="pb-4 border-b border-stone-200/50 dark:border-stone-700/50">
                          <h3 className={`font-serif text-2xl ${isDark ? 'text-rose-200' : 'text-rose-800'}`}>
                            Privacy Lock
                          </h3>
                          <p className={`text-xs font-serif italic mt-1 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                            Keep your journal entries safe from prying eyes.
                          </p>
                        </div>

                        <div className="space-y-5">
                          <div>
                            <label className={`block text-xs font-serif tracking-widest uppercase mb-2 ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                              Current Lock Key
                            </label>
                            <div className="relative">
                              <input
                                type={showCurrentPassword ? 'text' : 'password'}
                                value={passwordData.current_password}
                                onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                className={`w-full px-4 py-3 rounded-lg text-md font-serif transition-all outline-none border-b-2 pr-10 ${
                                  isDark ? 'bg-black/20 border-stone-700 focus:border-rose-400 text-stone-200' : 'bg-white/60 border-stone-200 focus:border-rose-400 text-stone-800'
                                }`}
                                placeholder="Enter current password"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
                              >
                                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                          
                          <div>
                            <label className={`block text-xs font-serif tracking-widest uppercase mb-2 ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                              New Lock Key
                            </label>
                            <div className="relative">
                              <input
                                type={showNewPassword ? 'text' : 'password'}
                                value={passwordData.new_password}
                                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                className={`w-full px-4 py-3 rounded-lg text-md font-serif transition-all outline-none border-b-2 pr-10 ${
                                  isDark ? 'bg-black/20 border-stone-700 focus:border-rose-400 text-stone-200' : 'bg-white/60 border-stone-200 focus:border-rose-400 text-stone-800'
                                }`}
                                placeholder="Min. 8 characters"
                                required
                                minLength={8}
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
                              >
                                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className={`block text-xs font-serif tracking-widest uppercase mb-2 ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                              Confirm New Lock Key
                            </label>
                            <div className="relative">
                              <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={passwordData.confirm_password}
                                onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                                className={`w-full px-4 py-3 rounded-lg text-md font-serif transition-all outline-none border-b-2 pr-10 ${
                                  isDark ? 'bg-black/20 border-stone-700 focus:border-rose-400 text-stone-200' : 'bg-white/60 border-stone-200 focus:border-rose-400 text-stone-800'
                                }`}
                                placeholder="Type it once more"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
                              >
                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={saving}
                          className={`mt-8 w-full flex items-center justify-center gap-2 py-3 rounded-lg font-serif tracking-wide transition-all ${
                            isDark
                              ? 'bg-stone-700/50 text-stone-200 hover:bg-stone-600/60'
                              : 'bg-stone-800 text-stone-100 hover:bg-stone-700'
                          } disabled:opacity-50`}
                        >
                          {saving ? (
                            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <Lock className="w-4 h-4" /> Change Lock
                            </>
                          )}
                        </button>
                      </form>
                    )}

                    {/* Preferences Tab */}
                    {activeTab === 'preferences' && (
                      <div className="space-y-6">
                        <div className="pb-4 border-b border-stone-200/50 dark:border-stone-700/50">
                          <h3 className={`font-serif text-2xl ${isDark ? 'text-rose-200' : 'text-rose-800'}`}>
                            Aesthetics
                          </h3>
                          <p className={`text-xs font-serif italic mt-1 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                            Customize the feeling of your space.
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          {/* Dark Mode */}
                          <div className={`flex items-center justify-between p-4 rounded-xl transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}>
                            <div>
                              <p className={`font-serif text-lg ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>Midnight Reading</p>
                              <p className={`text-sm font-serif italic ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>Switch to dark paper</p>
                            </div>
                            <button
                              onClick={toggleTheme}
                              className={`relative w-12 h-6 rounded-full transition-all duration-300 shadow-inner ${isDark ? 'bg-rose-500/80' : 'bg-stone-300'}`}
                            >
                              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${isDark ? 'right-1' : 'left-1'}`} />
                            </button>
                          </div>

                          {/* Falling Petals */}
                          <div className={`flex items-center justify-between p-4 rounded-xl transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}>
                            <div>
                              <p className={`font-serif text-lg ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>Falling Petals</p>
                              <p className={`text-sm font-serif italic ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>Drifting romantic memories</p>
                            </div>
                            <button
                              onClick={() => handleSettingToggle('enablePetals')}
                              className={`relative w-12 h-6 rounded-full transition-all duration-300 shadow-inner ${settings.enablePetals ? 'bg-rose-500/80' : 'bg-stone-300'}`}
                            >
                              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${settings.enablePetals ? 'right-1' : 'left-1'}`} />
                            </button>
                          </div>

                          {/* Animations */}
                          <div className={`flex items-center justify-between p-4 rounded-xl transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}>
                            <div>
                              <p className={`font-serif text-lg ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>Smooth Turning</p>
                              <p className={`text-sm font-serif italic ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>Page flip animations</p>
                            </div>
                            <button
                              onClick={() => handleSettingToggle('enableAnimations')}
                              className={`relative w-12 h-6 rounded-full transition-all duration-300 shadow-inner ${settings.enableAnimations ? 'bg-rose-500/80' : 'bg-stone-300'}`}
                            >
                              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${settings.enableAnimations ? 'right-1' : 'left-1'}`} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
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