// mobile/src/screens/MyRides.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Alert } from 'react-native';
import { colors } from '../theme/colors';
import { BookingAPI } from '../services/api';

export default function MyRides() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await BookingAPI.mine();
        setItems(Array.isArray(data) ? data : data?.bookings || []);
      } catch (e: any) {
        Alert.alert('Failed', e?.response?.data?.message || e?.message || 'Try again');
      }
    })();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, padding: 16 }}>
      <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800', marginBottom: 10 }}>My Rides</Text>
      <FlatList
        data={items}
        keyExtractor={(it: any, i) => it._id ?? String(i)}
        renderItem={({ item }) => (
          <View style={{ backgroundColor: colors.card, padding: 14, borderRadius: 12, marginBottom: 10 }}>
            <Text style={{ color: colors.text, fontWeight: '700' }}>
              {(item.ride?.origin ?? item.origin)} → {(item.ride?.destination ?? item.destination)}
            </Text>
            <Text style={{ color: colors.muted, marginTop: 4 }}>
              {item.ride?.departureTime ? new Date(item.ride.departureTime).toLocaleString() : '—'}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: colors.muted, textAlign: 'center' }}>Nothing yet</Text>}
      />
    </View>
  );
}
