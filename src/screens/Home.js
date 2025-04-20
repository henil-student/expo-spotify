import React, { useState, useEffect, useCallback } from 'react'; // Add useCallback
import { ScrollView, StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, gStyle, device } from '../constants'; // Import device for potential adjustments
import { useToast } from '../context/ToastContext'; // Import useToast hook
import { apiService } from '../utils/api'; // Import apiService
import { usePlayer } from '../context/PlayerContext'; // Import usePlayer

// components
import AlbumsHorizontal from '../components/AlbumsHorizontal';
import ArtistsHorizontal from '../components/ArtistsHorizontal'; 
import SongsHorizontal from '../components/SongsHorizontal'; // Import SongsHorizontal
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
  const { loadTrack } = usePlayer(); // Get loadTrack from player context
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 

  // State for API data
  const [albums, setAlbums] = useState([]); 
  const [artists, setArtists] = useState([]); 
  const [popularSongs, setPopularSongs] = useState([]); // Add state for popular songs
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setAlbums([]); 
      setArtists([]);
      setPopularSongs([]); // Reset popular songs state

      try {
        // Set dynamic greeting
        setGreeting(getGreeting());

        // Fetch albums, artists, and popular songs concurrently
        console.log('Fetching albums, artists, and popular songs from API...');
        const [fetchedAlbums, fetchedArtists, fetchedPopularSongs] = await Promise.all([
          apiService.music.getAllAlbums(),
          apiService.music.getAllArtists(),
          apiService.music.getPopularSongs() // Fetch popular songs
        ]);
        console.log(`Fetched ${fetchedAlbums?.length || 0} albums, ${fetchedArtists?.length || 0} artists, and ${fetchedPopularSongs?.length || 0} popular songs.`);

        // Validate fetched data
        if (!Array.isArray(fetchedAlbums)) {
          console.error("Received invalid album data:", fetchedAlbums);
          throw new Error("Received invalid album data from server.");
        }
         if (!Array.isArray(fetchedArtists)) {
          console.error("Received invalid artist data:", fetchedArtists);
          throw new Error("Received invalid artist data from server.");
        }
        if (!Array.isArray(fetchedPopularSongs)) {
          console.error("Received invalid popular songs data:", fetchedPopularSongs);
          throw new Error("Received invalid popular songs data from server.");
        }

        setAlbums(fetchedAlbums);
        setArtists(fetchedArtists);
        setPopularSongs(fetchedPopularSongs); // Set popular songs state

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
  const handleAlbumPress = useCallback((albumId) => {
    if (albumId) {
      navigation.navigate('Album', { albumId: albumId }); 
    } else {
      console.warn('Attempted to navigate with invalid albumId');
      showToast('error', 'Navigation Error', 'Cannot open album.');
    }
  }, [navigation, showToast]);

  const handleArtistPress = useCallback((artistId) => {
    if (artistId) {
      navigation.navigate('Artist', { artistId: artistId }); 
    } else {
      console.warn('Attempted to navigate with invalid artistId');
      showToast('error', 'Navigation Error', 'Cannot open artist page.');
    }
  }, [navigation, showToast]);

  // Player handler for popular songs
  const handleSongPress = useCallback((song) => {
     // Map song data to the format PlayerContext expects
    const trackForContext = {
      id: song.id,
      title: song.title,
      artist: song.artist?.name || 'Unknown Artist',
      previewUrl: song.previewUrl, // Make sure previewUrl is fetched
      album: song.album?.title || 'Unknown Album',
      artwork: song.album?.coverUrl || null
    };

    console.log('Playing single track from Home (Popular):', trackForContext);
    // Load the single track, creating a queue of one item
    loadTrack(trackForContext, [trackForContext], 0);
  }, [loadTrack]);


  // Derive sections by slicing the data arrays
  const safeAlbums = Array.isArray(albums) ? albums : [];
  const safeArtists = Array.isArray(artists) ? artists : [];
  const safePopularSongs = Array.isArray(popularSongs) ? popularSongs : [];

  const featuredAlbums = safeAlbums.slice(0, 5); 
  const popularArtists = safeArtists.slice(0, 5); 
  const trendingSongs = safePopularSongs.slice(0, 10); // Take top 10 popular songs
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
            onPress={handleArtistPress} 
          />
        )}

         {/* Section 3: Trending Songs */}
        {trendingSongs.length > 0 && (
          <SongsHorizontal
            data={trendingSongs}
            heading="Trending Songs" 
            onPress={handleSongPress} // Use song press handler
          />
        )}

        {/* Section 4: More Albums */}
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
