import { useState, useEffect } from 'react';

// Simple hook to check if screen width is below a threshold (e.g., 768px for tablets)
export const useMobile = (breakpoint = 768): boolean => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    window.addEventListener('resize', handleResize);
    // Cleanup listener on component unmount
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]); // Re-run effect if breakpoint changes

  return isMobile;
};