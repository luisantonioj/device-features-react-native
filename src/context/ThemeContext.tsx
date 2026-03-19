// src/context/ThemeContext.tsx

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ThemeColors, ThemeMode } from '../types';

interface ThemeContextType {
  mode: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
}

const lightColors: ThemeColors = {
  background: '#F7F3EE',
  card: '#FFFFFF',
  text: '#1A1A2E',
  subText: '#6B6B7B',
  border: '#E2DDD8',
  primary: '#4A7C59',
  danger: '#D94F4F',
  buttonText: '#FFFFFF',
  inputBackground: '#FFFFFF',
  placeholder: '#A0A0B0',
  shadow: '#00000020',
};

const darkColors: ThemeColors = {
  background: '#0F0F1A',
  card: '#1C1C2E',
  text: '#F0EBE3',
  subText: '#9999AA',
  border: '#2E2E42',
  primary: '#5FAD72',
  danger: '#E05C5C',
  buttonText: '#FFFFFF',
  inputBackground: '#252538',
  placeholder: '#6666778',
  shadow: '#00000060',
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