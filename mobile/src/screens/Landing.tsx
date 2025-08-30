import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { colors } from '../theme/colors';
import { Storage } from '../services/storage';

export default function Landing({ navigation }: any) {
  const [hasToken, setHasToken] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const t = await Storage.get('accessToken');
      setHasToken(!!t);
    })();
  }, []);

  const PrimaryBtn = ({ title, onPress }: any) => (
    <Pressable onPress={onPress} style={{ backgroundColor: '#22c55e', padding: 16, borderRadius: 30, marginBottom: 12 }}>
      <Text style={{ color: 'white', textAlign: 'center', fontWeight: '700', fontSize: 16 }}>{title}</Text>
    </Pressable>
  );
  const OutlineBtn = ({ title, onPress }: any) => (
    <Pressable onPress={onPress} style={{ borderColor: 'white', borderWidth: 2, padding: 16, borderRadius: 30, marginBottom: 12 }}>
      <Text style={{ color: 'white', textAlign: 'center', fontWeight: '700', fontSize: 16 }}>{title}</Text>
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#6366f1', justifyContent: 'center', padding: 24 }}>
      <Text style={{ fontSize: 28, fontWeight: '800', color: 'white', marginBottom: 6 }}>Share Rides,</Text>
      <Text style={{ fontSize: 28, fontWeight: '800', color: '#22c55e', marginBottom: 6 }}>Save Money</Text>
      <Text style={{ fontSize: 28, fontWeight: '800', color: 'white', marginBottom: 20 }}>Help the Planet 🌍</Text>
      <Text style={{ color: '#e0e7ff', fontSize: 14, marginBottom: 24 }}>
        Find the perfect ride match in seconds.
      </Text>

      {/* If logged in: show Find/Offer + Logout */}
      {hasToken ? (
        <>
          <PrimaryBtn title="🚀 Find a Ride" onPress={() => navigation.navigate('FindRides')} />
          <OutlineBtn title="🧳 Offer a Ride" onPress={() => navigation.navigate('CreateRide')} />
          <Pressable
            onPress={async () => { await Storage.del('accessToken'); setHasToken(false); }}
            style={{ marginTop: 10 }}
          >
            <Text style={{ color: 'white', textAlign: 'center' }}>Logout</Text>
          </Pressable>
        </>
      ) : (
        // If logged out: show Login/Register
        <>
          <PrimaryBtn title="Login" onPress={() => navigation.navigate('Login')} />
          <OutlineBtn title="Create an account" onPress={() => navigation.navigate('Register')} />
        </>
      )}
    </View>
  );
}
