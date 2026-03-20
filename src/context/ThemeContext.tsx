// src/context/ThemeContext.tsx

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ThemeColors, ThemeMode } from '../types';

interface ThemeContextType {
  mode: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
}

const lightColors: ThemeColors = {
  background: '#F5F7F8',
  card: '#FFFFFF',
  text: '#2C3E50',
  subText: '#7F8C8D',
  border: '#E1E8ED',
  primary: '#3B719F',
  danger: '#E74C3C',
  buttonText: '#FFFFFF',
  inputBackground: '#F0F3F5',
  placeholder: '#95A5A6',
  shadow: '#000000',
};

const darkColors: ThemeColors = {
  background: '#121212',
  card: '#1E1E1E',
  text: '#F5F7F8',
  subText: '#AAB7B8',
  border: '#2C3E50',
  primary: '#5D9CEC',
  danger: '#FF6B6B',
  buttonText: '#FFFFFF',
  inputBackground: '#2A2A2A',
  placeholder: '#7F8C8D',
  shadow: '#000000',
};

const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  colors: lightColors,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<ThemeMode>('light');

  const toggleTheme = () =>
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));

  const colors = mode === 'light' ? lightColors : darkColors;

  return (
    <ThemeContext.Provider value={{ mode, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);