import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'nativewind';
import * as SecureStore from 'expo-secure-store';

type ThemeContextType = {
  isDark: boolean;
  toggleTheme: (isDark: boolean) => Promise<void>;
  themeLoaded: boolean;
};

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: async () => {},
  themeLoaded: false,
});

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [themeLoaded, setThemeLoaded] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const storedTheme = await SecureStore.getItemAsync('appTheme');
      if (storedTheme === 'dark') {
        setColorScheme('dark');
      } else {
        setColorScheme('light'); // default to light explicitly preventing auto dark
      }
    } catch (e) {
      setColorScheme('light');
    } finally {
      setThemeLoaded(true);
    }
  };

  const toggleTheme = async (newValue: boolean) => {
    setColorScheme(newValue ? 'dark' : 'light');
    await SecureStore.setItemAsync('appTheme', newValue ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, themeLoaded }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useAppTheme = () => useContext(ThemeContext);
