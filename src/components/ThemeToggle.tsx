// src/components/ThemeToggle.tsx

import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { mode, colors, toggleTheme } = useTheme();

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      style={[
        styles.button,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
    >
      <Ionicons 
        name={mode === 'light' ? 'moon' : 'sunny'} 
        size={18} 
        color={mode === 'light' ? '#4A4A4A' : '#FFD700'} 
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
});

export default ThemeToggle;