import React from 'react';
import { View, StyleSheet } from 'react-native'; // Import View and StyleSheet
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import { colors } from '../constants';

// Components
import BarMusicPlayer from '../components/BarMusicPlayer'; // Import BarMusicPlayer

// Icons
import SvgTabHome from '../icons/Svg.TabHome';
import SvgTabSearch from '../icons/Svg.TabSearch';
import SvgTabLibrary from '../icons/Svg.TabLibrary';

// Screens
import StackHome from './StackHome';
import StackSearch from './StackSearch';
import StackLibrary from './StackLibrary';

const Tab = createBottomTabNavigator();

// Convert to a full component to use hooks and render the player bar
const TabNavigation = () => {
  const navigation = useNavigation(); // Get navigation object

  return (
    // Use a View to contain both the tabs and the music player bar
    <View style={styles.container}> 
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.white,
          tabBarInactiveTintColor: colors.greyInactive,
          tabBarStyle: {
            backgroundColor: colors.grey,
            borderTopWidth: 0,
            // Note: Height might need adjustment if player bar overlaps
          },
          tabBarIcon: ({ focused }) => {
            let Icon = SvgTabHome;

            if (route.name === 'StackHome') {
              Icon = SvgTabHome;
            } else if (route.name === 'StackSearch') {
              Icon = SvgTabSearch;
            } else if (route.name === 'StackLibrary') {
              Icon = SvgTabLibrary;
            }

            return <Icon active={focused} />;
          }
        })}
      >
        <Tab.Screen
          name="StackHome"
          component={StackHome}
          options={{
            tabBarLabel: 'Home'
          }}
        />
        <Tab.Screen
          name="StackSearch"
          component={StackSearch}
          options={{
            tabBarLabel: 'Search'
          }}
        />
        <Tab.Screen
          name="StackLibrary"
          component={StackLibrary}
          options={{
            tabBarLabel: 'Library'
          }}
        />
      </Tab.Navigator>

      {/* Render BarMusicPlayer here, above the tab bar */}
      <BarMusicPlayer navigation={navigation} /> 
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Make the container take full height
    backgroundColor: colors.black, // Ensure background consistency
  },
});

export default TabNavigation; // Export the component
