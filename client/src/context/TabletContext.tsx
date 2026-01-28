import { createContext, useContext, ReactNode } from 'react';
import { useTablet } from '@/hooks/use-tablet';

interface TabletContextType {
  isTablet: boolean;
  screenSize: {
    width: number;
    height: number;
  };
  isLandscape: boolean;
  touchDevice: boolean;
}

const TabletContext = createContext<TabletContextType | undefined>(undefined);

export function TabletProvider({ children }: { children: ReactNode }) {
  const tabletInfo = useTablet();

  return (
    <TabletContext.Provider value={tabletInfo}>
      {children}
    </TabletContext.Provider>
  );
}

export function useTabletContext() {
  const context = useContext(TabletContext);
  if (context === undefined) {
    throw new Error('useTabletContext must be used within a TabletProvider');
  }
  return context;
}