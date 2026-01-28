import { useState, useEffect } from 'react';

interface TabletDetection {
  isTablet: boolean;
  screenSize: {
    width: number;
    height: number;
  };
  isLandscape: boolean;
  touchDevice: boolean;
}

export function useTablet(): TabletDetection {
  const [tabletInfo, setTabletInfo] = useState<TabletDetection>(() => {
    // Initial detection on mount
    const width = window.innerWidth;
    const height = window.innerHeight;
    const touchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Tablet detection: touch device with width between 768-1024px or specific aspect ratios
    const isTabletSize = (width >= 768 && width <= 1024) || 
                        (height >= 768 && height <= 1024);
    const isTablet = touchDevice && isTabletSize;
    
    return {
      isTablet,
      screenSize: { width, height },
      isLandscape: width > height,
      touchDevice
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const touchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Enhanced tablet detection including common tablet resolutions
      const isTabletSize = (width >= 768 && width <= 1024) || 
                          (height >= 768 && height <= 1024) ||
                          // iPad specific resolutions
                          (width === 768 && height === 1024) ||
                          (width === 1024 && height === 768) ||
                          (width === 820 && height === 1180) ||
                          (width === 1180 && height === 820) ||
                          // Android tablet common sizes
                          (width >= 800 && width <= 1280 && touchDevice);
      
      const isTablet = touchDevice && isTabletSize;
      
      setTabletInfo({
        isTablet,
        screenSize: { width, height },
        isLandscape: width > height,
        touchDevice
      });
    };

    // Listen for resize and orientation changes
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    // Also check on initial load after a brief delay for accurate detection
    const timer = setTimeout(handleResize, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      clearTimeout(timer);
    };
  }, []);

  return tabletInfo;
}