import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themes, ThemeKey, GameTheme, defaultTheme } from '@/constants/theme';

interface ThemeContextType {
  theme: GameTheme;
  themeKey: ThemeKey;
  setTheme: (key: ThemeKey) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeKey, setThemeKey] = useState<ThemeKey>('cyberpunk');

  useEffect(() => {
    AsyncStorage.getItem('selectedTheme').then((saved) => {
      if (saved && themes[saved as ThemeKey]) {
        setThemeKey(saved as ThemeKey);
      }
    });
  }, []);

  const setTheme = (key: ThemeKey) => {
    setThemeKey(key);
    AsyncStorage.setItem('selectedTheme', key);
  };

  return (
    <ThemeContext.Provider value={{ theme: themes[themeKey], themeKey, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
