// App.tsx

import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { RootStackParamList } from './src/types';
import HomeScreen from './src/screens/HomeScreen/HomeScreen';
import AddEntryScreen from './src/screens/AddEntryScreen/AddEntryScreen';
import { registerForNotificationsAsync } from './src/notifications/notificationService';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Must be called at module level (outside component)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function AppNavigator() {
  const { mode, colors } = useTheme();

  const navTheme = {
    ...(mode === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(mode === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
      notification: colors.primary,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen 
              name="Home" 
              component={HomeScreen} 
            />
            <Stack.Screen 
              name="AddEntry" 
              component={AddEntryScreen} 
            />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  useEffect(() => {
    // Request notification permissions on mount
    registerForNotificationsAsync();

    // Handle notification interactions (e.g. tapping a notification)
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('[App] Notification tapped:', response);
      }
    );

    return () => subscription.remove();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}