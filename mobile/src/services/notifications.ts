import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { UserAPI } from './api';

// Show alerts by default
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const isExpoGo =
  !Constants.appOwnership || Constants.appOwnership === 'expo';

export async function registerForPush() {
  // 1) Skip in Expo Go (SDK 53 removed remote push there)
  if (isExpoGo) {
    console.log('Skipping push registration in Expo Go (use an EAS dev build).');
    return null;
  }

  try {
    // 2) Android channel (nice to have)
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    // 3) Ask permission
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Push permission not granted');
      return null;
    }

    // 4) Get Expo push token (SDK 53 may require projectId)
    // Try to read projectId from config; if missing, call without options.
    const projectId =
      (Constants?.expoConfig as any)?.extra?.eas?.projectId ||
      (Constants as any)?.easConfig?.projectId;

    const tokenResp = projectId
      ? await Notifications.getExpoPushTokenAsync({ projectId })
      : await Notifications.getExpoPushTokenAsync();

    const token = tokenResp.data;
    console.log('Expo push token:', token);

    // 5) Send to your backend
    try {
      await UserAPI.savePushToken(token);
    } catch (e) {
      console.log('savePushToken failed:', e);
    }

    return token;
  } catch (e) {
    console.log('registerForPush error:', e);
    return null;
  }
}
