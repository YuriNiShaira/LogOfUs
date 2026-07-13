import React, { createContext, useContext, useMemo } from 'react';
import { useMobile } from '../hooks/useMobile';

interface PerformanceContextType {
  isMobile: boolean;
  isLowPerformance: boolean;
  shouldReduceEffects: boolean;
  isDesktop: boolean;
}

const PerformanceContext = createContext<PerformanceContextType>({
  isMobile: false,
  isLowPerformance: false,
  shouldReduceEffects: false,
  isDesktop: true,
});

export const PerformanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isMobile, isLowPerformance, shouldReduceEffects } = useMobile();
  
  const value = useMemo(() => ({
    isMobile,
    isLowPerformance,
    shouldReduceEffects,
    isDesktop: !isMobile && !isLowPerformance,
  }), [isMobile, isLowPerformance, shouldReduceEffects]);
  
  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
};

export const usePerformance = () => useContext(PerformanceContext);