import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Image, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native'; // Import ActivityIndicator
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, device, fonts, gStyle, func } from '../constants';
import { usePlayer } from '../context/PlayerContext';

const placeholderImage = require('../assets/images/albums/placeholder.jpg');

const BarMusicPlayer = ({ navigation }) => {
  // === HOOKS ===
  // Get isLoadingTrack as well
  const { 
    currentTrack, 
    isPlaying, 
    isLoadingTrack, // Get loading state
    playbackStatus, 
    play, 
    pause, 
    seek 
  } = usePlayer(); 
  const [isSeeking, setIsSeeking] = useState(false); 
  const [sliderValue, setSliderValue] = useState(0); 

  // Calculate progress
  const positionMillis = playbackStatus?.positionMillis || 0;
  const durationMillis = playbackStatus?.durationMillis || 0;
  const sliderProgress = durationMillis > 0 ? positionMillis / durationMillis : 0;

  // Effect to update slider
  useEffect(() => {
    // Only update slider value if not seeking, track is loaded, and not currently loading a new track
    if (!isSeeking && playbackStatus?.isLoaded && !isLoadingTrack) { 
      setSliderValue(sliderProgress);
    }
  }, [sliderProgress, isSeeking, playbackStatus, isLoadingTrack]); // Add isLoadingTrack dependency

  // === Early return AFTER all hooks ===
  if (!currentTrack) {
    return null;
  }

  // === Component Logic & Handlers ===
  const handlePlayPause = () => {
    if (isLoadingTrack) return; // Prevent action while loading
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const handlePressOpenModal = () => {
    console.log('Open music player modal');
    navigation.navigate('ModalMusicPlayer'); 
  };

  const onSlidingStart = () => {
    if (isLoadingTrack) return; // Prevent seeking while loading
    console.log('Slider Start');
    setIsSeeking(true);
  };

  const onValueChange = (value) => {
    if (isLoadingTrack) return; // Prevent seeking while loading
    setSliderValue(value);
  };

  const onSlidingComplete = async (value) => {
    if (isLoadingTrack) return; // Prevent seeking while loading
    console.log('Slider Complete:', value);
    setIsSeeking(false);
    if (durationMillis > 0) {
      const seekMillis = value * durationMillis;
      console.log('Seeking to:', seekMillis);
      await seek(seekMillis);
    }
  };

  const { title, artist, artwork } = currentTrack;
  const imageSource = artwork ? { uri: artwork } : placeholderImage;
  const disableControls = isLoadingTrack; // Flag to disable controls

  // === Render ===
  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={handlePressOpenModal} 
      style={styles.container}
    >
      <Slider
        style={styles.progressBar}
        minimumValue={0}
        maximumValue={1}
        value={sliderValue}
        minimumTrackTintColor={colors.white}
        maximumTrackTintColor={colors.greyInactive}
        thumbTintColor={colors.white} // Keep thumb visible but disable interaction
        onSlidingStart={onSlidingStart}
        onValueChange={onValueChange}
        onSlidingComplete={onSlidingComplete}
        disabled={disableControls} // Disable slider during loading
      />

      <View style={styles.content}>
        <Image source={imageSource} style={styles.image} />
        <View style={styles.containerSong}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <Text style={styles.artist} numberOfLines={1}>{artist}</Text>
        </View>
        <View style={styles.containerControls}>
          {/* Show loader if isLoadingTrack */}
          <TouchableOpacity 
             onPress={handlePlayPause} 
             disabled={disableControls} 
             hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
             style={styles.playPauseButton} // Added style for sizing
          >
             {isLoadingTrack ? (
               <ActivityIndicator color={colors.white} size="small" />
             ) : (
               <Icon
                 name={isPlaying ? "pause-circle" : "play-circle"}
                 size={30}
                 color={colors.white}
               />
             )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

BarMusicPlayer.propTypes = {
  navigation: PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.grey,
    position: 'absolute',
    bottom: device.iPhoneX ? 88 : 60, // Adjusted for safe area if needed
    left: 0,
    right: 0,
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: colors.blackBg,
    paddingTop: 2, 
  },
  progressBar: {
    height: 10, 
    width: '100%', 
    position: 'absolute', 
    top: -4, 
    left: 0,
    right: 0,
    zIndex: 1, 
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 2, 
  },
  image: {
    height: 40,
    width: 40,
    marginRight: 12,
  },
  containerSong: {
    flex: 1,
    overflow: 'hidden',
    marginRight: 12,
  },
  title: {
    ...gStyle.textSpotify14,
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
    paddingLeft: 8,
  },
  playPauseButton: { // Added style to ensure consistent size for icon/loader
     width: 30,
     height: 30,
     alignItems: 'center',
     justifyContent: 'center',
  }
});

export default BarMusicPlayer;
