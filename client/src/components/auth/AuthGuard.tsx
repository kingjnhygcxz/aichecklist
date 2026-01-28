import { useAuth } from '@/hooks/useAuth';
import { ReactNode, useEffect, useState } from 'react';
import { Auth } from '@/pages/Auth';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [showFallback, setShowFallback] = useState(false);
  
  console.log("AuthGuard check - isLoading:", isLoading, "isAuthenticated:", isAuthenticated);

  // Safety timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.log("AuthGuard timeout - forcing fallback");
        setShowFallback(true);
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timeout);
  }, [isLoading]);

  // Reset fallback when auth state changes
  useEffect(() => {
    if (!isLoading) {
      setShowFallback(false);
    }
  }, [isLoading]);

  if (isLoading && !showFallback) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || showFallback) {
    console.log("Rendering Auth component because user is not authenticated or timeout occurred");
    return <Auth />;
  }

  return <>{children}</>;
}