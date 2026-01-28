import React from 'react';
import { Bot } from 'lucide-react';
import ErrorBoundary from './ErrorBoundary';

interface SafeIconProps {
  component: React.ComponentType<any>;
  fallbackIcon?: React.ComponentType<any>;
  size?: number;
  className?: string;
  [key: string]: any;
}

export function SafeIcon({ 
  component: IconComponent, 
  fallbackIcon: FallbackIcon = Bot,
  size = 16,
  className = "",
  ...props 
}: SafeIconProps) {
  const fallback = (
    <FallbackIcon 
      size={size} 
      className={`text-muted-foreground ${className}`}
      {...props}
    />
  );

  return (
    <ErrorBoundary fallback={fallback}>
      <IconComponent 
        size={size} 
        className={className}
        {...props}
      />
    </ErrorBoundary>
  );
}