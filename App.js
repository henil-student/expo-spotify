import * as React from 'react';
import { StatusBar } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
// Import the default export from functions.js
import func from './src/constants/functions';

// root stack navigation
import RootStack from './src/navigation/RootStack';

// app context state
import AppState from './src/context/AppState';

function App() {
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function prepare() {
      try {
        // keeps the splash screen visible while assets are cached
        await SplashScreen.preventAutoHideAsync();

        // pre-load/cache assets: images, fonts, and videos
        // Use the default import object 'func'
        await func.loadAssetsAsync();
        console.log('Assets loaded successfully.'); // Add success log
      } catch (e) {
        // Log any errors during asset loading
        console.error('Error loading assets:', e);
      } finally {
        // loading is complete
        console.log('Setting isLoading to false.'); // Add log
        setIsLoading(false);
      }
    }

    prepare();
  }, []);

  React.useEffect(() => {
    // when loading is complete
    if (isLoading === false) {
      // hide splash function
      const hideSplash = async () => {
        await SplashScreen.hideAsync();
        console.log('Splash screen hidden.'); // Add log
      };

      // hide splash screen to show app
      hideSplash();
    }
  }, [isLoading]);

  if (isLoading) {
    console.log('Rendering null while loading...'); // Add log
    return null; // Keep returning null while loading
  }

  console.log('Rendering AppNavigator...'); // Add log
  return (
    <AppState>
      <StatusBar barStyle="light-content" />

      <RootStack />
    </AppState>
  );
}

export default App;
