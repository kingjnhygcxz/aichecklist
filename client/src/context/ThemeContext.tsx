import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

type Theme = "light" | "dark" | "psychedelic" | "purple-gold" | "white-red" | "orange-white";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Check for saved theme preference or use system preference
  const [theme, setTheme] = useState<Theme>('light');
  
  // Initialize theme on client-side only
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      // Check localStorage first
      const savedTheme = localStorage.getItem('theme') as Theme;
      if (savedTheme && ['light', 'dark', 'psychedelic', 'purple-gold', 'white-red', 'orange-white'].includes(savedTheme)) {
        setTheme(savedTheme);
        return;
      }

      // Otherwise use system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
        return;
      }

      // Default is already set to light
    } catch (error) {
      console.error('Error initializing theme:', error);
      // Keep default theme if there's an error
    }
  }, []);

  // Update HTML class when theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const root = window.document.documentElement;
      
      // Remove the old theme class
      root.classList.remove('light', 'dark', 'psychedelic', 'purple-gold', 'white-red', 'orange-white');
      
      // Add the new theme class
      root.classList.add(theme);
      
      // Save theme preference to localStorage
      localStorage.setItem('theme', theme);
    } catch (error) {
      console.error('Error updating theme:', error);
    }
  }, [theme]);

  // Cycle through all themes
  const toggleTheme = () => {
    setTheme((prevTheme) => {
      switch (prevTheme) {
        case 'light':
          return 'dark';
        case 'dark':
          return 'purple-gold';
        case 'purple-gold':
          return 'white-red';
        case 'white-red':
          return 'orange-white';
        case 'orange-white':
          return 'psychedelic';
        case 'psychedelic':
          return 'light';
        default:
          return 'light';
      }
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  
  // Return a default context if undefined to avoid crashes
  if (context === undefined) {
    console.error('useTheme must be used within a ThemeProvider');
    // Return fallback values instead of throwing
    return {
      theme: 'light' as Theme,
      toggleTheme: () => console.warn('ThemeProvider not initialized properly')
    };
  }
  
  return context;
}