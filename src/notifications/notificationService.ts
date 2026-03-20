// src/notifications/notificationService.ts

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

/**
 * Request notification permissions and set up the Android channel.
 * Returns true if permission was granted, false otherwise.
 */
export const registerForNotificationsAsync = async (): Promise<boolean> => {
  if (!Device.isDevice) {
    console.warn('[Notifications] Must use a physical device for push notifications.');
    // Allow on simulators for dev convenience — local notifications still work
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('travel-diary', {
      name: 'Travel Diary',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4A7C59',
      sound: 'default',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('[Notifications] Permission not granted.');
    return false;
  }

  return true;
};

/**
 * Send an immediate local push notification after saving a travel entry.
 */
export const sendEntrySavedNotification = async (address: string): Promise<void> => {
  try {
    const hasPermission = await registerForNotificationsAsync();
    if (!hasPermission) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📍 Travel Entry Saved!',
        body: `Your entry at "${address}" has been saved to your diary.`,
        sound: 'default',
        data: { type: 'entry_saved' },
      },
      trigger: null, // immediate
    });
  } catch (error) {
    console.error('[Notifications] Failed to send notification:', error);
  }
};