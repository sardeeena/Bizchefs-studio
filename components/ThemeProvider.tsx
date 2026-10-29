'use client';

import React, { createContext, useContext, useEffect, useState, useSyncExternalStore } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  mounted: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const emptySubscribe = () => () => {};
const getIsMounted = () => true;
const getServerIsMounted = () => false;

function updateThemeInDOM(theme: Theme) {
  if (typeof document === 'undefined') return;
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const mounted = useSyncExternalStore(emptySubscribe, getIsMounted, getServerIsMounted);

  useEffect(() => {
    // Asynchronously synchronize theme with client storage / preference after mount
    Promise.resolve().then(() => {
      try {
        const saved = localStorage.getItem('bizchefs_theme') as Theme | null;
        if (saved === 'light' || saved === 'dark') {
          setThemeState(saved);
          updateThemeInDOM(saved);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
          setThemeState('light');
          updateThemeInDOM('light');
        } else {
          setThemeState('dark');
          updateThemeInDOM('dark');
        }
      } catch {
        // Ignore storage access error
      }
    });
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('bizchefs_theme', newTheme);
    } catch {
      // Ignore storage access error
    }
    updateThemeInDOM(newTheme);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, mounted, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
