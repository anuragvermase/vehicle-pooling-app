import io from 'socket.io-client';
import Constants from 'expo-constants';
import { Storage } from './storage';

const SOCKET_URL = Constants.expoConfig?.extra?.SOCKET_URL as string;
export const socket = io(SOCKET_URL, { transports: ['websocket'], autoConnect: false });

export async function connectSocket() {
  const token = await Storage.get('accessToken');
  socket.auth = { token };
  if (!socket.connected) socket.connect();
}

export function joinRideRoom(rideId: string) {
  socket.emit('ride:join', { rideId });
}

export function emitLocation(rideId: string, lat: number, lng: number) {
  socket.emit('location:update', { rideId, lat, lng, ts: Date.now() });
}
