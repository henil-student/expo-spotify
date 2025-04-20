import React from 'react';
import PropTypes from 'prop-types';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fonts, gStyle } from '../constants';

// Default placeholder image
const placeholderImage = require('../assets/images/albums/placeholder.jpg');

const SongsHorizontal = ({ data, heading, onPress }) => {
  // Filter out items without a valid ID
  const validData = data.filter(item => item && item.id);

  // Helper to determine image source - assumes song object has album.coverUrl
  const getImageSource = (album) => {
    const coverUrl = album?.coverUrl;
    if (typeof coverUrl === 'string' && coverUrl.startsWith('http')) {
      return { uri: coverUrl };
    } else if (coverUrl) {
      // Allow for potential require() results if needed later
      return coverUrl;
    }
    // Fallback to placeholder
    return placeholderImage;
  };

  return (
    <View style={styles.container}>
      {heading && <Text style={styles.heading}>{heading}</Text>}

      <FlatList
        contentContainerStyle={styles.containerContent}
        data={validData}
        horizontal
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={gStyle.activeOpacity}
            hitSlop={{ top: 10, left: 10, bottom: 10, right: 10 }}
            onPress={() => onPress(item)} // Pass the full song item to onPress
            style={styles.item}
          >
            <Image
              // Use the helper function - assumes item has album relation
              source={getImageSource(item.album)} 
              style={styles.image} // Use square image style
            />
            {/* Display song title */}
            <Text style={styles.title} numberOfLines={2}>{item.title}</Text> 
            {/* Display artist name - assumes item has artist relation */}
            <Text style={styles.artist} numberOfLines={1}>{item.artist?.name || 'Unknown Artist'}</Text> 
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

SongsHorizontal.defaultProps = {
  heading: null
};

SongsHorizontal.propTypes = {
  // required
  data: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string, 
      // Expect album object with coverUrl
      album: PropTypes.shape({
          coverUrl: PropTypes.oneOfType([PropTypes.string, PropTypes.number]) 
      }),
      // Expect artist object with name
      artist: PropTypes.shape({
          name: PropTypes.string
      }),
      // Need previewUrl for playing
      previewUrl: PropTypes.string 
  })).isRequired,
  onPress: PropTypes.func.isRequired, // Function to handle press, receives song item

  // optional
  heading: PropTypes.string
};

// Styles adapted for songs
const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    width: '100%'
  },
  containerContent: {
    paddingLeft: 16
  },
  heading: {
    ...gStyle.textSpotifyBold18,
    color: colors.white,
    paddingBottom: 6,
    marginLeft: 16,
    marginBottom: 6,
  },
  item: {
    marginRight: 16,
    width: 148 // Keep same width as albums/artists for consistency
  },
  image: {
    backgroundColor: colors.greyLight,
    height: 148, // Square image
    width: 148,
    marginBottom: 8,
  },
  title: {
    ...gStyle.textSpotifyBold12, // Use bold for title
    color: colors.white,
    textAlign: 'left', // Align text left
    marginBottom: 2,
  },
   artist: {
    ...gStyle.textSpotify12, // Regular weight for artist
    color: colors.greyInactive,
    textAlign: 'left',
  }
});

export default SongsHorizontal;
