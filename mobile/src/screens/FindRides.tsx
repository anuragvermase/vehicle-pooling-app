import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, FlatList } from 'react-native';
import { colors } from '../theme/colors';
import { RideAPI } from '../services/api';

function RideCard({ ride }: { ride:any }) {
  return (
    <View style={{ backgroundColor:'white', borderRadius:12, padding:14, marginBottom:10, shadowColor:'#000', shadowOpacity:0.1, shadowRadius:4 }}>
      <Text style={{ fontWeight:'700', fontSize:16 }}>{ride.driverName ?? 'Driver'}</Text>
      <Text style={{ color:'#6b7280' }}>{ride.origin} → {ride.destination}</Text>
      <Text style={{ color:'#22c55e', marginTop:4 }}>₹{ride.price ?? '—'}</Text>
    </View>
  );
}

export default function FindRides() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [rides, setRides] = useState<any[]>([]);


async function search() {
  try {
    setLoading(true);
    let data;

    // Try GET first
    try {
      const res = await RideAPI.list({ origin, destination, date });
      data = res.data;
    } catch (e: any) {
      const code = e?.response?.status;
      // If route not found / method not allowed, fallback to POST /rides/search
      if (code === 404 || code === 405 || code === 501) {
        const res = await RideAPI.search({ origin, destination, date });
        data = res.data;
      } else {
        throw e;
      }
    }

    setRides(Array.isArray(data) ? data : data?.rides || []);
  } catch (e: any) {
    console.log('SEARCH ERR =>', e?.response?.status, e?.response?.data, e?.message);
    Alert.alert('Search failed', e?.response?.data?.message || e?.message || 'Try again');
  } finally {
    setLoading(false);
  }
}

  const inputStyle = { backgroundColor:'#1f2937', color:'white', padding:12, borderRadius:10, marginBottom:10 };

  return (
    <View style={{ flex:1, backgroundColor:'#6366f1', padding:20 }}>
      <Text style={{ color:'white', fontSize:22, fontWeight:'800', marginBottom:16 }}>🔎 Find Your Perfect Ride</Text>

      <TextInput placeholder="From" placeholderTextColor="#d1d5db" value={origin} onChangeText={setOrigin} style={inputStyle}/>
      <TextInput placeholder="To" placeholderTextColor="#d1d5db" value={destination} onChangeText={setDestination} style={inputStyle}/>

      <Pressable onPress={search} style={{ backgroundColor:'#22c55e', padding:14, borderRadius:30, marginBottom:20 }}>
        <Text style={{ color:'white', textAlign:'center', fontWeight:'700' }}>🚀 Search Ride</Text>
      </Pressable>

      <FlatList
        data={rides}
        keyExtractor={(item:any,i)=> item._id ?? String(i)}
        renderItem={({ item }) => <RideCard ride={item} />}
        ListEmptyComponent={<Text style={{ color:'#d1d5db', textAlign:'center' }}>No rides found</Text>}
      />
    </View>
  );
}
function setLoading(arg0: boolean) {
    throw new Error('Function not implemented.');
}

