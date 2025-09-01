// src/screens/FindRides.tsx
import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { RideAPI, asMessage, RideDto } from '../services/api';
import LocationInput from '../../components/LocationInput';
import { PlaceLite } from '../services/places';

const SCREEN = Dimensions.get('window');
const MAP_HEIGHT = Math.min(320, SCREEN.height * 0.4);

export default function FindRides({ route }: any) {
  const initialFrom = route?.params?.from as string | undefined;
  const initialTo = route?.params?.to as string | undefined;

  const [from, setFrom] = useState<PlaceLite | null>(initialFrom ? { text: initialFrom } : null);
  const [to, setTo] = useState<PlaceLite | null>(initialTo ? { text: initialTo } : null);
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<RideDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mapRef = useRef<MapView | null>(null);

  const initialRegion = useMemo(
    () => ({
      latitude: 28.6139,     // New Delhi fallback
      longitude: 77.2090,
      latitudeDelta: 0.5,
      longitudeDelta: 0.5,
    }),
    []
  );

  const fitMap = () => {
    const a = from && typeof from.lat === 'number' && typeof from.lng === 'number';
    const b = to && typeof to.lat === 'number' && typeof to.lng === 'number';
    if (a && b && mapRef.current) {
      mapRef.current.fitToCoordinates(
        [
          { latitude: from!.lat!, longitude: from!.lng! },
        { latitude: to!.lat!, longitude: to!.lng! },
        ],
        { edgePadding: { top: 60, right: 60, bottom: 60, left: 60 }, animated: true }
      );
    } else if (a && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: from!.lat!,
        longitude: from!.lng!,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      });
    }
  };

  const search = async () => {
    setError(null);
    setList(null);
    try {
      setLoading(true);
      const data = await RideAPI.list({ from: from?.text, to: to?.text });
      setList(data || []);
      fitMap();
    } catch (e) {
      setError(asMessage(e));
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  const marker =
    (p: PlaceLite | null, color: string) =>
      p && typeof p.lat === 'number' && typeof p.lng === 'number'
        ? <Marker coordinate={{ latitude: p.lat as number, longitude: p.lng as number }} pinColor={color} />
        : null;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#0B0F14' }}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      {/* Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ width: '100%', height: MAP_HEIGHT }}
        initialRegion={initialRegion}
        onMapReady={fitMap}
      >
        {marker(from, '#22c55e')}
        {marker(to, '#3b82f6')}
      </MapView>

      {/* Panel */}
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{ color: 'white', fontSize: 22, fontWeight: '800', marginBottom: 12 }}>
          Plan your trip
        </Text>

        <LocationInput value={from} onChange={setFrom} placeholder="From" />
        <View style={{ height: 10 }} />
        <LocationInput value={to} onChange={setTo} placeholder="To" />

        <Pressable
          onPress={search}
          disabled={!from || !to}
          style={{
            backgroundColor: !from || !to ? '#3A4B63' : '#22c55e',
            padding: 16,
            borderRadius: 30,
            marginTop: 14,
            alignItems: 'center',
          }}
        >
          {loading ? (
            <ActivityIndicator color="#0B0F14" />
          ) : (
            <Text style={{ color: '#0B0F14', fontWeight: '800', fontSize: 16 }}>🚀 Search Ride</Text>
          )}
        </Pressable>

        <View style={{ height: 12 }} />
        {error ? (
          <Text style={{ color: '#FF7B7B', textAlign: 'center' }}>{error}</Text>
        ) : list === null && loading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : list && list.length === 0 ? (
          <Text style={{ color: '#c7d2fe', textAlign: 'center' }}>No rides found</Text>
        ) : (
          <FlatList
            data={list || []}
            keyExtractor={(i) => i._id}
            renderItem={({ item }) => (
              <View style={{ backgroundColor: '#12161C', padding: 14, borderRadius: 14, marginBottom: 10, borderWidth: 1, borderColor: '#23314a' }}>
                <Text style={{ color: 'white', fontWeight: '700' }}>
                  {item.startLocation?.name} → {item.endLocation?.name}
                </Text>
                <Text style={{ color: '#c7d2fe', marginTop: 4 }}>
                  {new Date(item.departureTime).toLocaleString()}
                </Text>
                <Text style={{ color: '#c7d2fe', marginTop: 4 }}>
                  ₹ {item.pricePerSeat} • {item.availableSeats} seat(s)
                </Text>
                {item.driver?.name ? (
                  <Text style={{ color: '#9ca3af', marginTop: 2 }}>Driver: {item.driver.name}</Text>
                ) : null}
              </View>
            )}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
