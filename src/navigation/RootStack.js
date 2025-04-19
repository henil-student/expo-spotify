import React from 'react';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// components
import ErrorBoundary from '../components/ErrorBoundary';
import LoadingScreen from '../screens/LoadingScreen';

// context
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { PlayerProvider } from '../context/PlayerContext'; // Import PlayerProvider

// navigation
import TabNavigation from './TabNavigation';

// screens
import ModalMusicPlayer from '../screens/ModalMusicPlayer';
import ModalMoreOptions from '../screens/ModalMoreOptions';
import Login from '../screens/Login';
import Signup from '../screens/Signup';

const Stack = createNativeStackNavigator();

function RootStack() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen 
            name="Login" 
            component={Login}
            options={{
              animationEnabled: true,
              animation: 'slide_from_right'
            }}
          />
          <Stack.Screen 
            name="Signup" 
            component={Signup}
            options={{
              animationEnabled: true,
              animation: 'slide_from_right'
            }}
          />
        </>
      ) : (
        <>
          <Stack.Screen name="MainTab" component={TabNavigation} />
          <Stack.Screen
            name="ModalMusicPlayer"
            component={ModalMusicPlayer}
            options={{
              presentation: 'fullScreenModal'
            }}
          />
          <Stack.Screen
            name="ModalMoreOptions"
            component={ModalMoreOptions}
            options={{
              animation: 'slide_from_bottom',
              presentation: 'transparentModal'
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

const AppNavigator = () => {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <PlayerProvider>
            <NavigationContainer
              theme={DarkTheme}
              onStateChange={(state) => {
                if (__DEV__) {
                  console.debug('Navigation state changed:', state);
                }
              }}
            >
              <RootStack />
            </NavigationContainer>
          </PlayerProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default AppNavigator;
