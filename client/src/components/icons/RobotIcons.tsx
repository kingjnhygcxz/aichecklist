import React from 'react';

// Robot Version 1: Green and Black with rounded design
export const RobotGreenBlack1 = ({ size = 64 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Antenna */}
    <line x1="32" y1="8" x2="32" y2="16" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="32" cy="6" r="3" fill="#10b981" stroke="#000" strokeWidth="1.5"/>
    
    {/* Head */}
    <rect x="20" y="16" width="24" height="20" rx="4" fill="#10b981" stroke="#000" strokeWidth="2"/>
    
    {/* Eyes */}
    <circle cx="26" cy="24" r="3" fill="#000"/>
    <circle cx="38" cy="24" r="3" fill="#000"/>
    <circle cx="27" cy="23" r="1" fill="#fff"/>
    <circle cx="39" cy="23" r="1" fill="#fff"/>
    
    {/* Smile */}
    <path d="M26 29 Q32 32 38 29" stroke="#000" strokeWidth="2" strokeLinecap="round" fill="none"/>
    
    {/* Body */}
    <rect x="18" y="36" width="28" height="20" rx="4" fill="#10b981" stroke="#000" strokeWidth="2"/>
    
    {/* Arms */}
    <rect x="10" y="40" width="8" height="12" rx="2" fill="#10b981" stroke="#000" strokeWidth="2"/>
    <rect x="46" y="40" width="8" height="12" rx="2" fill="#10b981" stroke="#000" strokeWidth="2"/>
    
    {/* Chest detail */}
    <rect x="28" y="42" width="8" height="8" rx="2" fill="#000" opacity="0.2"/>
  </svg>
);

// Robot Version 2: Green and White with square design
export const RobotGreenWhite1 = ({ size = 64 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Antenna */}
    <line x1="32" y1="10" x2="32" y2="18" stroke="#10b981" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="32" cy="8" r="4" fill="#fff" stroke="#10b981" strokeWidth="2"/>
    
    {/* Head */}
    <rect x="22" y="18" width="20" height="18" rx="2" fill="#fff" stroke="#10b981" strokeWidth="2"/>
    
    {/* Eyes */}
    <rect x="26" y="23" width="4" height="4" rx="1" fill="#10b981"/>
    <rect x="34" y="23" width="4" height="4" rx="1" fill="#10b981"/>
    
    {/* Smile */}
    <rect x="28" y="30" width="8" height="2" rx="1" fill="#10b981"/>
    
    {/* Body */}
    <rect x="20" y="36" width="24" height="18" rx="2" fill="#10b981" stroke="#10b981" strokeWidth="2"/>
    
    {/* Arms */}
    <circle cx="14" cy="44" r="4" fill="#fff" stroke="#10b981" strokeWidth="2"/>
    <circle cx="50" cy="44" r="4" fill="#fff" stroke="#10b981" strokeWidth="2"/>
    <rect x="16" y="42" width="4" height="8" fill="#10b981"/>
    <rect x="44" y="42" width="4" height="8" fill="#10b981"/>
    
    {/* Body details */}
    <circle cx="32" cy="44" r="3" fill="#fff"/>
    <rect x="28" y="48" width="2" height="4" rx="1" fill="#fff"/>
    <rect x="32" y="48" width="2" height="4" rx="1" fill="#fff"/>
    <rect x="36" y="48" width="2" height="4" rx="1" fill="#fff"/>
  </svg>
);

// Robot Version 3: Green and Black minimalist
export const RobotGreenBlack2 = ({ size = 64 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Antenna with signal waves */}
    <path d="M28 8 Q32 6 36 8" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <path d="M26 10 Q32 7 38 10" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5"/>
    <line x1="32" y1="12" x2="32" y2="20" stroke="#000" strokeWidth="2"/>
    <circle cx="32" cy="11" r="2" fill="#10b981"/>
    
    {/* Head - rounded */}
    <ellipse cx="32" cy="26" rx="12" ry="10" fill="#10b981"/>
    
    {/* Eyes - big and friendly */}
    <ellipse cx="27" cy="25" rx="4" ry="5" fill="#000"/>
    <ellipse cx="37" cy="25" rx="4" ry="5" fill="#000"/>
    <ellipse cx="28" cy="24" rx="2" ry="2.5" fill="#fff"/>
    <ellipse cx="38" cy="24" rx="2" ry="2.5" fill="#fff"/>
    
    {/* Big smile */}
    <path d="M24 30 Q32 35 40 30" stroke="#000" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    
    {/* Body */}
    <rect x="22" y="36" width="20" height="18" rx="6" fill="#000"/>
    
    {/* Screen on body */}
    <rect x="26" y="40" width="12" height="8" rx="2" fill="#10b981"/>
    <circle cx="29" cy="44" r="1" fill="#fff" opacity="0.8"/>
    <circle cx="32" cy="44" r="1" fill="#fff" opacity="0.8"/>
    <circle cx="35" cy="44" r="1" fill="#fff" opacity="0.8"/>
    
    {/* Legs */}
    <rect x="26" y="52" width="4" height="6" rx="2" fill="#000"/>
    <rect x="34" y="52" width="4" height="6" rx="2" fill="#000"/>
  </svg>
);

// Robot Version 4: Green and White cute style
export const RobotGreenWhite2 = ({ size = 64 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Antenna */}
    <line x1="32" y1="8" x2="32" y2="14" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="32" cy="6" r="3" fill="#10b981"/>
    
    {/* Head - rounded square */}
    <rect x="20" y="14" width="24" height="22" rx="8" fill="#fff" stroke="#10b981" strokeWidth="2.5"/>
    
    {/* Eyes - hearts for extra cuteness */}
    <path d="M26 22 C26 20 24 19 23 20 C22 19 20 20 20 22 C20 24 23 27 23 27 S26 24 26 22" fill="#10b981"/>
    <path d="M44 22 C44 20 42 19 41 20 C40 19 38 20 38 22 C38 24 41 27 41 27 S44 24 44 22" fill="#10b981"/>
    
    {/* Smile with teeth */}
    <path d="M25 28 Q32 32 39 28" stroke="#10b981" strokeWidth="2" strokeLinecap="round" fill="none"/>
    <rect x="28" y="28" width="2" height="2" fill="#10b981" opacity="0.3"/>
    <rect x="31" y="28" width="2" height="2" fill="#10b981" opacity="0.3"/>
    <rect x="34" y="28" width="2" height="2" fill="#10b981" opacity="0.3"/>
    
    {/* Body */}
    <rect x="18" y="36" width="28" height="20" rx="10" fill="#10b981"/>
    
    {/* Belly */}
    <ellipse cx="32" cy="46" rx="10" ry="8" fill="#fff" opacity="0.9"/>
    
    {/* Buttons */}
    <circle cx="32" cy="43" r="2" fill="#10b981"/>
    <circle cx="32" cy="49" r="2" fill="#10b981"/>
    
    {/* Arms - round */}
    <ellipse cx="12" cy="46" rx="5" ry="8" fill="#10b981"/>
    <ellipse cx="52" cy="46" rx="5" ry="8" fill="#10b981"/>
  </svg>
);

// Robot Version 5: Simple icon style green/black
export const RobotIconSimple = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="4" r="1.5" fill="#10b981"/>
    <line x1="16" y1="5" x2="16" y2="8" stroke="#000" strokeWidth="1"/>
    <rect x="10" y="8" width="12" height="10" rx="2" fill="#10b981"/>
    <circle cx="13" cy="12" r="1.5" fill="#000"/>
    <circle cx="19" cy="12" r="1.5" fill="#000"/>
    <path d="M13 15 Q16 16.5 19 15" stroke="#000" strokeWidth="1" strokeLinecap="round" fill="none"/>
    <rect x="9" y="18" width="14" height="10" rx="2" fill="#000"/>
    <rect x="12" y="20" width="8" height="4" rx="1" fill="#10b981"/>
    <rect x="6" y="20" width="3" height="6" rx="1" fill="#10b981"/>
    <rect x="23" y="20" width="3" height="6" rx="1" fill="#10b981"/>
  </svg>
);

// Component that shows all versions
export const RobotIconShowcase = () => {
  return (
    <div className="p-8 bg-gray-100 rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Robot Icon Versions</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
        <div className="flex flex-col items-center">
          <RobotGreenBlack1 size={80} />
          <p className="mt-2 text-sm font-medium">Green & Black v1</p>
          <p className="text-xs text-gray-600">Friendly rounded</p>
        </div>
        
        <div className="flex flex-col items-center">
          <RobotGreenWhite1 size={80} />
          <p className="mt-2 text-sm font-medium">Green & White v1</p>
          <p className="text-xs text-gray-600">Square design</p>
        </div>
        
        <div className="flex flex-col items-center">
          <RobotGreenBlack2 size={80} />
          <p className="mt-2 text-sm font-medium">Green & Black v2</p>
          <p className="text-xs text-gray-600">Minimalist</p>
        </div>
        
        <div className="flex flex-col items-center">
          <RobotGreenWhite2 size={80} />
          <p className="mt-2 text-sm font-medium">Green & White v2</p>
          <p className="text-xs text-gray-600">Extra cute</p>
        </div>
        
        <div className="flex flex-col items-center">
          <RobotIconSimple size={64} />
          <p className="mt-2 text-sm font-medium">Simple Icon</p>
          <p className="text-xs text-gray-600">Compact version</p>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-white rounded border border-gray-200">
        <h3 className="font-semibold mb-2">Usage Example:</h3>
        <code className="text-sm bg-gray-50 p-2 rounded block">
          {`import { RobotGreenBlack1 } from '@/components/icons/RobotIcons';
          
<RobotGreenBlack1 size={64} />`}
        </code>
      </div>
    </div>
  );
};