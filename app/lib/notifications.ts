import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

/**
 * Registers the device for Expo Push Notifications.
 * 
 * Logic:
 * 1. Checks if running in Expo Go (which has limited support for notifications in newer SDKs).
 * 2. Requests user permission for push notifications if not already granted.
 * 3. Configures Android notification channels (vibration, light color).
 * 4. Retrieves the Expo Push Token using the project's EAS ID.
 * 
 * @returns {Promise<string|null>} - The Expo Push Token string or null if registration failed.
 */
export async function registerForPushNotificationsAsync() {
  if (isExpoGo) {
    console.log('Push notifications are not supported in Expo Go (SDK 53+). Please use a development build.');
    return null;
  }

  // Dynamic import to prevent top-level resolution errors in Expo Go
  const Notifications = require('expo-notifications');

  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#D4AF37',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
    })).data;
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}
