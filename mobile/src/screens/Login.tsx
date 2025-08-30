import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { colors } from '../theme/colors';
import * as Auth from '../services/auth';
import { connectSocket } from '../services/socket';

type Props = { navigation: any };

export default function Login({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function onLogin() {
    if (!email.trim() || !password) {
      Alert.alert('Missing info', 'Please enter email and password');
      return;
    }
    try {
      setLoading(true);
      await Auth.login(email.trim(), password);
      await connectSocket();

      // ✅ After login, jump into the app stack root
      // If you want to land on Dashboard, change 'Landing' -> 'Dashboard'
      navigation.reset({ index: 0, routes: [{ name: 'Landing' as never }] });
    } catch (e: any) {
      console.log('LOGIN ERROR =>', e?.response?.status, e?.response?.data, e?.message);
      Alert.alert('Login failed', e?.response?.data?.message || e?.message || 'Try again');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, padding: 20 }}>
      <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800', marginBottom: 12 }}>
        Welcome back
      </Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor={colors.muted}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{ backgroundColor: '#1f2937', color: colors.text, padding: 12, borderRadius: 10, marginBottom: 10 }}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor={colors.muted}
        value={password}
        secureTextEntry
        onChangeText={setPassword}
        style={{ backgroundColor: '#1f2937', color: colors.text, padding: 12, borderRadius: 10, marginBottom: 16 }}
      />

      <Pressable
        disabled={loading}
        onPress={onLogin}
        style={{ backgroundColor: colors.primary, padding: 12, borderRadius: 10 }}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: '700' }}>
          {loading ? 'Please wait…' : 'Login'}
        </Text>
      </Pressable>

      <Pressable onPress={() => navigation.navigate('Register')} style={{ marginTop: 14 }}>
        <Text style={{ color: colors.muted, textAlign: 'center' }}>
          No account? Register
        </Text>
      </Pressable>
    </View>
  );
}
