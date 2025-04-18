import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../constants';

// Icons
import SvgTabHome from '../icons/Svg.TabHome';
import SvgTabSearch from '../icons/Svg.TabSearch';
import SvgTabLibrary from '../icons/Svg.TabLibrary';

// Screens
import StackHome from './StackHome';
import StackSearch from './StackSearch';
import StackLibrary from './StackLibrary';

const Tab = createBottomTabNavigator();

export default () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: colors.white,
      tabBarInactiveTintColor: colors.greyInactive,
      tabBarStyle: {
        backgroundColor: colors.grey,
        borderTopWidth: 0
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
);
