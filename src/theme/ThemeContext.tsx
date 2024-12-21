import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useColorScheme, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, ThemeType } from './types';
import { lightTheme, darkTheme } from './themes';
import { createThemeTransition } from '../utils/animations';

interface ThemeContextType {
  theme: Theme;
  themeType: ThemeType;
  setThemeType: (type: ThemeType) => void;
  toggleTheme: () => void;
  themeTransition: Animated.Value;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  themeType: 'light',
  setThemeType: () => {},
  toggleTheme: () => {},
  themeTransition: new Animated.Value(0),
});

const THEME_STORAGE_KEY = '@todo_app_mini:theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeType, setThemeType] = useState<ThemeType>(systemColorScheme as ThemeType || 'light');
  const { animation: themeTransition, startAnimation } = createThemeTransition();

  useEffect(() => {
    // 保存されたテーマの読み込み
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme) {
          setThemeType(savedTheme as ThemeType);
          startAnimation(savedTheme === 'dark' ? 1 : 0);
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
      }
    };
    loadTheme();
  }, []);

  const handleSetThemeType = useCallback(async (type: ThemeType) => {
    setThemeType(type);
    startAnimation(type === 'dark' ? 1 : 0);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, type);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = themeType === 'light' ? 'dark' : 'light';
    handleSetThemeType(newTheme);
  }, [themeType, handleSetThemeType]);

  const theme = themeType === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeType,
        setThemeType: handleSetThemeType,
        toggleTheme,
        themeTransition,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 