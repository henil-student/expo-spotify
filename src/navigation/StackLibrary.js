import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import Library from '../screens/Library';

const Stack = createNativeStackNavigator();

export default () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false
    }}
  >
    <Stack.Screen name="Library" component={Library} />
  </Stack.Navigator>
);
