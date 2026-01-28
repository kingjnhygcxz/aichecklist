import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [location, setLocation] = useLocation();
  const checkingRef = useRef(false);
  const mountedRef = useRef(false);

  const checkAuth = () => {
    if (checkingRef.current) return isAuthenticated;
    checkingRef.current = true;
    
    try {
      const sessionId = localStorage.getItem('sessionId');
      const isAuth = !!sessionId;
      console.log('Auth check - sessionId exists:', !!sessionId, 'setting authenticated to:', isAuth);
      
      if (mountedRef.current) {
        setIsAuthenticated(isAuth);
      }
      
      checkingRef.current = false;
      return isAuth;
    } catch (error) {
      console.error('Auth check error:', error);
      checkingRef.current = false;
      return false;
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    
    // Initial auth check
    const initialCheck = () => {
      try {
        const sessionId = localStorage.getItem('sessionId');
        const isAuth = !!sessionId;
        console.log('Initial auth check - sessionId exists:', !!sessionId);
        setIsAuthenticated(isAuth);
      } catch (error) {
        console.error('Initial auth check error:', error);
        setIsAuthenticated(false);
      }
    };

    initialCheck();

    // Listen for storage changes (logout in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sessionId' && mountedRef.current) {
        console.log('Storage change detected for sessionId');
        setTimeout(() => checkAuth(), 100);
      }
    };

    // Listen for custom login events
    const handleLoginEvent = () => {
      console.log('Login event detected, rechecking auth');
      if (mountedRef.current) {
        setTimeout(() => checkAuth(), 200);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLoggedIn', handleLoginEvent);

    return () => {
      mountedRef.current = false;
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLoggedIn', handleLoginEvent);
    };
  }, []);

  // Re-check authentication when location changes (but less aggressively)
  useEffect(() => {
    if (mountedRef.current && location) {
      console.log('Location changed to:', location, 'rechecking auth');
      // Only recheck if we're not already authenticated
      if (isAuthenticated === null || isAuthenticated === false) {
        setTimeout(() => checkAuth(), 100);
      }
    }
  }, [location]);

  const logout = () => {
    try {
      localStorage.removeItem('sessionId');
      setIsAuthenticated(false);
      setLocation('/auth');
    } catch (error) {
      console.error('Logout error:', error);
      setLocation('/auth');
    }
  };

  return {
    isAuthenticated,
    logout,
    isLoading: isAuthenticated === null,
  };
}