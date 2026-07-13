// frontend/src/hooks/useMobile.ts
import { useState, useEffect } from 'react';

export const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isLowPerformance, setIsLowPerformance] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Check for low-end devices
      try {
        const memory = (performance as any).memory;
        if (memory && memory.jsHeapSizeLimit < 2 * 1024 * 1024 * 1024) {
          setIsLowPerformance(true);
        }
      } catch (e) {
        // Memory API not available
      }
      
      if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
        setIsLowPerformance(true);
      }
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return { isMobile, isLowPerformance, shouldReduceEffects: isMobile || isLowPerformance };
};