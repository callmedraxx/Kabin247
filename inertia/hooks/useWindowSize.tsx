import { useEffect, useState } from 'react';

export default function useWindowSize() {
  const [size, setSize] = useState({ width: 1920, height: 0 });

  useEffect(() => {
    if (!window) return;
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return size;
}
