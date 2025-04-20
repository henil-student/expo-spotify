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

  const [isSeeking, setIsSeeking] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);

  const positionMillis = playbackStatus?.positionMillis || 0;
  const durationMillis = playbackStatus?.durationMillis || 0;
  
  // REMOVED console.log(`[ModalMusicPlayer] Rendering - ...`); 
  
  const currentPosition = func.formatTime(positionMillis); 
  const totalDuration = func.formatTime(durationMillis); 
  const sliderProgress = durationMillis > 0 ? positionMillis / durationMillis : 0;

  useEffect(() => {
    if (!isSeeking && playbackStatus?.isLoaded && !isLoadingTrack) { 
      setSliderValue(sliderProgress);
    }
  }, [sliderProgress, isSeeking, playbackStatus, isLoadingTrack]);

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

  const onSlidingStart = () => {
     if (isLoadingTrack) return; 
     setIsSeeking(true);
     // REMOVED console.log("[ModalMusicPlayer] Slider start");
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
      // Keep this log for debugging seek specifically if needed later
      // console.log(`[ModalMusicPlayer] Slider complete - seeking to: ${seekMillis}`); 
      await seek(seekMillis);
    }
  };

  const isFirstTrack = currentIndex === 0;
  const isLastTrack = currentIndex === queue.length - 1;
  const disableControls = isLoadingTrack; 

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
          disabled={disableControls} 
        />
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{currentPosition}</Text> 
          <Text style={styles.timeText}>{totalDuration}</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
         <TouchableOpacity onPress={() => console.log('Shuffle')} disabled={disableControls} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
           <Icon name="shuffle-variant" size={24} color={disableControls ? colors.greyInactive : colors.white} />
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

         <TouchableOpacity onPress={() => console.log('Repeat')} disabled={disableControls} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
           <Icon name="repeat" size={24} color={disableControls ? colors.greyInactive : colors.white} />
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
