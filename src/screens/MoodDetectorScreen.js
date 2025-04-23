import React, { useState, useEffect } from 'react'; // Removed useRef
import { View, Text, StyleSheet, Button, ActivityIndicator, Alert } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';
import { useNavigation } from '@react-navigation/native';
import { apiService } from '../utils/api';
import { usePlayer } from '../context/PlayerContext';
import { colors, gStyle } from '../constants';

const MoodDetectorScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [detectedMood, setDetectedMood] = useState('unknown'); // 'unknown', 'happy', 'neutral'
  // Removed isDetecting state
  const [isLoadingSongs, setIsLoadingSongs] = useState(false);
  const navigation = useNavigation();
  const { loadTrack } = usePlayer();
  // Removed detectionTimeoutRef

  // --- Permissions ---
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Camera access is required to detect mood. Please enable it in your settings.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    })();
  }, [navigation]);

  // --- Face Detection (Simplified) ---
  const handleFacesDetected = ({ faces }) => {
    // No longer check isDetecting

    if (faces.length > 0) {
      const face = faces[0];
      // console.log('Face Detected:', face.smilingProbability); // For debugging

      // Simple mood inference based on smiling probability
      const mood = face.smilingProbability > 0.6 ? 'happy' : 'neutral'; // Adjust threshold as needed

      // Update mood directly if it changes
      if (mood !== detectedMood) {
         setDetectedMood(mood);
      }
      // Removed timeout logic
    } else {
      // Optional: Reset mood if no face is detected?
      // if (detectedMood !== 'unknown') {
      //   setDetectedMood('unknown');
      // }
      // For now, keep the last detected mood if face disappears briefly
    }
  };

  // Removed timeout cleanup useEffect

  // --- Play Music Logic ---
  const handlePlayMoodMusic = async () => {
    if (detectedMood === 'unknown' || isLoadingSongs) {
      return;
    }
    setIsLoadingSongs(true);
    console.log(`Fetching songs for mood: ${detectedMood}`);
    try {
      const songs = await apiService.music.fetchSongsByMood(detectedMood);
      if (songs && songs.length > 0) {
        console.log(`Found ${songs.length} songs. Loading track...`);
        // Format songs if needed for PlayerContext (ensure previewUrl, title, artist, artwork exist)
        const formattedSongs = songs.map(song => ({
          id: song.id,
          title: song.title,
          artist: song.artist?.name || 'Unknown Artist',
          artwork: song.album?.coverUrl || null, // Use album cover
          previewUrl: song.previewUrl, // Make sure this exists and is valid!
          album: song.album?.title || 'Unknown Album',
          duration: song.duration, // Optional, but good to have
        }));
        
        // Filter out songs without a previewUrl
        const playableSongs = formattedSongs.filter(song => song.previewUrl);

        if (playableSongs.length > 0) {
          await loadTrack(playableSongs[0], playableSongs, 0); // Load the first song and set queue
          navigation.goBack(); // Close modal after loading
        } else {
           Alert.alert('No Playable Songs', `Could not find any playable songs for mood: ${detectedMood}.`);
           setIsLoadingSongs(false);
        }

      } else {
        Alert.alert('No Songs Found', `No songs were found matching the mood: ${detectedMood}.`);
        setIsLoadingSongs(false);
      }
    } catch (error) {
      console.error('Error playing mood music:', error);
      Alert.alert('Error', 'Could not load songs for the detected mood.');
      setIsLoadingSongs(false);
    }
  };

  // --- Render Logic ---
  if (hasPermission === null) {
    return (
      <View style={styles.containerCenter}>
        <ActivityIndicator size="large" color={colors.white} />
        <Text style={styles.messageText}>Requesting camera permission...</Text>
      </View>
    );
  }
  if (hasPermission === false) {
    return (
      <View style={styles.containerCenter}>
        <Text style={styles.messageText}>Camera permission denied.</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} color={colors.brandPrimary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        type={CameraType.front}
        onFacesDetected={handleFacesDetected}
        faceDetectorSettings={{
          mode: FaceDetector.FaceDetectorMode.fast,
          detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
          runClassifications: FaceDetector.FaceDetectorClassifications.all, // Need classifications for smilingProbability
          minDetectionInterval: 200, // Adjust interval as needed for responsiveness vs performance
          tracking: true,
        }}
      />
      <View style={styles.overlay}>
        {/* Updated Status Text */}
        <Text style={styles.statusText}>
          {detectedMood === 'unknown' ? 'Point camera at face...' : `Current Mood: ${detectedMood.toUpperCase()}`}
        </Text>
        {isLoadingSongs ? (
          <ActivityIndicator size="large" color={colors.brandPrimary} style={styles.buttonSpacing} />
        ) : (
          <Button
            title={`Play ${detectedMood !== 'unknown' ? detectedMood.toUpperCase() : ''} Music`}
            onPress={handlePlayMoodMusic}
            // Updated disabled condition
            disabled={detectedMood === 'unknown' || isLoadingSongs}
            color={colors.brandPrimary}
          />
        )}
         <View style={styles.buttonSpacing} />
         <Button
            title="Cancel"
            onPress={() => navigation.goBack()}
            color={colors.greyInactive}
          />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  containerCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.black,
    padding: 20,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 30,
    alignItems: 'center',
  },
  messageText: {
    ...gStyle.textSpotify16,
    color: colors.white,
    textAlign: 'center',
    marginBottom: 20,
  },
  statusText: {
    ...gStyle.textSpotifyBold18,
    color: colors.white,
    marginBottom: 20,
  },
  buttonSpacing: {
     marginTop: 15,
     marginBottom: 15,
  }
});

export default MoodDetectorScreen;
