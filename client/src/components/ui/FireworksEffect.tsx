import { useEffect, useState } from "react";
// Lightweight CSS animations - no heavy framer-motion
const AnimatePresence = ({ children }: any) => children;
const MotionDiv = ({ children, className, ...props }: any) => (
  <div className={`transition-all duration-300 ${className || ""}`} {...props}>
    {children}
  </div>
);

interface FireworksEffectProps {
  isActive: boolean;
  onComplete?: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  delay: number;
}

export function FireworksEffect({ isActive, onComplete }: FireworksEffectProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showEffect, setShowEffect] = useState(false);

  useEffect(() => {
    if (isActive) {
      setShowEffect(true);
      generateFireworks();
      
      const timer = setTimeout(() => {
        setShowEffect(false);
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  const generateFireworks = () => {
    const colors = [
      '#FFD700', '#FFA500', '#FF8C00', '#DAA520', 
      '#F0E68C', '#FFFF00', '#FFB347', '#FFC649'
    ];

    const newParticles: Particle[] = [];
    
    // Create multiple firework bursts
    for (let burst = 0; burst < 4; burst++) {
      const centerX = Math.random() * 80 + 10; // 10-90% of screen width
      const centerY = Math.random() * 60 + 20; // 20-80% of screen height
      
      // Create particles for each burst
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const distance = Math.random() * 150 + 50;
        
        newParticles.push({
          id: burst * 12 + i,
          x: centerX + Math.cos(angle) * distance,
          y: centerY + Math.sin(angle) * distance,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 8 + 4,
          delay: burst * 0.3 + Math.random() * 0.2,
        });
      }
    }

    setParticles(newParticles);
  };

  return (
    <AnimatePresence>
      {showEffect && (
        <MotionDiv
          className="fixed inset-0 pointer-events-none z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {particles.map((particle) => (
            <MotionDiv
              key={particle.id}
              className="absolute rounded-full"
              style={{
                backgroundColor: particle.color,
                width: particle.size,
                height: particle.size,
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                boxShadow: `0 0 ${particle.size}px ${particle.color}`,
              }}
              initial={{ 
                scale: 0, 
                opacity: 0,
                x: -particle.x * 0.8,
                y: -particle.y * 0.8
              }}
              animate={{ 
                scale: [0, 1.2, 0.8, 0],
                opacity: [0, 1, 0.8, 0],
                x: 0,
                y: 0
              }}
              transition={{
                duration: 1.5,
                delay: particle.delay,
                ease: "easeOut"
              }}
            />
          ))}
          
          {/* Sparkle overlay */}
          <MotionDiv
            className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-200/20 via-orange-200/20 to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0] }}
            transition={{ duration: 2, repeat: 2 }}
          />
        </MotionDiv>
      )}
    </AnimatePresence>
  );
}