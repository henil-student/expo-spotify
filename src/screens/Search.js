import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { colors, gStyle } from '../constants';
import { apiService } from '../utils/api';
import { useToast } from '../context/ToastContext'; // Import useToast hook

// components
import ScreenHeader from '../components/ScreenHeader';
import LineItemCategory from '../components/LineItemCategory';

const Search = () => {
  const { showToast } = useToast(); // Use the custom hook
  const [loading, setLoading] = useState(true);
  const [topGenres, setTopGenres] = useState([]); // Using artists as genres for now
  const [browseAll, setBrowseAll] = useState([]); // Using albums for browse all
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [artists, albums] = await Promise.all([
          apiService.music.getAllArtists(),
          apiService.music.getAllAlbums()
        ]);

        // Map artists to genre format (using artist name as genre title)
        setTopGenres(artists.map(artist => ({
          id: artist.id.toString(),
          title: artist.name,
          color: colors.brandPrimary // Assign a default color or generate dynamically
        })).slice(0, 4)); // Limit to 4 for top genres

        // Map albums to category format
        setBrowseAll(albums.map(album => ({
          id: album.id.toString(),
          title: album.title,
          color: colors.info, // Assign a default color or generate dynamically
          image: album.coverUrl
        })));

      } catch (err) {
        console.error('Error fetching search data:', err);
        const errorMessage = typeof err === 'string' ? err : 'Failed to load search categories.';
        setError(errorMessage);
        showToast('error', 'Load Failed', errorMessage); // Use updated signature
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showToast]); // Dependency array remains the same

  const handleCategoryPress = (item) => {
    // TODO: Navigate to a genre/category screen or album screen
    console.log('Category pressed:', item.title);
    showToast('info', 'Navigate', `Navigating to ${item.title}`);
  };

  if (loading) {
    return (
      <View style={[gStyle.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" />
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

  return (
    <View style={gStyle.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Search" />

        <TouchableOpacity
          activeOpacity={gStyle.activeOpacity}
          onPress={() => null} // TODO: Implement search input focus/navigation
          style={styles.searchPlaceholder}
        >
          <Text style={styles.searchPlaceholderText}>Artists, songs, or podcasts</Text>
        </TouchableOpacity>

        <Text style={styles.heading}>Your top genres</Text>
        <View style={styles.containerRow}>
          {topGenres.map((item) => (
            <LineItemCategory
              key={item.id}
              bgColor={item.color}
              onPress={() => handleCategoryPress(item)}
              title={item.title}
            />
          ))}
        </View>

        <Text style={styles.heading}>Browse all</Text>
        <View style={styles.containerRow}>
          {browseAll.map((item) => (
            <LineItemCategory
              key={item.id}
              bgColor={item.color}
              onPress={() => handleCategoryPress(item)}
              title={item.title}
              image={item.image} // Pass image URL if available
            />
          ))}
        </View>
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
    color: colors.white, // Use white for better visibility
    fontSize: 16,
    textAlign: 'center',
  },
  searchPlaceholder: {
    backgroundColor: colors.white,
    borderRadius: 6,
    height: 50,
    justifyContent: 'center',
    marginBottom: 16,
    marginHorizontal: 16,
    paddingLeft: 16
  },
  searchPlaceholderText: {
    ...gStyle.textSpotifyBold16,
    color: colors.blackBg
  },
  heading: {
    ...gStyle.textSpotifyBold18,
    color: colors.white,
    marginHorizontal: 16,
    marginBottom: 16
  },
  containerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: 16
  }
});

export default Search;
