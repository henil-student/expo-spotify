import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, device, fonts, gStyle, func } from '../constants';
import { usePlayer } from '../context/PlayerContext';

const placeholderImage = require('../assets/images/albums/placeholder.jpg');

const BarMusicPlayer = ({ navigation }) => {
  // === HOOKS (Call all hooks unconditionally at the top) ===
  const { currentTrack, isPlaying, playbackStatus, play, pause, seek } = usePlayer(); // Hook 1
  const [isSeeking, setIsSeeking] = useState(false); // Hook 2
  const [sliderValue, setSliderValue] = useState(0); // Hook 3

  // Calculate progress (moved before useEffect, but after getting status)
  const positionMillis = playbackStatus?.positionMillis || 0;
  const durationMillis = playbackStatus?.durationMillis || 0;
  const sliderProgress = durationMillis > 0 ? positionMillis / durationMillis : 0;

  // Effect to update slider (Hook 4)
  useEffect(() => {
    // Only update slider value if not seeking and track is loaded
    if (!isSeeking && playbackStatus?.isLoaded) {
      setSliderValue(sliderProgress);
    }
    // Ensure dependencies are correct
  }, [sliderProgress, isSeeking, playbackStatus]); 

  // === Early return AFTER all hooks ===
  if (!currentTrack) {
    return null;
  }

  // === Component Logic & Handlers ===
  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const handlePressOpenModal = () => {
    console.log('Open music player modal');
    // navigation.navigate('ModalMusicPlayer');
  };

  const onSlidingStart = () => {
    console.log('Slider Start');
    setIsSeeking(true);
  };

  const onValueChange = (value) => {
    setSliderValue(value);
  };

  const onSlidingComplete = async (value) => {
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
        thumbTintColor={colors.white}
        onSlidingStart={onSlidingStart}
        onValueChange={onValueChange}
        onSlidingComplete={onSlidingComplete}
      />

      <View style={styles.content}>
        <Image source={imageSource} style={styles.image} />
        <View style={styles.containerSong}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <Text style={styles.artist} numberOfLines={1}>{artist}</Text>
        </View>
        <View style={styles.containerControls}>
          <TouchableOpacity onPress={handlePlayPause} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
             <Icon
               name={isPlaying ? "pause-circle" : "play-circle"}
               size={30}
               color={colors.white}
             />
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
    bottom: device.iPhoneX ? 88 : 60,
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
});

export default BarMusicPlayer;
