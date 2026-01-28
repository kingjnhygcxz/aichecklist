import React, { ReactNode, Suspense } from "react";

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

// Lazy load motion.div
const LazyMotionDiv = React.lazy(async () => {
  const { motion } = await import('framer-motion');
  
  const MotionDiv: React.FC<MotionDivProps> = (props) => {
    return <motion.div {...props} />;
  };

  return { default: MotionDiv };
});

// Fallback component (regular div) when motion library isn't loaded
const StaticDiv: React.FC<MotionDivProps> = ({ 
  children, 
  className = "",
  style,
  ...rest 
}) => (
  <div className={className} style={style}>
    {children}
  </div>
);

// Main export with Suspense wrapper
const MotionDiv: React.FC<MotionDivProps> = (props) => (
  <Suspense fallback={<StaticDiv {...props} />}>
    <LazyMotionDiv {...props} />
  </Suspense>
);

export default MotionDiv;