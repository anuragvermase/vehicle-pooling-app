import axios from 'axios';
import Constants from 'expo-constants';
import { Storage } from './storage';

const API_URL = Constants.expoConfig?.extra?.API_URL as string;
export const api = axios.create({ baseURL: API_URL, timeout: 15000 });

api.interceptors.request.use(async (config) => {
  const token = await Storage.get('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const AuthAPI = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (payload: any) => api.post('/auth/register', payload),
  me: () => api.get('/auth/me'),
};

export const RideAPI = {
  // keep this (some servers implement GET list)
  list: (q: any) => api.get('/rides', { params: q }),

  // add this (most common pattern)
  search: (payload: { origin?: string; destination?: string; date?: string; passengers?: number }) =>
    api.post('/rides/search', payload),

  create: (payload: any) => api.post('/rides', payload),
};

export const BookingAPI = {
  book: (rideId: string) => api.post(`/bookings/${rideId}`),
  mine: () => api.get('/bookings/my'),
};

export const UserAPI = {
  savePushToken: (token: string) => api.post('/notifications/register', { token }),
};


