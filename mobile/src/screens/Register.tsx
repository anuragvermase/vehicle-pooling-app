import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { colors } from '../theme/colors';
import { register as doRegister } from '../services/auth';
import { connectSocket } from '../services/socket';

type Props = { navigation: any };

export default function Register({ navigation }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  function validate() {
    if (!name.trim()) return 'Name is required';
    if (!email.trim()) return 'Email is required';
    if (!phone.trim()) return 'Phone is required';
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (confirmPassword !== password) return 'Passwords do not match';
    return null;
  }

  async function onRegister() {
    const err = validate();
    if (err) return Alert.alert('Invalid input', err);

    try {
      setLoading(true);
      await doRegister({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        confirmPassword: password,
        role: 'user',
      });
      await connectSocket();

      // ✅ After register, jump into app stack
      // If you want Dashboard first, change 'Landing' -> 'Dashboard'
      navigation.reset({ index: 0, routes: [{ name: 'Landing' as never }] });
    } catch (e: any) {
      console.log('REGISTER ERROR =>', e?.response?.status, e?.response?.data, e?.message);
      Alert.alert('Registration failed', e?.response?.data?.message || e?.message || 'Try again');
    } finally {
      setLoading(false);
    }
  }

  const input = { backgroundColor: '#1f2937', color: colors.text, padding: 12, borderRadius: 10, marginBottom: 10 };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, padding: 20 }}>
      <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800', marginBottom: 12 }}>
        Create account
      </Text>

      <TextInput placeholder="Name" placeholderTextColor={colors.muted} value={name} onChangeText={setName}
        autoCapitalize="words" style={input} />
      <TextInput placeholder="Email" placeholderTextColor={colors.muted} value={email} onChangeText={setEmail}
        keyboardType="email-address" autoCapitalize="none" style={input} />
      <TextInput placeholder="Phone" placeholderTextColor={colors.muted} value={phone} onChangeText={setPhone}
        keyboardType="phone-pad" style={input} />
      <TextInput placeholder="Password" placeholderTextColor={colors.muted} value={password} onChangeText={setPassword}
        secureTextEntry style={input} />
      <TextInput placeholder="Confirm Password" placeholderTextColor={colors.muted} value={confirmPassword}
        onChangeText={setConfirmPassword} secureTextEntry style={[input, { marginBottom: 16 }]} />

      <Pressable onPress={onRegister} disabled={loading}
        style={{ backgroundColor: colors.primary, padding: 12, borderRadius: 10 }}>
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: '700' }}>
          {loading ? 'Please wait…' : 'Register'}
        </Text>
      </Pressable>
    </View>
  );
}
