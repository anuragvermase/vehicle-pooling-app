// mobile/src/services/auth.ts
import { AuthAPI } from './api';
import { Storage } from './storage';

function pickToken(d: any): string | null {
  return (
    d?.accessToken ||
    d?.token ||
    d?.access_token ||
    d?.jwt ||
    d?.data?.accessToken ||
    d?.data?.token ||
    d?.tokens?.access?.token ||
    null
  );
}

export async function login(email: string, password: string) {
  const { data, headers } = await AuthAPI.login(email, password);
  console.log('LOGIN RESPONSE =>', data);

  let token = pickToken(data);
  if (!token && typeof headers?.authorization === 'string') {
    const h = headers.authorization.trim();
    token = h.startsWith('Bearer ') ? h.slice(7) : h;
  }
  if (!token) throw new Error('No token in login response.');

  await Storage.set('accessToken', String(token));
  return data;
}

export async function register(payload: {
  name: string; email: string; phone?: string;
  password: string; confirmPassword?: string; role?: string;
}) {
  const body = {
    name: payload.name,
    fullName: payload.name,
    email: payload.email,
    phone: payload.phone,
    password: payload.password,
    confirmPassword: payload.confirmPassword ?? payload.password,
    role: payload.role ?? 'user',
  };
  const { data, headers } = await AuthAPI.register(body);
  console.log('REGISTER RESPONSE =>', data);

  let token = pickToken(data);
  if (!token && typeof headers?.authorization === 'string') {
    const h = headers.authorization.trim();
    token = h.startsWith('Bearer ') ? h.slice(7) : h;
  }
  if (token) await Storage.set('accessToken', String(token));
  return data;
}

export async function logout() {
  await Storage.del('accessToken');
}
