import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { Storage } from '../services/storage';
import { AuthAPI } from '../services/api';

import Landing from '../screens/Landing';
import Login from '../screens/Login';
import Register from '../screens/Register';
import Dashboard from '../screens/Dashboard';
import FindRides from '../screens/FindRides';
import CreateRide from '../screens/CreateRide';
import MyRides from '../screens/MyRides';

type RootParams = {
  Login: undefined;
  Register: undefined;
  Landing: undefined;
  Dashboard: undefined;
  FindRides: undefined;
  CreateRide: undefined;
  MyRides: undefined;
};

const Stack = createNativeStackNavigator<RootParams>();

export default function RootNavigator() {
  const [checking, setChecking] = useState(true);
  const [initialRoute, setInitialRoute] = useState<keyof RootParams>('Login');

  useEffect(() => {
    (async () => {
      try {
        const token = await Storage.get('accessToken');
        if (!token) { setInitialRoute('Login'); return; }
        // Verify token; if /auth/me fails, send to Login
        await AuthAPI.me();
        setInitialRoute('Landing');   // or 'Dashboard' if you prefer
      } catch {
        await Storage.del('accessToken');
        setInitialRoute('Login');
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  if (checking) {
    return (
      <View style={{ flex:1, backgroundColor:'#0b0f19', justifyContent:'center', alignItems:'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="Landing" component={Landing} options={{ headerShown: false }} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="FindRides" component={FindRides} />
        <Stack.Screen name="CreateRide" component={CreateRide} />
        <Stack.Screen name="MyRides" component={MyRides} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
