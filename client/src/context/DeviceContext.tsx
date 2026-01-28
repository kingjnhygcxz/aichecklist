import { createContext, useContext, useEffect, useState } from 'react';
import { useDevice, DeviceType } from '@/hooks/use-device';

interface DeviceContextType {
  deviceType: DeviceType;
  isTablet: boolean;
  isMobile: boolean;
  isTouch: boolean;
  screenWidth: number;
  screenHeight: number;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export function DeviceProvider({ children }: { children: React.ReactNode }) {
  const deviceInfo = useDevice();
  
  const contextValue: DeviceContextType = {
    deviceType: deviceInfo.type,
    isTablet: deviceInfo.type === 'tablet',
    isMobile: deviceInfo.type === 'mobile',
    isTouch: deviceInfo.isTouch,
    screenWidth: deviceInfo.screenWidth,
    screenHeight: deviceInfo.screenHeight
  };

  // Apply tablet class to body for global styles
  useEffect(() => {
    if (contextValue.isTablet) {
      document.body.classList.add('tablet-mode');
    } else {
      document.body.classList.remove('tablet-mode');
    }
    
    return () => {
      document.body.classList.remove('tablet-mode');
    };
  }, [contextValue.isTablet]);

  return (
    <DeviceContext.Provider value={contextValue}>
      {children}
    </DeviceContext.Provider>
  );
}

export function useDeviceContext(): DeviceContextType {
  const context = useContext(DeviceContext);
  if (context === undefined) {
    throw new Error('useDeviceContext must be used within a DeviceProvider');
  }
  return context;
}