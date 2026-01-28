import { useEffect } from 'react';
import { useTabletContext } from '@/context/TabletContext';

export function TabletModeManager() {
  const { isTablet } = useTabletContext();

  useEffect(() => {
    // Apply tablet mode class to body when tablet is detected
    if (isTablet) {
      document.body.classList.add('tablet-mode');
      
      // Add scroll behavior management for tablet mode
      const preventScrollBehavior = (e: TouchEvent) => {
        // Only prevent default on specific components with tablet-timer-container class
        const target = e.target as Element;
        if (target?.closest('.tablet-timer-container, .tablet-timer-dial')) {
          // These components handle their own touch behavior
          return;
        }
        
        // For general scrolling, allow normal behavior but prevent overscroll
        if (target?.closest('.tablet-scrollable-content')) {
          return;
        }
      };

      // Add touch event management
      document.addEventListener('touchstart', preventScrollBehavior, { passive: true });
      document.addEventListener('touchmove', preventScrollBehavior, { passive: true });

      return () => {
        document.body.classList.remove('tablet-mode');
        document.removeEventListener('touchstart', preventScrollBehavior);
        document.removeEventListener('touchmove', preventScrollBehavior);
      };
    } else {
      document.body.classList.remove('tablet-mode');
    }
  }, [isTablet]);

  // This component doesn't render anything
  return null;
}