import React from 'react';

interface DomoAIMicroLogoProps {
  size?: number;
  className?: string;
  variant?: 'default' | 'bright';
}

export function DomoAIMicroLogo({ size = 16, className = "", variant = 'default' }: DomoAIMicroLogoProps) {
  const filterStyle = variant === 'bright' 
    ? { 
        filter: 'brightness(1.3) contrast(1.2) saturate(1.1)',
        backgroundColor: 'transparent'
      }
    : {
        filter: 'brightness(1.1) contrast(1.05)',
        backgroundColor: 'transparent'
      };

  return (
    <img 
      src="/domoai-logo.png" 
      alt="AIDOMO" 
      style={{ 
        width: size, 
        height: size,
        objectFit: 'contain',
        ...filterStyle
      }}
      className={`${className}`}
    />
  );
}

// Second version - more vibrant without black elements
export function DomoAIMicroLogoBright({ size = 16, className = "" }: DomoAIMicroLogoProps) {
  return (
    <img 
      src="/domoai-logo.png" 
      alt="AIDOMO" 
      style={{ 
        width: size, 
        height: size,
        objectFit: 'contain',
        filter: 'brightness(1.4) contrast(1.3) saturate(1.2) hue-rotate(5deg)',
        backgroundColor: 'transparent',
        borderRadius: '50%'
      }}
      className={className}
    />
  );
}