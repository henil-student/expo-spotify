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
import { useAuth } from '../context/AuthContext'; // Import useAuth

const placeholderArtwork = require('../assets/images/albums/placeholder.jpg');

const ModalMusicPlayer = ({ navigation }) => {
  // Player context state
  const { 
    currentTrack, 
    isPlaying, 
    isLoadingTrack, 
    playbackStatus, 
    play, 
    pause, 
    seek, 
    playNext,        
    playPrevious,    
    queue,           
    currentIndex     
  } = usePlayer();

  // Auth context state for likes
  const { likedSongIds, likeSong, unlikeSong, isAuthenticated } = useAuth(); // Get like state and functions

  // Local state for UI interaction
  const [isSeeking, setIsSeeking] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [isShuffleActive, setIsShuffleActive] = useState(false); // Local state for shuffle UI
  const [repeatMode, setRepeatMode] = useState('off'); // Local state for repeat UI ('off', 'queue', 'track')

  // Derived values
  const positionMillis = playbackStatus?.positionMillis || 0;
  const durationMillis = playbackStatus?.durationMillis || 0;
  const currentPosition = func.formatTime(positionMillis); 
  const totalDuration = func.formatTime(durationMillis); 
  const sliderProgress = durationMillis > 0 ? positionMillis / durationMillis : 0;

  // Determine if the current track is liked
  const isLiked = currentTrack ? likedSongIds.has(currentTrack.id) : false;

  // Effect to update slider based on playback status
  useEffect(() => {
    if (!isSeeking && playbackStatus?.isLoaded && !isLoadingTrack) { 
      setSliderValue(sliderProgress);
    }
  }, [sliderProgress, isSeeking, playbackStatus, isLoadingTrack]);

  // Handlers for player controls
  const handleClose = () => navigation.goBack();

  const handlePlayPause = () => {
    if (isLoadingTrack) return; 
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const handleSkipPrev = () => {
    if (isLoadingTrack) return; 
    playPrevious(); 
  }
  const handleSkipNext = () => {
    if (isLoadingTrack) return; 
    playNext();
  }

  // Handlers for slider interaction
  const onSlidingStart = () => {
     if (isLoadingTrack) return; 
     setIsSeeking(true);
  }
  const onValueChange = (value) => {
     if (isLoadingTrack) return; 
     setSliderValue(value);
  }
  const onSlidingComplete = async (value) => {
    if (isLoadingTrack) return; 
    setIsSeeking(false);
    if (durationMillis > 0) {
      const seekMillis = value * durationMillis;
      await seek(seekMillis);
    }
  };

  // Handlers for UI-only Shuffle/Repeat toggles
  const handleToggleShuffle = () => {
    if (disableControls) return; 
    setIsShuffleActive(prev => !prev);
    console.log('Shuffle Toggled (UI Only)'); 
  };

  const handleToggleRepeat = () => {
    if (disableControls) return; 
    setRepeatMode(prev => {
      if (prev === 'off') return 'queue';
      if (prev === 'queue') return 'track';
      return 'off'; 
    });
    console.log('Repeat Toggled (UI Only)'); 
  };

  // Handler for Like button
  const handleToggleLike = () => {
    if (!currentTrack || !isAuthenticated) return; // Need track and user auth
    if (isLiked) {
      unlikeSong(currentTrack.id);
    } else {
      likeSong(currentTrack.id);
    }
  };

  // Determine disabled states
  const isFirstTrack = currentIndex === 0;
  const isLastTrack = currentIndex === queue.length - 1;
  const disableControls = isLoadingTrack; 

  // Loading screen if no track is loaded initially
  if (!currentTrack) { 
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
         <TouchableOpacity 
           onPress={handleClose} 
           style={styles.closeButtonLoading}
           hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
         >
           <Icon name="chevron-down" size={30} color={colors.white} />
         </TouchableOpacity>
        <ActivityIndicator color={colors.white} size="large"/>
        <Text style={styles.loadingText}>Loading Track...</Text>
      </SafeAreaView>
    );
  }

  // Main player UI
  const { title, artist, artwork, album } = currentTrack; 
  const imageSource = artwork ? { uri: artwork } : placeholderArtwork;

  // Determine icon colors and names based on state
  const shuffleColor = isShuffleActive ? colors.brandPrimary : (disableControls ? colors.greyInactive : colors.white);
  const repeatColor = repeatMode !== 'off' ? colors.brandPrimary : (disableControls ? colors.greyInactive : colors.white);
  const repeatIconName = repeatMode === 'track' ? 'repeat-once' : 'repeat';
  const likeIconName = isLiked ? 'heart' : 'heart-outline';
  const likeIconColor = isLiked ? colors.brandPrimary : colors.greyInactive;

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
         {/* Like Button */}
         <TouchableOpacity 
           onPress={handleToggleLike} // Use new handler
           disabled={!isAuthenticated || disableControls} // Disable if not logged in or loading
           hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
         >
           <Icon 
             name={likeIconName} // Use dynamic icon name
             size={24} 
             color={likeIconColor} // Use dynamic color
           />
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
          disabled={disableControls} 
        />
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{currentPosition}</Text> 
          <Text style={styles.timeText}>{totalDuration}</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
         {/* Shuffle Button */}
         <TouchableOpacity 
           onPress={handleToggleShuffle} 
           disabled={disableControls} 
           hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
         >
           <Icon 
             name="shuffle-variant" 
             size={24} 
             color={shuffleColor} 
           />
         </TouchableOpacity>

        {/* Previous Button */}
        <TouchableOpacity 
          onPress={handleSkipPrev} 
          disabled={isFirstTrack || disableControls} 
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon 
            name="skip-previous" 
            size={40} 
            color={(isFirstTrack || disableControls) ? colors.greyInactive : colors.white} 
          />
        </TouchableOpacity>

        {/* Play/Pause Button */}
        <TouchableOpacity onPress={handlePlayPause} disabled={disableControls} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          {isLoadingTrack ? (
            <ActivityIndicator color={colors.white} size="large" style={styles.playPauseLoader} />
          ) : (
            <Icon name={isPlaying ? "pause-circle" : "play-circle"} size={72} color={colors.white} />
          )}
        </TouchableOpacity>

        {/* Next Button */}
        <TouchableOpacity 
          onPress={handleSkipNext} 
          disabled={isLastTrack || disableControls} 
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon 
            name="skip-next" 
            size={40} 
            color={(isLastTrack || disableControls) ? colors.greyInactive : colors.white} 
          />
        </TouchableOpacity>

         {/* Repeat Button */}
         <TouchableOpacity 
           onPress={handleToggleRepeat} 
           disabled={disableControls} 
           hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
         >
           <Icon 
             name={repeatIconName} 
             size={24} 
             color={repeatColor} 
           />
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

// Styles remain largely the same...
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
   loadingText: { 
     ...gStyle.textSpotify16,
     color: colors.white,
     marginTop: 10,
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
   playPauseLoader: { 
     width: 72, 
     height: 72, 
   },
  footerContainer: {
    marginTop: 'auto',
    paddingBottom: 20,
  },
});

export default ModalMusicPlayer;
