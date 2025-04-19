import React from 'react';
import PropTypes from 'prop-types';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Import Icon
import { colors, device, fonts, gStyle } from '../constants'; // Removed images import
import { usePlayer } from '../context/PlayerContext';
import TouchIcon from './TouchIcon'; // Keep TouchIcon for consistent touch handling

// Default placeholder image
const placeholderImage = require('../assets/images/albums/placeholder.jpg');

const BarMusicPlayer = ({ navigation }) => {
  // Use player context
  const { currentTrack, isPlaying, play, pause } = usePlayer();

  // Don't render anything if no track is loaded
  if (!currentTrack) {
    return null;
  }

  const { title, artist, coverUrl } = currentTrack;
  const imageSource = coverUrl ? { uri: coverUrl } : placeholderImage;

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const handlePressOpenModal = () => {
    // TODO: Navigate to ModalMusicPlayer
    console.log('Open music player modal');
    // navigation.navigate('ModalMusicPlayer');
  };

  return (
    <TouchableOpacity
      activeOpacity={1} // Use 1 to prevent visual feedback on the bar itself
      onPress={handlePressOpenModal}
      style={styles.container}
    >
      {/* Progress Bar (simple version for now) */}
      {/* TODO: Add actual progress based on playbackStatus */}
      <View style={styles.progressBar} />

      <View style={styles.content}>
        <Image source={imageSource} style={styles.image} />

        <View style={styles.containerSong}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <Text style={styles.artist} numberOfLines={1}>{artist}</Text>
        </View>

        <View style={styles.containerControls}>
          {/* Play/Pause Button using Vector Icon */}
          <TouchableOpacity onPress={handlePlayPause} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
             <Icon 
               name={isPlaying ? "pause-circle" : "play-circle"} 
               size={30} // Slightly larger icon
               color={colors.white} 
             />
          </TouchableOpacity>
          {/* TODO: Add other controls like next/previous if needed */}
        </View>
      </View>
    </TouchableOpacity>
  );
};

// navigation is needed if we want to navigate onPress
BarMusicPlayer.propTypes = {
  navigation: PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.grey, // Use a slightly different background
    position: 'absolute',
    bottom: device.iPhoneX ? 88 : 60, // Adjust based on tab bar height
    left: 0,
    right: 0,
    width: '100%',
    borderTopWidth: 1, // Add a subtle top border
    borderTopColor: colors.blackBg,
  },
  progressBar: {
    backgroundColor: colors.brandPrimary,
    height: 2, // Simple progress indicator height
    width: '40%', // TODO: Update this dynamically based on playbackStatus
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  image: {
    height: 40, // Smaller image for the bar
    width: 40,
    marginRight: 12,
  },
  containerSong: {
    flex: 1, // Take remaining space
    overflow: 'hidden',
    marginRight: 12,
  },
  title: {
    ...gStyle.textSpotify14, // Slightly smaller font
    color: colors.white,
    marginBottom: 2,
  },
  artist: {
    ...gStyle.textSpotify12,
    color: colors.greyInactive,
  },
  containerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8, // Add some padding before the controls
  },
  // Removed icon style as vector icon handles size/color directly
});

export default BarMusicPlayer;
