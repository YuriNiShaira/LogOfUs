import React, { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import BackgroundContainer from './backgrounds/BackgroundContainer';
import type { BackgroundTheme } from './backgrounds/types';

interface RomanticBackgroundProps {
  theme?: BackgroundTheme;
}

const RomanticBackground: React.FC<RomanticBackgroundProps> = ({ theme = 'cherry-blossom' }) => {
  const { theme: appTheme, setTheme } = useTheme(); 
  const [currentTheme, setCurrentTheme] = useState<BackgroundTheme>(theme);
  const [enablePetals, setEnablePetals] = useState(true);

  // Load saved theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('backgroundTheme') as BackgroundTheme;
    if (savedTheme) {
      setCurrentTheme(savedTheme);
      if (savedTheme === 'starry-night') {
        setTheme('dark');
      } else {
        setTheme('light');
      }
    }
    const savedSettings = localStorage.getItem('user_settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setEnablePetals(settings.enablePetals !== undefined ? settings.enablePetals : true);
      } catch (e) {}
    }
  }, []);

  // Listen for storage changes (background theme, petals)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'backgroundTheme') {
        const newTheme = e.newValue as BackgroundTheme;
        if (newTheme) {
          setCurrentTheme(newTheme);
          if (newTheme === 'starry-night') {
            setTheme('dark');
          } else {
            setTheme('light');
          }
        }
      }
      if (e.key === 'user_settings') {
        try {
          const settings = JSON.parse(e.newValue || '{}');
          setEnablePetals(settings.enablePetals !== undefined ? settings.enablePetals : true);
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Listen for custom event (from SettingsDropdown)
  useEffect(() => {
    const handleCustomEvent = (e: CustomEvent) => {
      if (e.detail?.theme) {
        setCurrentTheme(e.detail.theme);
        if (e.detail.theme === 'starry-night') {
          setTheme('dark');
        } else {
          setTheme('light');
        }
      }
    };
    window.addEventListener('backgroundThemeChange', handleCustomEvent as EventListener);
    return () => window.removeEventListener('backgroundThemeChange', handleCustomEvent as EventListener);
  }, []);

  const isDark = appTheme === 'dark'; 

  return (
    <BackgroundContainer 
      theme={currentTheme} 
      isDark={isDark} 
      enablePetals={enablePetals} 
    />
  );
};

export default RomanticBackground;