import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput, // Import TextInput
  View,
  SectionList, // Import SectionList
  TouchableOpacity, // Keep for list items
  Image // Import Image for album/artist results
} from 'react-native';
import { debounce } from 'lodash'; // Import debounce
import { colors, device, fonts, gStyle } from '../constants';
import { apiService } from '../utils/api';
import { useToast } from '../context/ToastContext';
import { usePlayer } from '../context/PlayerContext'; // Import usePlayer

// components
import ScreenHeader from '../components/ScreenHeader';
import LineItemSong from '../components/LineItemSong'; // Import LineItemSong

// Default placeholder image
const placeholderImage = require('../assets/images/albums/placeholder.jpg');

const Search = ({ navigation }) => { // Add navigation prop
  const { showToast } = useToast(); // Keep showToast for error handling
  const { loadTrack } = usePlayer(); // Get loadTrack from player context

  // State for search input and results
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState({ artists: [], albums: [], songs: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // Function to fetch search results from API
  const fetchResults = async (query) => {
    if (!query || query.trim().length < 2) { // Minimum query length
      setResults({ artists: [], albums: [], songs: [] }); // Clear results if query is too short
      setIsLoading(false);
      setSearchError(null);
      return;
    }

    console.log(`Fetching results for: ${query}`);
    setIsLoading(true);
    setSearchError(null);

    try {
      const data = await apiService.music.searchAll(query);
      setResults(data || { artists: [], albums: [], songs: [] }); // Ensure results is always an object
    } catch (err) {
      console.error('Search API error:', err);
      const errorMessage = typeof err === 'string' ? err : 'Failed to perform search.';
      setSearchError(errorMessage);
      showToast('error', 'Search Failed', errorMessage);
      setResults({ artists: [], albums: [], songs: [] }); // Clear results on error
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced version of fetchResults
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedFetchResults = useCallback(debounce(fetchResults, 400), []);

  // Handle text input changes
  const handleTextChange = (text) => {
    setSearchText(text);
    debouncedFetchResults(text); // Call debounced function
  };

  // Handle song item press
  const handleSongPress = (song) => {
    // Map song data from search result to the format PlayerContext expects
    const trackForContext = {
      id: song.id,
      title: song.title,
      artist: song.artist?.name || 'Unknown Artist',
      previewUrl: song.previewUrl,
      album: song.album?.title || 'Unknown Album',
      artwork: song.album?.coverUrl || null
    };

    console.log('Playing single track from search:', trackForContext);
    // Load the single track, creating a queue of one item
    loadTrack(trackForContext, [trackForContext], 0);
  };

  // Handle album item press
  const handleAlbumPress = (album) => {
    console.log('Navigate to Album:', album.title);
    navigation.navigate('Album', { albumId: album.id });
  };

  // Handle artist item press - Updated to navigate
  const handleArtistPress = (artist) => {
    console.log('Navigate to Artist:', artist.name, artist.id);
    navigation.navigate('Artist', { artistId: artist.id }); // Navigate to Artist screen
    // showToast('info', 'Coming Soon', `Artist screen for ${artist.name} not implemented yet.`); // Remove toast
  };

  // Prepare sections for SectionList
  const sections = [];
  if (results.songs && results.songs.length > 0) {
    sections.push({ title: 'Songs', data: results.songs });
  }
  if (results.artists && results.artists.length > 0) {
    sections.push({ title: 'Artists', data: results.artists });
  }
  if (results.albums && results.albums.length > 0) {
    sections.push({ title: 'Albums', data: results.albums });
  }

  const renderSectionHeader = ({ section: { title } }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  const renderItem = ({ item, section }) => {
    switch (section.title) {
      case 'Songs':
        return (
          <LineItemSong
            active={false} // Active state not applicable in search results?
            downloaded={false}
            explicit={item.explicit} // Pass explicit flag if available
            imageUri={item.album?.coverUrl} // Use album cover from song data
            onPress={() => handleSongPress(item)}
            songData={{
              album: item.album?.title || 'Unknown Album',
              artist: item.artist?.name || 'Unknown Artist',
              length: item.duration,
              title: item.title
            }}
          />
        );
      case 'Artists':
        return (
          <TouchableOpacity onPress={() => handleArtistPress(item)} style={styles.listItem}>
             <Image
               source={item.imageUrl ? { uri: item.imageUrl } : placeholderImage} // Assuming artist might have an image URL
               style={styles.itemImage}
             />
             <View style={styles.itemTextContainer}>
                <Text style={styles.itemTitle}>{item.name}</Text>
                <Text style={styles.itemSubtitle}>Artist</Text>
             </View>
          </TouchableOpacity>
        );
      case 'Albums':
        return (
          <TouchableOpacity onPress={() => handleAlbumPress(item)} style={styles.listItem}>
             <Image
               source={item.coverUrl ? { uri: item.coverUrl } : placeholderImage}
               style={styles.itemImage}
             />
             <View style={styles.itemTextContainer}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemSubtitle}>Album • {item.artist?.name || 'Unknown Artist'}</Text>
             </View>
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  const ListEmptyComponent = () => {
     if (isLoading) return null; // Don't show empty message while loading
     if (searchError) return <Text style={styles.messageText}>{searchError}</Text>;
     if (searchText.length > 0 && sections.length === 0) {
       return <Text style={styles.messageText}>No results found for "{searchText}"</Text>;
     }
     if (searchText.length === 0) {
        return <Text style={styles.messageText}>Search for artists, songs, or albums.</Text>;
     }
     return null;
  };

  return (
    <View style={gStyle.container}>
      <ScreenHeader title="Search" />

      {/* Search Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Artists, songs, or albums"
          placeholderTextColor={colors.greyInactive}
          value={searchText}
          onChangeText={handleTextChange}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Results List */}
      {isLoading && searchText.length > 0 && ( // Show loader only when searching
         <ActivityIndicator style={styles.loadingIndicator} color={colors.white} />
      )}

      <SectionList
        sections={sections}
        keyExtractor={(item, index) => item.id.toString() + index} // Ensure unique keys
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={styles.listContentContainer}
        stickySectionHeadersEnabled={false} // Optional: prevent headers from sticking
      />

    </View>
  );
};

Search.propTypes = {
  navigation: PropTypes.object.isRequired, // Add navigation prop type
};

const styles = StyleSheet.create({
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  input: {
    backgroundColor: colors.grey, // Darker input background
    borderRadius: 6,
    height: 50,
    color: colors.white,
    paddingLeft: 16,
    fontSize: 16,
    fontFamily: fonts.spotifyRegular,
  },
  loadingIndicator: {
    marginTop: 20,
  },
  listContentContainer: {
    paddingBottom: device.web ? 0 : 178, // Add padding for music bar
  },
  sectionHeader: {
    ...gStyle.textSpotifyBold18,
    color: colors.white,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  itemImage: {
    width: 50,
    height: 50,
    marginRight: 12,
    borderRadius: 4, // Slightly rounded corners for images
  },
  itemTextContainer: {
     flex: 1, // Allow text to take remaining space
  },
  itemTitle: {
    ...gStyle.textSpotify16,
    color: colors.white,
    marginBottom: 2,
  },
  itemSubtitle: {
    ...gStyle.textSpotify12,
    color: colors.greyInactive,
  },
  messageText: {
     color: colors.greyInactive,
     textAlign: 'center',
     marginTop: 40,
     marginHorizontal: 16,
     fontSize: 16,
  }
});

export default Search;
