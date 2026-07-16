import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { BackgroundTheme } from './types';
import { 
  Flower2, 
  CloudRain, 
  Cloud, 
  Sun, 
  Snowflake, 
  Cat,
  Check
} from 'lucide-react';

interface BackgroundSettingsProps {
  currentTheme: BackgroundTheme;
  onThemeChange: (theme: BackgroundTheme) => void;
  isDark: boolean;
}

const BackgroundSettings: React.FC<BackgroundSettingsProps> = ({ 
  currentTheme, 
  onThemeChange, 
  isDark 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const themes: { id: BackgroundTheme; label: string; icon: React.ReactNode }[] = [
    { id: 'cherry-blossom', label: 'Cherry Blossom', icon: <Flower2 size={20} /> },
    { id: 'rainy-day', label: 'Rainy Day', icon: <CloudRain size={20} /> },
    { id: 'cloudy', label: 'Cloudy', icon: <Cloud size={20} /> },
    { id: 'sunny', label: 'Sunny', icon: <Sun size={20} /> },
    { id: 'snowy', label: 'Snowy', icon: <Snowflake size={20} /> },
    { id: 'cats', label: 'Cats', icon: <Cat size={20} /> },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg transition-colors ${
          isDark ? 'hover:bg-stone-800' : 'hover:bg-stone-100'
        }`}
      >
        <Flower2 size={20} className={isDark ? 'text-stone-300' : 'text-stone-600'} />
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className={`absolute right-0 mt-2 p-2 rounded-lg shadow-xl min-w-50 z-50 ${
            isDark ? 'bg-stone-800 border border-stone-700' : 'bg-white border border-stone-200'
          }`}
        >
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => {
                onThemeChange(theme.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                currentTheme === theme.id
                  ? isDark ? 'bg-rose-900/50 text-rose-300' : 'bg-rose-100 text-rose-700'
                  : isDark ? 'hover:bg-stone-700 text-stone-300' : 'hover:bg-stone-100 text-stone-700'
              }`}
            >
              {theme.icon}
              <span className="flex-1 text-sm font-serif text-left">{theme.label}</span>
              {currentTheme === theme.id && <Check size={16} className="text-rose-500" />}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default BackgroundSettings;