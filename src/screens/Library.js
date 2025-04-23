import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native'; // Import Button
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import { useAuth } from '../context/AuthContext';
import { colors, gStyle } from '../constants';
import { LOADING_STATES, getLoadingMessage } from '../constants/loading'; // Import getLoadingMessage
import AuthButton from '../components/AuthButton';
import ScreenHeader from '../components/ScreenHeader'; // Import ScreenHeader

const Library = () => {
  // Get user and logout function from context
  const { user, logout, loadingState } = useAuth(); 
  const navigation = useNavigation(); // Get navigation object

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      // AuthContext already shows toast on error, just log here
      console.error('Logout error in Library screen:', error); 
    }
  };

  const handleMoodDetect = () => {
    navigation.navigate('MoodDetector'); // Navigate to the modal screen
  };

  return (
    // Use gStyle.container for consistent background and padding
    <View style={gStyle.container}> 
      {/* Use ScreenHeader */}
      <ScreenHeader title="Your Library" /> 

      <View style={styles.contentContainer}>
        {/* Display Welcome message */}
        <Text style={[gStyle.textSpotifyBold18, styles.welcomeText]}>
          Welcome, {user?.name || 'User'}!
        </Text>

        {/* Placeholder for future library content */}
        <Text style={styles.placeholderText}>
          Your saved songs, albums, and playlists will appear here.
        </Text>

        {/* Mood Detector Button */}
        <View style={styles.moodButtonContainer}>
          <Button 
            title="Play Music By Mood" 
            onPress={handleMoodDetect}
            color={colors.brandPrimary} // Use brand color
          />
        </View>

        {/* Logout Button */}
        <View style={styles.logoutButtonContainer}>
          <AuthButton
            onPress={handleLogout}
            // Disable button during any auth operation
            disabled={loadingState !== LOADING_STATES.NONE} 
            // Use getLoadingMessage for consistent text
            title={getLoadingMessage(loadingState, 'Logout')} 
            variant="secondary" // Keep secondary style if desired
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Removed container style, using gStyle.container now
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20, // Add padding below header
    alignItems: 'center', // Center content horizontally
  },
  welcomeText: {
    color: colors.white,
    marginBottom: 20,
    textAlign: 'center',
  },
  placeholderText: {
    color: colors.greyInactive,
    textAlign: 'center',
    marginBottom: 30, // Adjust spacing
  },
  moodButtonContainer: {
    width: '80%',
    marginBottom: 40, // Add space below mood button
  },
  logoutButtonContainer: {
     width: '80%', // Limit button width
     marginTop: 'auto', // Push button towards the bottom
     marginBottom: 40, // Add some margin at the bottom
  }
  // Removed title style, using ScreenHeader now
});

export default Library;
