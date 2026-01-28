import React, { useEffect } from 'react';
import { useColorOverlay } from '@/context/ColorOverlayContext';

export function ColorOverlay() {
  const { overlayColor } = useColorOverlay();

  useEffect(() => {
    if (overlayColor !== 'none') {
      // Apply text readability styles with stronger shadows using safe CSS methods
      const style = document.createElement('style');
      style.id = 'overlay-text-enhancement';
      
      // Use textContent for safe CSS injection instead of innerHTML
      if (overlayColor === 'braille') {
        style.textContent = `
          body * {
            color: #000000 !important;
            font-weight: bold !important;
            font-size: 1.2em !important;
            line-height: 1.6 !important;
          }
          body .text-muted-foreground {
            color: #333333 !important;
            font-weight: 600 !important;
          }
          body h1, body h2, body h3, body h4, body h5, body h6 {
            color: #000000 !important;
            font-weight: 900 !important;
            font-size: 1.4em !important;
          }
          body button, body .clickable {
            border: 3px solid #000000 !important;
            font-weight: bold !important;
            font-size: 1.1em !important;
            padding: 12px 16px !important;
          }
          body input, body textarea {
            border: 3px solid #000000 !important;
            font-size: 1.2em !important;
            font-weight: bold !important;
          }
        `;
      } else {
        style.textContent = `
          body * {
            text-shadow: 1px 1px 2px rgba(0,0,0,0.8), 0 0 1px rgba(255,255,255,0.3) !important;
          }
          body .text-muted-foreground {
            text-shadow: 1px 1px 2px rgba(0,0,0,0.9) !important;
          }
          body h1, body h2, body h3, body h4, body h5, body h6 {
            text-shadow: 2px 2px 4px rgba(0,0,0,0.9), 0 0 2px rgba(255,255,255,0.4) !important;
          }
          body .bg-card, body .bg-background {
            backdrop-filter: brightness(0.9) !important;
          }
        `;
      }
      document.head.appendChild(style);
      
      return () => {
        const existingStyle = document.getElementById('overlay-text-enhancement');
        if (existingStyle) {
          existingStyle.remove();
        }
      };
    }
  }, [overlayColor]);

  if (overlayColor === 'none') {
    return null;
  }

  const overlayClasses = {
    yellow: 'bg-yellow-100',
    green: 'bg-green-100', 
    red: 'bg-red-100',
    braille: 'bg-white'
  };

  return (
    <div 
      className={`fixed inset-0 pointer-events-none z-50 transition-all duration-500 ${overlayClasses[overlayColor]}`}
      style={{ 
        mixBlendMode: overlayColor === 'braille' ? 'normal' : 'multiply',
        opacity: overlayColor === 'braille' ? 0.95 : 0.8
      }}
    />
  );
}