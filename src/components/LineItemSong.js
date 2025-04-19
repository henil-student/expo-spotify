import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native'; // Added Image back for album art
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Import Icon
import { colors, fonts, gStyle, func } from '../constants'; // Added func back

// Default placeholder image
const placeholderImage = require('../assets/images/albums/placeholder.jpg');

const LineItemSong = ({
  active,
  downloaded, 
  explicit, 
  imageUri, 
  onPress,
  songData: { album, artist, length, title } 
}) => {

  const imageSource = imageUri ? { uri: imageUri } : placeholderImage;
  const songColor = active ? colors.brandPrimary : colors.white;

  // Reintroduce icons using conditional rendering
  const explicitIcon = explicit ? (
    <Icon name="alpha-e-box" size={16} color={colors.greyInactive} style={styles.iconExplicit} />
  ) : null;
  const downloadIcon = downloaded ? (
     <Icon name="arrow-down-circle" size={16} color={colors.brandPrimary} style={styles.iconDownloaded} />
  ) : null;

  return (
    <TouchableOpacity
      activeOpacity={gStyle.activeOpacity}
      onPress={onPress}
      style={styles.container} 
    >
      <Image source={imageSource} style={styles.image} />

      {/* Title/Artist Container */}
      <View style={styles.containerSong}> 
        <Text style={[styles.title, { color: songColor }]}>{title}</Text> 
        <View style={gStyle.flexRowCenterAlign}> 
          {/* Render icons directly adjacent to each other and the Text */}
          {explicitIcon}{downloadIcon}<Text style={styles.artist}>{artist}</Text> 
        </View>
      </View>

      {/* More Options Button */}
      <TouchableOpacity
        hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        onPress={() => { console.log(`More options for ${title}`); }}
        style={styles.containerMore}
      >
        <Icon name="dots-horizontal" size={24} color={colors.greyInactive} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

// PropTypes and DefaultProps remain the same

LineItemSong.propTypes = {
  active: PropTypes.bool,
  downloaded: PropTypes.bool,
  explicit: PropTypes.bool,
  imageUri: PropTypes.string, // Album cover URI
  onPress: PropTypes.func.isRequired,
  songData: PropTypes.shape({
    album: PropTypes.string,
    artist: PropTypes.string.isRequired,
    length: PropTypes.number, // Duration in seconds
    title: PropTypes.string.isRequired
  }).isRequired
};

LineItemSong.defaultProps = {
  active: false,
  downloaded: false,
  explicit: false,
  imageUri: null,
};

const styles = StyleSheet.create({
  container: { 
    flexDirection: 'row',
    alignItems: 'center', 
    padding: 16,
    width: '100%',
  },
  image: {
    width: 50,
    height: 50,
    marginRight: 16,
  },
  containerSong: { 
    flex: 1, 
    // height: 50, // Remove explicit height, allow content to define it
    justifyContent: 'center', // Center vertically if needed (might not be necessary)
  },
  title: {
    ...gStyle.textSpotify16,
    marginBottom: 4,
  },
  artist: {
    ...gStyle.textSpotify12,
    color: colors.greyInactive,
  },
  // Add icon styles back
  iconExplicit: { 
    marginRight: 4,
  },
  iconDownloaded: { 
     marginRight: 4,
  },
  containerMore: { 
    alignItems: 'center',
    justifyContent: 'center',
    width: 50, 
    height: 50, // Keep height for alignment? Or remove if container aligns center
  }
});

export default LineItemSong;
