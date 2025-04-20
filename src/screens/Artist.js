import React, { useState, useEffect, useCallback } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  FlatList
} from 'react-native';
import PropTypes from 'prop-types';
// Import default export 'func' instead of named export
import { colors, device, fonts, gStyle, func } from '../constants';
import { apiService } from '../utils/api';
import { useToast } from '../context/ToastContext';
import { usePlayer } from '../context/PlayerContext';
// Remove named import for formatNumber if func is imported from index
// import { formatNumber } from '../constants/functions'; 

// components
import ScreenHeader from '../components/ScreenHeader';
import LineItemSong from '../components/LineItemSong';
import AlbumsHorizontal from '../components/AlbumsHorizontal'; // Assuming this exists and works

// Default placeholder image
const placeholderArtistImage = require('../assets/images/user.png'); // Or a specific artist placeholder

const Artist = ({ route, navigation }) => {
  const { artistId } = route.params;
  const { showToast } = useToast();
  const { loadTrack } = usePlayer();

  const [artistDetails, setArtistDetails] = useState(null);
  const [topSongs, setTopSongs] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!artistId) {
        setError('Artist ID is missing.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log(`Fetching data for Artist ID: ${artistId}`);
        const [details, songs, artistAlbums] = await Promise.all([
          apiService.music.getArtistById(artistId),
          apiService.music.getArtistTopSongs(artistId, 5), // Fetch top 5 songs
          apiService.music.getArtistAlbums(artistId)
        ]);

        console.log('Artist Details:', details);
        console.log('Top Songs:', songs);
        console.log('Albums:', artistAlbums);

        setArtistDetails(details);
        setTopSongs(songs || []);
        setAlbums(artistAlbums || []);

      } catch (err) {
        console.error(`Error fetching data for artist ${artistId}:`, err);
        const errorMessage = typeof err === 'string' ? err : 'Failed to load artist data.';
        setError(errorMessage);
        showToast('error', 'Load Failed', errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [artistId, showToast]);

  // Handler for pressing a song in the popular list
  const handleSongPress = useCallback((selectedSong, index) => {
    if (!topSongs || topSongs.length === 0) return;

    // Map topSongs to the queue format expected by PlayerContext
    const queue = topSongs.map(song => ({
      id: song.id,
      title: song.title,
      artist: artistDetails?.name || 'Unknown Artist', // Use fetched artist name
      previewUrl: song.previewUrl,
      artwork: song.album?.coverUrl || artistDetails?.imageUrl || null, // Prefer album art, fallback to artist
      album: song.album?.title || ''
    }));

    console.log('Loading track from Artist screen:', selectedSong.title, 'at index', index);
    loadTrack(queue[index], queue, index);

  }, [topSongs, artistDetails, loadTrack]);

  // Handler for pressing an album in the horizontal list
  const handleAlbumPress = useCallback((albumId) => {
    console.log('Navigate to Album ID:', albumId);
    navigation.navigate('Album', { albumId });
  }, [navigation]);

  if (isLoading) {
    return (
      <View style={[gStyle.container, styles.loadingContainer]}>
        <ActivityIndicator color={colors.white} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[gStyle.container, styles.errorContainer]}>
         <ScreenHeader navigation={navigation} showBack title="Error" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!artistDetails) {
     return (
       <View style={[gStyle.container, styles.errorContainer]}>
         <ScreenHeader navigation={navigation} showBack title="Not Found" />
         <Text style={styles.errorText}>Artist data could not be loaded.</Text>
       </View>
     );
  }

  return (
    <View style={gStyle.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader navigation={navigation} showBack title={artistDetails.name} />

        {/* Artist Header */}
        <View style={styles.header}>
          <Image
            source={artistDetails.imageUrl ? { uri: artistDetails.imageUrl } : placeholderArtistImage}
            style={styles.artistImage}
          />
          <Text style={styles.artistName}>{artistDetails.name}</Text>
          {artistDetails.monthlyListeners && (
             <Text style={styles.listenersText}>
               {/* Use func.formatNumber */}
               {func.formatNumber(artistDetails.monthlyListeners)} monthly listeners
             </Text>
          )}
           {/* Add Follow button? */}
        </View>

        {/* Popular Songs */}
        {topSongs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular</Text>
            <FlatList
              data={topSongs}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item, index }) => (
                <LineItemSong
                  active={false} // TODO: Determine active state based on player context?
                  downloaded={false} // TODO: Add download state later
                  explicit={item.explicit}
                  imageUri={item.album?.coverUrl} // Use album cover if available
                  onPress={() => handleSongPress(item, index)}
                  songData={{
                    album: item.album?.title || '',
                    artist: artistDetails.name, // Already have artist name
                    // Use func.formatTime if needed here, e.g. for length display
                    length: item.duration, // Assuming duration is already formatted or LineItemSong handles it
                    title: item.title,
                    trackNumber: index + 1 // Display track number in list
                  }}
                  showTrackNumber // Prop to display track number
                />
              )}
              // Disable FlatList scrolling within ScrollView
              scrollEnabled={false}
            />
             {/* Add "See more" button? */}
          </View>
        )}

        {/* Albums */}
        {albums.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Albums</Text>
            {/* Pass the handleAlbumPress function to AlbumsHorizontal */}
            <AlbumsHorizontal
              data={albums}
              navigation={navigation}
              onPress={handleAlbumPress} // Pass the handler function
            />
          </View>
        )}

         {/* Add Singles, Appears On sections later? */}

      </ScrollView>
    </View>
  );
};

Artist.propTypes = {
  route: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: device.web ? 0 : 178, // Space for music bar
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    // Style for error message display
  },
  errorText: {
    color: colors.white,
    textAlign: 'center',
    marginTop: 20,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20, // Adjust as needed
    paddingBottom: 20,
  },
  artistImage: {
    width: 150,
    height: 150,
    borderRadius: 75, // Make it circular
    marginBottom: 16,
  },
  artistName: {
    ...gStyle.textSpotifyBold30,
    color: colors.white,
    marginBottom: 4,
    textAlign: 'center',
  },
  listenersText: {
    ...gStyle.textSpotify12,
    color: colors.greyInactive,
    textTransform: 'uppercase',
  },
  section: {
    marginTop: 24,
    // No horizontal padding here, handled by child components if needed
  },
  sectionTitle: {
    ...gStyle.textSpotifyBold18,
    color: colors.white,
    marginBottom: 16,
    paddingHorizontal: 16, // Add padding for section titles
  },
});

export default Artist;
