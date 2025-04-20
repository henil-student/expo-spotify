import React from 'react';
import PropTypes from 'prop-types';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fonts, gStyle } from '../constants';

// Default placeholder image for artists
const placeholderArtistImage = require('../assets/images/user.png'); // Use user placeholder

const ArtistsHorizontal = ({ data, heading, onPress }) => {
  // Filter out items without a valid ID
  const validData = data.filter(item => item && item.id);

  // Helper to determine image source for artists
  const getImageSource = (imageUrl) => {
    if (typeof imageUrl === 'string' && imageUrl.startsWith('http')) {
      // If it's a string starting with http, assume it's a URI
      return { uri: imageUrl };
    } else if (imageUrl) {
      // Allow for potential require() results if needed later, though API likely provides URI
      return imageUrl;
    }
    // Fallback to placeholder
    return placeholderArtistImage;
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
            onPress={() => onPress(item.id)} // Pass artist ID to onPress
            style={styles.item}
          >
            <Image
              // Use the helper function to determine the source format
              source={getImageSource(item.imageUrl)} // Use imageUrl prop
              style={[styles.image, styles.artistImage]} // Add specific style for circular artist image
            />
            {/* Display artist name */}
            <Text style={styles.title}>{item.name}</Text> 
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

ArtistsHorizontal.defaultProps = {
  heading: null
};

ArtistsHorizontal.propTypes = {
  // required
  data: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string, // Expect artist name
      // Allow imageUrl to be a string (URI) or number (require result)
      imageUrl: PropTypes.oneOfType([PropTypes.string, PropTypes.number]) 
  })).isRequired,
  onPress: PropTypes.func.isRequired, // Function to handle press, receives artistId

  // optional
  heading: PropTypes.string
};

// Base styles on AlbumsHorizontal, with adjustments for artists
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
    width: 148,
    alignItems: 'center' // Center artist image and text
  },
  image: {
    backgroundColor: colors.greyLight,
    height: 148,
    width: 148,
    marginBottom: 8,
  },
  artistImage: {
     borderRadius: 74 // Make image circular
  },
  title: {
    ...gStyle.textSpotifyBold12,
    color: colors.white,
    textAlign: 'center'
  }
});

export default ArtistsHorizontal;
