// src/components/ThemeToggle.tsx

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
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
      <Text style={styles.icon}>{mode === 'light' ? '🌙' : '☀️'}</Text>
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
  icon: {
    fontSize: 18,
  },
});

export default ThemeToggle;