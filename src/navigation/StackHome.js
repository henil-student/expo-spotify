import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// screens
import HomeScreen from '../screens/Home';
import AlbumScreen from '../screens/Album';
import ArtistScreen from '../screens/Artist'; // Import Artist screen (will create next)

const Stack = createNativeStackNavigator();

function StackHome() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="Album"
        component={AlbumScreen}
        options={{
          headerShown: false
        }}
        // Removed initialParams as they should be passed during navigation
        // initialParams={{ title: 'Extraordinary Machine' }}
      />
      <Stack.Screen // Add Artist screen to the stack
        name="Artist"
        component={ArtistScreen}
        options={{
          headerShown: false
        }}
      />
    </Stack.Navigator>
  );
}

export default StackHome;
