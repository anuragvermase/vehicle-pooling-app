import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, ScrollView } from 'react-native';
import { colors } from '../theme/colors';
import { RideAPI } from '../services/api';

export default function CreateRide() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [seats, setSeats] = useState('1');
  const [price, setPrice] = useState('100');
  const [vehicle, setVehicle] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!origin || !destination) {
      Alert.alert('Missing info', 'Please enter both origin and destination');
      return;
    }
    try {
      setLoading(true);
      await RideAPI.create({ origin, destination, departureTime: date, seats, price, vehicle });
      Alert.alert('Success', 'Ride published');
      setOrigin(''); setDestination(''); setDate(''); setSeats('1'); setPrice('100'); setVehicle('');
    } catch (e:any) {
      Alert.alert('Error', e?.response?.data?.message || e?.message);
    } finally { setLoading(false); }
  }

  const inputStyle = { backgroundColor:'#1f2937', color:'white', padding:12, borderRadius:10, marginBottom:12 };

  return (
    <ScrollView style={{ flex:1, backgroundColor: colors.bg, padding:20 }}>
      <Text style={{ color: 'white', fontSize: 22, fontWeight:'800', marginBottom:20 }}>🧳 Offer a Ride</Text>
      
      <TextInput placeholder="Starting Point" placeholderTextColor="#9ca3af" value={origin} onChangeText={setOrigin} style={inputStyle}/>
      <TextInput placeholder="Destination" placeholderTextColor="#9ca3af" value={destination} onChangeText={setDestination} style={inputStyle}/>
      <TextInput placeholder="Date/Time (ISO format)" placeholderTextColor="#9ca3af" value={date} onChangeText={setDate} style={inputStyle}/>
      <TextInput placeholder="Seats" placeholderTextColor="#9ca3af" value={seats} onChangeText={setSeats} keyboardType="numeric" style={inputStyle}/>
      <TextInput placeholder="Price" placeholderTextColor="#9ca3af" value={price} onChangeText={setPrice} keyboardType="numeric" style={inputStyle}/>
      <TextInput placeholder="Vehicle Details" placeholderTextColor="#9ca3af" value={vehicle} onChangeText={setVehicle} style={inputStyle}/>

      <Pressable onPress={submit} disabled={loading} style={{ backgroundColor:'#22c55e', padding:14, borderRadius:30 }}>
        <Text style={{ color:'white', textAlign:'center', fontWeight:'700', fontSize:16 }}>
          {loading ? 'Publishing…' : '🚀 Publish Ride'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
