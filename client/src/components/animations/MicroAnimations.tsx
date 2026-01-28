import React, { ReactNode } from "react";

// Lightweight CSS-only animations to replace framer-motion

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

interface HoverScaleProps {
  children: ReactNode;
  scale?: number;
  className?: string;
}

interface ButtonPressProps {
  children: ReactNode;
  scale?: number;
  className?: string;
}

interface MotionDivProps {
  children: ReactNode;
  className?: string;
  initial?: any;
  animate?: any;
  exit?: any;
  transition?: any;
  layout?: boolean;
  style?: React.CSSProperties;
}

// CSS-only Fade In
export const FadeIn: React.FC<FadeInProps> = ({ 
  children, 
  delay = 0, 
  duration = 0.3, 
  className = "" 
}) => {
  const style: React.CSSProperties = {
    animation: `fadeIn ${duration}s ease-in-out ${delay}s both`
  };

  return (
    <div className={`animate-fade-in ${className}`} style={style}>
      {children}
    </div>
  );
};

// CSS-only Hover Scale
export const HoverScale: React.FC<HoverScaleProps> = ({ 
  children, 
  scale = 1.05, 
  className = "" 
}) => {
  return (
    <div className={`transition-transform duration-200 hover:scale-105 ${className}`}>
      {children}
    </div>
  );
};

// CSS-only Button Press
export const ButtonPress: React.FC<ButtonPressProps> = ({ 
  children, 
  scale = 0.95, 
  className = "" 
}) => {
  return (
    <div className={`transition-transform duration-150 active:scale-95 ${className}`}>
      {children}
    </div>
  );
};

// Simple Motion Div fallback
const MotionDiv: React.FC<MotionDivProps> = ({ 
  children, 
  className = "",
  style,
  initial,
  animate,
  ...props 
}) => {
  // Apply basic CSS transitions based on animate props
  let cssClasses = className;
  let cssStyle = { ...style };

  // Handle common animation patterns
  if (initial?.opacity === 0 && animate?.opacity === 1) {
    cssClasses += " animate-fade-in";
  }
  if (initial?.scale && animate?.scale) {
    cssClasses += " animate-scale-in";
  }

  return (
    <div className={cssClasses} style={cssStyle} {...props}>
      {children}
    </div>
  );
};

export default MotionDiv;