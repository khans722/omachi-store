'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'green' | 'pink' | 'purple' | 'cream';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'green',
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('green');

  useEffect(() => {
    // 1. Check local storage
    const savedTheme = localStorage.getItem('omachii_theme') as ThemeMode;
    if (savedTheme && ['green', 'pink', 'purple', 'cream'].includes(savedTheme)) {
      setThemeState(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
      return;
    }

    // 2. Or fetch from settings API
    fetch('/api/settings')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data?.themeColor) {
          setThemeState(res.data.themeColor);
          document.documentElement.setAttribute('data-theme', res.data.themeColor);
        } else {
          setThemeState('green');
          document.documentElement.setAttribute('data-theme', 'green');
        }
      })
      .catch(() => {
        setThemeState('green');
        document.documentElement.setAttribute('data-theme', 'green');
      });
  }, []);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    localStorage.setItem('omachii_theme', mode);
    document.documentElement.setAttribute('data-theme', mode);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
