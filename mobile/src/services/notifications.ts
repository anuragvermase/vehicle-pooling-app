import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { UserAPI } from './api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function registerForPush() {
  // 👇 Skip push setup inside Expo Go
  if (Constants.appOwnership === 'expo') {
    console.log('Skipping push registration in Expo Go (use a dev build to test push).');
    return null;
  }

  // Normal push setup (works in custom dev/production builds)
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') throw new Error('Push permission not granted');

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  await UserAPI.savePushToken(token);
  return token;
}
