export const getAnimationProps = (isMobile: boolean) => {
  return {
    initial: isMobile ? {} : { opacity: 0, y: 20 },
    animate: isMobile ? {} : { opacity: 1, y: 0 },
    exit: isMobile ? {} : { opacity: 0, y: -20 },
    transition: isMobile ? { duration: 0.01 } : { duration: 0.3 },
  };
};

export const getReducedMotionProps = (shouldReduce: boolean) => {
  return {
    initial: shouldReduce ? {} : { scale: 0.95, opacity: 0 },
    animate: shouldReduce ? {} : { scale: 1, opacity: 1 },
    transition: shouldReduce ? { duration: 0.01 } : { type: "spring", stiffness: 300, damping: 20 },
  };
};

export const getHoverProps = (shouldReduce: boolean) => {
  return {
    whileHover: shouldReduce ? {} : { scale: 1.05 },
    whileTap: shouldReduce ? {} : { scale: 0.98 },
  };
};