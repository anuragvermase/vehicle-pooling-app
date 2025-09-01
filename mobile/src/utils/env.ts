import Constants from 'expo-constants';

type Extra = {
  API_BASE_URL: string;  // includes /api
  SOCKET_URL: string;
  GOOGLE_MAPS_API_KEY: string;
};

const extra = (Constants?.expoConfig?.extra ?? {}) as Partial<Extra>;

export const API_BASE_URL = extra.API_BASE_URL ?? '';
export const SOCKET_URL = extra.SOCKET_URL ?? '';
export const GOOGLE_MAPS_API_KEY = extra.GOOGLE_MAPS_API_KEY ?? '';
