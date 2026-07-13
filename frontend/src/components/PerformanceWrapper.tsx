import React from 'react';
import { useMobile } from '../hooks/useMobile';

interface PerformanceWrapperProps {
    children: React.ReactNode;
    reduceOnMobile?: boolean;
    className?: string;
}

const PerformanceWrapper: React.FC<PerformanceWrapperProps> = ({ 
  children, 
  reduceOnMobile = true,
  className = ''
}) => {
  const { shouldReduceEffects } = useMobile();
  
  const shouldReduce = reduceOnMobile && shouldReduceEffects;
  
  return (
    <div className={`${shouldReduce ? 'gpu-accelerated' : ''} ${className}`}>
      {children}
    </div>
  );
};

export default PerformanceWrapper;