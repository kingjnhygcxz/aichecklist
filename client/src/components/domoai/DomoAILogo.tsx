import React from 'react';

interface DomoAILogoProps {
  size?: number;
  className?: string;
}

export function DomoAILogo({ size = 120, className = "" }: DomoAILogoProps) {
  // Always show the full horizontal layout with text
  const logoSize = size >= 120 ? 130 : Math.max(size * 0.8, 50);
  const textSize = size >= 120 ? 'text-lg font-bold' : 'text-sm font-bold';
  const subtitleSize = size >= 120 ? 'text-base' : 'text-xs';
  
  // Full horizontal layout for all sizes
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img 
        src="/domoai-logo.png" 
        alt="AIDOMO" 
        style={{ 
          width: logoSize, 
          height: logoSize,
          objectFit: 'contain'
        }}
        className="rounded-full"
      />
      <div className="flex flex-col">
        <div className={`text-foreground ${textSize}`}>
          AIDOMO <span className="text-yellow-400">✨</span>
        </div>
        <div className={`text-muted-foreground ${subtitleSize}`}>
          Your MajorDomo
        </div>
      </div>
    </div>
  );
}