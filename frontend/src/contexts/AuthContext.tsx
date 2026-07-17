import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Heart } from 'lucide-react';

interface UserData {
  username: string;
  display_name: string;
  couple_name: string;
  couple_id: number;
  anniversary_date: string;
  partner_name: string;
  invite_code?: string; 
  has_partner?: boolean;  
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserData | null;
  login: (userData: UserData, accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // Check if token is valid and not expired
  const isTokenValid = useCallback((token: string): boolean => {
    if (!token) return false;
    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = tokenPayload.exp * 1000;
      const currentTime = Date.now();
      // Add 5 minute buffer to be safe
      return currentTime < expiryTime - 300000;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  }, []);

  // Initialize auth from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem('coupleUser');
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        
        console.log('Initializing Auth...', {
          hasUser: !!storedUser,
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken
        });
        
        if (storedUser && accessToken && refreshToken && isTokenValid(accessToken)) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
          console.log('Auth restored for user:', parsedUser.display_name);
        } else if (storedUser && accessToken && refreshToken) {
          // Token expired but we have refresh token - try to restore user
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setIsAuthenticated(true);
            console.log('Auth restored for user (token may be expired):', parsedUser.display_name);
          } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('coupleUser');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setIsAuthenticated(false);
            setUser(null);
          }
        } else {
          console.log('No auth data found');
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        localStorage.removeItem('coupleUser');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
  }, [isTokenValid]);

  const login = useCallback((userData: UserData, accessToken: string, refreshToken: string) => {
    try {
      const hasPartner = userData.partner_name !== 'Waiting for partner to join...' && 
                        userData.partner_name !== 'Waiting for partner...';
      
      const fullUserData = {
        ...userData,
        has_partner: hasPartner,
      };
      
      setUser(fullUserData);
      setIsAuthenticated(true);
      
      // Store in localStorage
      localStorage.setItem('coupleUser', JSON.stringify(fullUserData));
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      //Clear React Query cache on login to prevent showing old user data
      queryClient.clear();
      
      console.log('Login successful, data stored for:', fullUserData.display_name);
    } catch (error) {
      console.error('Error during login:', error);
    }
  }, [queryClient]);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('coupleUser');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    //Clear React Query cache on logout to prevent data leakage
    queryClient.clear();
    

    console.log('Logout successful, cache cleared');
  }, [queryClient]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-rose-50 to-pink-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mx-auto mb-4"></div>
            <Heart className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-rose-500 animate-pulse" />
          </div>
          <p className="text-rose-600 font-serif italic mt-4">Opening your love story...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};