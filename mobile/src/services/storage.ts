import * as SecureStore from 'expo-secure-store';
export const Storage = {
  set: (k: string, v: string) => SecureStore.setItemAsync(k, v),
  get: (k: string) => SecureStore.getItemAsync(k),
  del: (k: string) => SecureStore.deleteItemAsync(k),
};
