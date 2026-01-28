import React, { createContext, useContext, useState, ReactNode } from 'react';

type OverlayColor = 'none' | 'yellow' | 'green' | 'red' | 'braille';

interface ColorOverlayContextType {
  overlayColor: OverlayColor;
  setOverlayColor: (color: OverlayColor) => void;
}

const ColorOverlayContext = createContext<ColorOverlayContextType | undefined>(undefined);

export function ColorOverlayProvider({ children }: { children: ReactNode }) {
  const [overlayColor, setOverlayColor] = useState<OverlayColor>('none');

  return (
    <ColorOverlayContext.Provider value={{ overlayColor, setOverlayColor }}>
      {children}
    </ColorOverlayContext.Provider>
  );
}

export function useColorOverlay() {
  const context = useContext(ColorOverlayContext);
  if (context === undefined) {
    throw new Error('useColorOverlay must be used within a ColorOverlayProvider');
  }
  return context;
}