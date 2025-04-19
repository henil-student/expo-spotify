import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, gStyle } from '../constants'; // Import colors
import { apiService } from '../utils/api';
import { useToast } from '../context/ToastContext'; // Import useToast hook

// components
import AlbumsHorizontal from '../components/AlbumsHorizontal';
import ScreenHeader from '../components/ScreenHeader';

const Home = () => {
  const navigation = useNavigation();
  const { showToast } = useToast(); // Use the custom hook
  const [loading, setLoading] = useState(true);
  const [albums, setAlbums] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Add a small delay for testing loading indicator
        // await new Promise(resolve => setTimeout(resolve, 1500)); 
        const fetchedAlbums = await apiService.music.getAllAlbums();
        if (!Array.isArray(fetchedAlbums)) {
          throw new Error("Received invalid album data from server.");
        }
        setAlbums(fetchedAlbums);
      } catch (err) {
        console.error('Error fetching albums:', err);
        const errorMessage = typeof err === 'string' ? err : (err.message || 'Failed to load albums.');
        setError(errorMessage + ' Please try again.');
        showToast('error', 'Load Failed', errorMessage); // Use updated signature
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showToast]); // Dependency array remains the same

  const handleAlbumPress = (albumId) => {
    if (albumId) {
      // FIX: Pass parameter as { albumId: albumId }
      navigation.navigate('Album', { albumId: albumId }); 
    } else {
      console.warn('Attempted to navigate with invalid albumId');
      showToast('error', 'Navigation Error', 'Cannot open album.');
    }
  };

  if (loading) {
    return (
      <View style={[gStyle.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.white} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[gStyle.container, styles.errorContainer]}>
        <Text style={styles.errorText}>{error}</Text>
        {/* Optionally add a retry button here */}
      </View>
    );
  }

  // Simple grouping for demonstration - replace with better logic if needed
  // Ensure albums is an array before slicing
  const safeAlbums = Array.isArray(albums) ? albums : [];
  const recentlyPlayed = safeAlbums.slice(0, 5);
  const heavyRotation = safeAlbums.slice(5, 10);
  const jumpBackIn = safeAlbums.slice(10, 15);

  return (
    <View style={gStyle.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Good evening" />

        {recentlyPlayed.length > 0 && (
          <AlbumsHorizontal
            data={recentlyPlayed}
            heading="Recently played"
            onPress={handleAlbumPress}
          />
        )}

        {heavyRotation.length > 0 && (
          <AlbumsHorizontal
            data={heavyRotation}
            heading="Your heavy rotation"
            onPress={handleAlbumPress}
          />
        )}

        {jumpBackIn.length > 0 && (
          <AlbumsHorizontal
            data={jumpBackIn}
            heading="Jump back in"
            onPress={handleAlbumPress}
          />
        )}

        <View style={gStyle.spacer24} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1, // Ensure it takes full height
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    flex: 1, // Ensure it takes full height
  },
  errorText: {
    color: colors.white, // Use white for better visibility on dark theme
    fontSize: 16,
    textAlign: 'center',
  },
});

export default Home;
