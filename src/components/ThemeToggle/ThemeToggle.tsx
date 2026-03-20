// src/components/ThemeToggle/ThemeToggle.tsx

import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import styles from './ThemeToggle.styles';

const ThemeToggle: React.FC = () => {
  const { mode, toggleTheme } = useTheme();

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      style={styles.button} 
      accessibilityRole="button"
      accessibilityLabel={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
    >
      <Ionicons 
        name={mode === 'light' ? 'moon' : 'sunny'} 
        size={24} 
        color={mode === 'light' ? '#4A4A4A' : '#F5F7F8'} 
      />
    </TouchableOpacity>
  );
};

export default ThemeToggle;