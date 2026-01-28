import React, { useEffect, useState } from 'react';

interface ConfettiProps {
  duration?: number;
  pieces?: number;
  spread?: number;
  onComplete?: () => void;
}

// Lightweight CSS confetti alternative
const SimpleConfetti: React.FC<ConfettiProps> = ({ 
  duration = 2000, 
  pieces = 50, 
  spread = 120,
  onComplete 
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onComplete) {
        setTimeout(onComplete, 500); // Allow fade out
      }
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  if (!visible) return null;

  // Generate simple confetti pieces
  const confettiPieces = Array.from({ length: pieces }, (_, i) => {
    const colors = ['#10b981', '#6ee7b7', '#34d399', '#a7f3d0', '#d1fae5'];
    const shapes = ['●', '■', '▲'];
    
    return (
      <div
        key={i}
        className="fixed pointer-events-none animate-bounce"
        style={{
          left: `calc(50% + ${(Math.random() - 0.5) * spread}px)`,
          top: '10%',
          color: colors[Math.floor(Math.random() * colors.length)],
          fontSize: `${Math.random() * 8 + 8}px`,
          animationDelay: `${Math.random() * 0.5}s`,
          animationDuration: `${duration / 1000}s`,
          zIndex: 1000
        }}
      >
        {shapes[Math.floor(Math.random() * shapes.length)]}
      </div>
    );
  });

  return (
    <div className={`fixed inset-0 pointer-events-none transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      {confettiPieces}
    </div>
  );
};

export default SimpleConfetti;