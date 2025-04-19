import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator
} from 'react-native';
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, device, fonts, gStyle, func } from '../constants';
import { usePlayer } from '../context/PlayerContext';

const placeholderArtwork = require('../assets/images/albums/placeholder.jpg');

const ModalMusicPlayer = ({ navigation }) => {
  // Get state and functions from usePlayer, including queue logic
  const { 
    currentTrack, 
    isPlaying, 
    playbackStatus, 
    play, 
    pause, 
    seek, 
    playNext,        // Added
    playPrevious,    // Added
    queue,           // Added
    currentIndex     // Added
  } = usePlayer();

  const [isSeeking, setIsSeeking] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);

  // Calculate progress and times
  const positionMillis = playbackStatus?.positionMillis || 0;
  const durationMillis = playbackStatus?.durationMillis || 0;
  const currentPosition = func.formatTime(positionMillis);
  const totalDuration = func.formatTime(durationMillis);
  const sliderProgress = durationMillis > 0 ? positionMillis / durationMillis : 0;

  // Update slider effect
  useEffect(() => {
    if (!isSeeking && playbackStatus?.isLoaded) {
      setSliderValue(sliderProgress);
    }
  }, [sliderProgress, isSeeking, playbackStatus]);

  // Handlers
  const handleClose = () => navigation.goBack();

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  // Connect skip handlers to context functions
  const handleSkipPrev = () => playPrevious(); 
  const handleSkipNext = () => playNext();

  // Slider handlers
  const onSlidingStart = () => setIsSeeking(true);
  const onValueChange = (value) => setSliderValue(value);
  const onSlidingComplete = async (value) => {
    setIsSeeking(false);
    if (durationMillis > 0) {
      const seekMillis = value * durationMillis;
      await seek(seekMillis);
    }
  };

  // Determine if skip buttons should be disabled
  const isFirstTrack = currentIndex === 0;
  const isLastTrack = currentIndex === queue.length - 1;

  // Loading state
  if (!currentTrack || !playbackStatus?.isLoaded) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
         <TouchableOpacity 
           onPress={handleClose} 
           style={styles.closeButtonLoading}
           hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
         >
           <Icon name="chevron-down" size={30} color={colors.white} />
         </TouchableOpacity>
        <ActivityIndicator color={colors.white} />
      </SafeAreaView>
    );
  }

  // Track data is available
  const { title, artist, artwork, album } = currentTrack;
  const imageSource = artwork ? { uri: artwork } : placeholderArtwork;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Icon name="chevron-down" size={30} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{album || 'Unknown Album'}</Text> 
        <TouchableOpacity onPress={() => console.log('More Options')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Icon name="dots-horizontal" size={30} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Artwork */}
      <View style={styles.artworkContainer}>
        <Image source={imageSource} style={styles.artwork} />
      </View>

      {/* Track Info */}
      <View style={styles.trackInfoContainer}>
        <View style={styles.trackInfoText}>
           <Text style={styles.titleText} numberOfLines={1}>{title}</Text>
           <Text style={styles.artistText} numberOfLines={1}>{artist}</Text>
        </View>
         <TouchableOpacity onPress={() => console.log('Like')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
           <Icon name="heart-outline" size={24} color={colors.greyInactive} />
         </TouchableOpacity>
      </View>

      {/* Progress Slider & Time */}
      <View style={styles.progressContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          value={sliderValue}
          minimumTrackTintColor={colors.white}
          maximumTrackTintColor={colors.greyInactive}
          thumbTintColor={colors.white}
          onSlidingStart={onSlidingStart}
          onValueChange={onValueChange}
          onSlidingComplete={onSlidingComplete}
        />
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{currentPosition}</Text>
          <Text style={styles.timeText}>{totalDuration}</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
         <TouchableOpacity onPress={() => console.log('Shuffle')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
           <Icon name="shuffle-variant" size={24} color={colors.greyInactive} />
         </TouchableOpacity>

        {/* Previous Button */}
        <TouchableOpacity 
          onPress={handleSkipPrev} 
          disabled={isFirstTrack} // Disable if first track
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon 
            name="skip-previous" 
            size={40} 
            color={isFirstTrack ? colors.greyInactive : colors.white} // Dim if disabled
          />
        </TouchableOpacity>

        {/* Play/Pause Button */}
        <TouchableOpacity onPress={handlePlayPause} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Icon name={isPlaying ? "pause-circle" : "play-circle"} size={72} color={colors.white} />
        </TouchableOpacity>

        {/* Next Button */}
        <TouchableOpacity 
          onPress={handleSkipNext} 
          disabled={isLastTrack} // Disable if last track
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon 
            name="skip-next" 
            size={40} 
            color={isLastTrack ? colors.greyInactive : colors.white} // Dim if disabled
          />
        </TouchableOpacity>

         <TouchableOpacity onPress={() => console.log('Repeat')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
           <Icon name="repeat" size={24} color={colors.greyInactive} />
         </TouchableOpacity>
      </View>

      {/* Footer (Optional) */}
      <View style={styles.footerContainer}>
         {/* Add device/share icons later */}
      </View>

    </SafeAreaView>
  );
};

ModalMusicPlayer.propTypes = {
  navigation: PropTypes.object.isRequired,
};

// Styles remain the same as before...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.blackBg,
    paddingTop: device.iPhoneX ? 50 : 24,
  },
  loadingContainer: { 
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonLoading: { 
     position: 'absolute',
     top: device.iPhoneX ? 50 : 24,
     left: 16,
     zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    ...gStyle.textSpotifyBold12,
    color: colors.white,
    textAlign: 'center',
    flex: 1, 
    marginHorizontal: 10, 
  },
  artworkContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: 20,
    marginBottom: 40,
  },
  artwork: {
    width: device.width - 80,
    height: device.width - 80,
  },
  trackInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  trackInfoText: {
     flex: 1,
     marginRight: 16,
  },
  titleText: {
    ...gStyle.textSpotifyBold20,
    color: colors.white,
    marginBottom: 4,
    textAlign: 'left',
  },
  artistText: {
    ...gStyle.textSpotify16,
    color: colors.greyInactive,
    textAlign: 'left',
  },
  progressContainer: {
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  slider: {
    width: '100%',
    height: 20,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  timeText: {
    ...gStyle.textSpotify10,
    color: colors.greyInactive,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around', 
    alignItems: 'center',
    paddingHorizontal: 30,
    marginTop: 20,
  },
  footerContainer: {
    marginTop: 'auto',
    paddingBottom: 20,
  },
});

export default ModalMusicPlayer;
