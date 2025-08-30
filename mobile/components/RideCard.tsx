import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { colors } from '../theme/colors';

export default function RideCard({
  ride,
  onPress,
}: {
  ride: any;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: colors.card,
        padding: 14,
        borderRadius: 12,
        marginBottom: 10,
      }}
    >
      <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>
        {ride.origin} → {ride.destination}
      </Text>
      <Text style={{ color: colors.muted, marginTop: 6 }}>
        {ride.departureTime
          ? new Date(ride.departureTime).toLocaleString()
          : '—'}
      </Text>
      <View
        style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}
      >
        <Text style={{ color: colors.text }}>Seats: {ride.seats ?? '—'}</Text>
        <Text style={{ color: colors.success }}>
          {ride.price != null ? `₹ ${ride.price}` : '—'}
        </Text>
      </View>
    </Pressable>
  );
}
