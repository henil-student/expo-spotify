import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, gStyle, device } from '../constants'; // Import device for potential adjustments
import { useToast } from '../context/ToastContext'; // Import useToast hook
import { apiService } from '../utils/api'; // Import apiService

// components
import AlbumsHorizontal from '../components/AlbumsHorizontal';
import ArtistsHorizontal from '../components/ArtistsHorizontal'; // Import ArtistsHorizontal
import ScreenHeader from '../components/ScreenHeader';

// Function to get dynamic greeting
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const Home = () => {
  const navigation = useNavigation();
  const { showToast } = useToast(); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 

  // State for API data
  const [albums, setAlbums] = useState([]); // Store fetched albums
  const [artists, setArtists] = useState([]); // Store fetched artists
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setAlbums([]); 
      setArtists([]);

      try {
        // Set dynamic greeting
        setGreeting(getGreeting());

        // Fetch albums and artists concurrently
        console.log('Fetching albums and artists from API...');
        const [fetchedAlbums, fetchedArtists] = await Promise.all([
          apiService.music.getAllAlbums(),
          apiService.music.getAllArtists()
        ]);
        console.log(`Fetched ${fetchedAlbums?.length || 0} albums and ${fetchedArtists?.length || 0} artists.`);

        // Validate fetched data
        if (!Array.isArray(fetchedAlbums)) {
          console.error("Received invalid album data:", fetchedAlbums);
          throw new Error("Received invalid album data from server.");
        }
         if (!Array.isArray(fetchedArtists)) {
          console.error("Received invalid artist data:", fetchedArtists);
          throw new Error("Received invalid artist data from server.");
        }

        setAlbums(fetchedAlbums);
        setArtists(fetchedArtists);

      } catch (err) {
        console.error('Error fetching data for Home screen:', err);
        const errorMessage = typeof err === 'string' ? err : (err.message || 'Failed to load data.');
        setError(errorMessage + ' Please try again.');
        showToast('error', 'Load Failed', errorMessage); 
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showToast]); // Dependency array

  // Navigation handlers
  const handleAlbumPress = (albumId) => {
    if (albumId) {
      navigation.navigate('Album', { albumId: albumId }); 
    } else {
      console.warn('Attempted to navigate with invalid albumId');
      showToast('error', 'Navigation Error', 'Cannot open album.');
    }
  };

  const handleArtistPress = (artistId) => {
    if (artistId) {
      navigation.navigate('Artist', { artistId: artistId }); 
    } else {
      console.warn('Attempted to navigate with invalid artistId');
      showToast('error', 'Navigation Error', 'Cannot open artist page.');
    }
  };


  // Derive sections by slicing the data arrays
  const safeAlbums = Array.isArray(albums) ? albums : [];
  const safeArtists = Array.isArray(artists) ? artists : [];

  const featuredAlbums = safeAlbums.slice(0, 5); 
  const popularArtists = safeArtists.slice(0, 5); // Use artists data
  const moreAlbums = safeAlbums.slice(5, 10); 

  if (loading) {
    return (
      <View style={[gStyle.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.white} />
      </View>
    );
  }

  // Keep error display logic
  if (error) {
    return (
      <View style={[gStyle.container, styles.errorContainer]}>
        <ScreenHeader title="Error" /> 
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={gStyle.container}>
       {/* Use dynamic greeting */}
       <ScreenHeader title={greeting} /> 
      <ScrollView 
         showsVerticalScrollIndicator={false}
         contentContainerStyle={styles.contentContainer} // Add padding for music bar
      >
        {/* Section 1: Featured Albums */}
        {featuredAlbums.length > 0 && (
          <AlbumsHorizontal
            data={featuredAlbums}
            heading="Featured Albums" 
            onPress={handleAlbumPress}
          />
        )}

        {/* Section 2: Popular Artists */}
        {popularArtists.length > 0 && (
          <ArtistsHorizontal
            data={popularArtists}
            heading="Popular Artists" 
            onPress={handleArtistPress} // Use artist press handler
          />
        )}

        {/* Section 3: More Albums */}
        {moreAlbums.length > 0 && (
          <AlbumsHorizontal
            data={moreAlbums}
            heading="More Albums" 
            onPress={handleAlbumPress}
          />
        )}

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
     paddingBottom: device.web ? 0 : 178, // Add padding for music bar
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1, 
  },
  errorContainer: {
    paddingHorizontal: 20, 
    paddingTop: 20, 
    alignItems: 'center',
    flex: 1, 
  },
  errorText: {
    color: colors.white, 
    fontSize: 16,
    textAlign: 'center',
  },
});

export default Home;
