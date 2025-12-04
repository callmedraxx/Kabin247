import { useEffect, useState } from 'react';

export default function useWindowSize() {
  // Initialize with actual window size if available, otherwise use a safe default
  const [size, setSize] = useState(() => {
    if (typeof window !== 'undefined') {
      return {
        width: window.innerWidth,
        height: window.innerHeight,
      };
    }
    // SSR fallback - use desktop width to prevent mobile-first issues on desktop
    return { width: 1920, height: 1080 };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Set initial size immediately to ensure accurate measurement
    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return size;
}
