import { useState, useEffect } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

interface DeviceInfo {
  type: DeviceType;
  isTouch: boolean;
  screenWidth: number;
  screenHeight: number;
}

export function useDevice(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    if (typeof window === 'undefined') {
      return { type: 'desktop', isTouch: false, screenWidth: 1024, screenHeight: 768 };
    }
    
    return detectDevice();
  });

  useEffect(() => {
    const handleResize = () => {
      setDeviceInfo(detectDevice());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return deviceInfo;
}

function detectDevice(): DeviceInfo {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Enhanced tablet detection
  const isTablet = (
    // Size-based detection: tablets are typically 768px - 1024px wide
    (width >= 768 && width <= 1024) ||
    // Aspect ratio detection for tablets in landscape
    (width > height && width <= 1366 && height >= 768) ||
    // Touch device with medium screen size
    (isTouch && width >= 768 && width < 1200)
  );
  
  const isMobile = width < 768;
  
  let type: DeviceType = 'desktop';
  if (isMobile) {
    type = 'mobile';
  } else if (isTablet) {
    type = 'tablet';
  }

  return {
    type,
    isTouch,
    screenWidth: width,
    screenHeight: height
  };
}

// Additional tablet-specific utilities
export function useTabletMode() {
  const { type, isTouch } = useDevice();
  return type === 'tablet' && isTouch;
}

export function useTouchDevice() {
  const { isTouch } = useDevice();
  return isTouch;
}