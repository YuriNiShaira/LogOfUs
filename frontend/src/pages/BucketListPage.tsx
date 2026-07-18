import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { api } from '../services/api';
import RomanticBackground from '../components/RomanticBackground';
import Navbar from '../components/Navbar';
import BucketListPageContent from '../components/BucketList/BucketListPageContent';

const BucketListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [currentUser, setCurrentUser] = useState<string>('me');
  const isDarkMode = theme === 'dark';

  useEffect(() => {
    const fetchCoupleInfo = async () => {
      try {
        const response = await api.get('/auth/couple-info/');
        const data = response.data;
        
        console.log('Couple Info:', data);
        console.log('Current User Display Name:', user?.display_name);
        console.log('Partner 1 Name:', data.partner1_name);
        console.log('Partner 2 Name:', data.partner2_name);
        
        if (data.partner1_name === user?.display_name) {
          setCurrentUser('me');
          console.log('Current user is partner 1 (me)');
        } else if (data.partner2_name === user?.display_name) {
          setCurrentUser('shaira');
          console.log('Current user is partner 2 (shaira)');
        } else {
          setCurrentUser('me');
          console.log('Only 1 member, defaulting to me');
        }
      } catch (error) {
        console.error('Error fetching couple info:', error);
        setCurrentUser('me');
      }
    };
    
    fetchCoupleInfo();
  }, [user]);

  return (
    <div className="min-h-screen relative overflow-hidden transition-colors duration-300">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Dancing+Script:wght@500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&display=swap');
        .font-handwriting { font-family: 'Caveat', cursive; }
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-script { font-family: 'Dancing Script', cursive; }
        .font-cormorant { font-family: 'Cormorant Garamond', serif; }
      `}} />

      <RomanticBackground />
      <Navbar />

      <div className="max-w-7xl mx-auto relative z-10 px-4 sm:px-6 py-4 sm:py-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => navigate('/dashboard')}
            className={`flex items-center gap-2 text-sm font-serif transition-colors group ${
              isDarkMode ? 'text-rose-300 hover:text-rose-100' : 'text-rose-600 hover:text-rose-800'
            }`}
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
        </motion.div>

        <BucketListPageContent currentUser={currentUser} />
      </div>
    </div>
  );
};

export default BucketListPage;