import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useColorOverlay } from '@/context/ColorOverlayContext';
import { X, Eye, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function QuickAccessOverlay() {
  const { overlayColor, setOverlayColor } = useColorOverlay();

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Escape key to turn off overlay
      if (event.key === 'Escape' && overlayColor !== 'none') {
        setOverlayColor('none');
      }
      // Alt + A for accessibility (Braille mode)
      if (event.altKey && event.key.toLowerCase() === 'a') {
        setOverlayColor('braille');
        event.preventDefault();
      }
      // Alt + 0 to turn off
      if (event.altKey && event.key === '0') {
        setOverlayColor('none');
        event.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [overlayColor, setOverlayColor]);

  if (overlayColor === 'none') {
    return null;
  }

  const getModeInfo = () => {
    switch (overlayColor) {
      case 'yellow': return { name: 'Solar Mode', icon: '☀️' };
      case 'green': return { name: 'Nature Mode', icon: '🌿' };
      case 'red': return { name: 'Fire Mode', icon: '🔥' };
      case 'braille': return { name: 'Braille Accessibility', icon: '👁️' };
      default: return { name: 'Unknown Mode', icon: '❓' };
    }
  };

  const modeInfo = getModeInfo();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] pointer-events-auto"
      >
        <div className="bg-black/90 backdrop-blur-md text-white px-4 py-2 rounded-full shadow-xl border border-white/20 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-yellow-400" />
            <span className="font-medium text-sm">{modeInfo.name} Active</span>
          </div>
          
          <div className="h-4 w-px bg-white/30" />
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20 hover:text-white"
              onClick={() => setOverlayColor('braille')}
              title="Accessibility Mode (Alt+A)"
            >
              <Eye className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-red-500 hover:text-white"
              onClick={() => setOverlayColor('none')}
              title="Turn Off (Escape or Alt+0)"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Help text */}
        <div className="text-center mt-2">
          <p className="text-xs text-white/70 bg-black/50 px-3 py-1 rounded-full">
            Press <kbd className="bg-white/20 px-1 rounded">Esc</kbd> to turn off • <kbd className="bg-white/20 px-1 rounded">Alt+A</kbd> for accessibility
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}