import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import PropTypes from 'prop-types';

// Define the shape of the context data
const PlayerContext = createContext({
  currentTrack: null,
  isPlaying: false,
  playbackInstance: null,
  playbackStatus: null,
  loadTrack: async (track) => {},
  play: async () => {},
  pause: async () => {},
  seek: async (position) => {},
  // TODO: Add next/previous track logic later
});

// Hardcoded test URL (REMOVE or keep commented)
// const TEST_AUDIO_URL = 'https://storage.googleapis.com/exoplayer-test-media-0/Jazz_In_Paris.mp3'; 

export const PlayerProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackInstance, setPlaybackInstance] = useState(null);
  const [playbackStatus, setPlaybackStatus] = useState(null);
  const isSeeking = useRef(false); // To prevent status updates while seeking

  // Configure audio settings for background playback etc.
  useEffect(() => {
    const configureAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          interruptionModeIOS: 1, // Use numeric value for INTERRUPTION_MODE_IOS_DO_NOT_MIX
          shouldDuckAndroid: true,
          interruptionModeAndroid: 1, // Use numeric value for INTERRUPTION_MODE_ANDROID_DO_NOT_MIX
          playThroughEarpieceAndroid: false,
          staysActiveInBackground: true, // Important for background playback
        });
        console.log('Audio mode configured successfully.'); // Add log
      } catch (e) {
        console.error('Failed to set audio mode', e);
      }
    };
    configureAudio();
  }, []);

  // Unload sound when component unmounts
  useEffect(() => {
    return () => {
      console.log('PlayerProvider unmounting. Unloading sound.'); // Add log
      playbackInstance?.unloadAsync();
    };
  }, [playbackInstance]);

  // Update playback status
  const onPlaybackStatusUpdate = (status) => {
    // console.log('Status Update:', status); // Can be noisy, enable if needed
    if (!isSeeking.current && status.isLoaded) {
      setPlaybackStatus(status);
      // Update isPlaying state based on the status reported by the player
      setIsPlaying(status.isPlaying); 
      // Handle track finishing
      if (status.didJustFinish && !status.isLooping) {
        // TODO: Implement play next track logic here
        console.log('Track finished');
        // For now, just pause
        pause();
        // Optionally seek to start: playbackInstance?.setPositionAsync(0);
      }
    } else if (!status.isLoaded) {
        // Handle cases where the sound might unexpectedly unload
        if (playbackStatus?.isLoaded) { // Check if it was previously loaded
             console.log('Playback instance seems to have unloaded unexpectedly.');
             setIsPlaying(false);
             // Consider resetting state or attempting reload?
        }
        setPlaybackStatus(status); // Update status even if not loaded
    }
  };

  // Load a new track
  const loadTrack = async (track) => {
    // FIX: Use the actual track's previewUrl
    // const audioUrlToLoad = TEST_AUDIO_URL; 
    const audioUrlToLoad = track?.previewUrl; // Use the URL from the passed track object

    if (!track || !audioUrlToLoad) { // Check the URL we intend to load
      console.error('Cannot load track: Invalid track data or audio URL missing. Track:', track); // Log track object
      return;
    }

    console.log('Loading track:', track.title, audioUrlToLoad); // Log the URL being used
    setCurrentTrack(track);
    setIsPlaying(false); // Start paused

    try {
      // Unload previous sound if exists
      if (playbackInstance) {
        console.log('Unloading previous playback instance.');
        await playbackInstance.unloadAsync();
        setPlaybackInstance(null);
        setPlaybackStatus(null);
      }

      // Load new sound
      console.log('Calling Audio.Sound.createAsync...');
      const { sound, status } = await Audio.Sound.createAsync(
        { uri: audioUrlToLoad }, // Use the determined URL
        { 
          shouldPlay: false, // Load paused
          progressUpdateIntervalMillis: 1000, // Get status updates every second
        }, 
        onPlaybackStatusUpdate // Set the status update callback
      );

      setPlaybackInstance(sound);
      setPlaybackStatus(status); // Initial status
      console.log('Track loaded successfully. Initial Status:', status); 
      // Automatically play after loading if desired? Let's add it for now.
      await sound.playAsync(); // Try auto-playing
      console.log('Attempted auto-play after load.');

    } catch (e) {
      console.error('Failed to load track', e);
      setCurrentTrack(null); // Reset track if loading failed
      setPlaybackInstance(null);
      setPlaybackStatus(null);
    }
  };

  // Playback controls
  const play = async () => {
    console.log('[CONTEXT] Play function called.'); // Add log
    console.log('[CONTEXT] Current playbackInstance:', playbackInstance ? 'Exists' : 'Null');
    console.log('[CONTEXT] Current isPlaying state:', isPlaying);
    if (playbackInstance) {
      try {
        console.log('[CONTEXT] Attempting playbackInstance.playAsync()'); // Add log
        const status = await playbackInstance.playAsync();
        console.log('[CONTEXT] playAsync status:', status);
        // Note: isPlaying state is primarily updated by onPlaybackStatusUpdate now
        // setIsPlaying(true); // We can remove this if onPlaybackStatusUpdate handles it reliably
      } catch (e) {
        console.error('[CONTEXT] Failed to play track', e);
      }
    } else if (currentTrack) {
      console.log('[CONTEXT] Playback instance not found, reloading track...');
      // Reloading might be complex, maybe just log error or disable button
      // await loadTrack(currentTrack); 
    } else {
      console.log('[CONTEXT] Play called but no playbackInstance and no currentTrack'); 
    }
  };

  const pause = async () => {
    console.log('[CONTEXT] Pause function called.'); // Add log
    console.log('[CONTEXT] Current playbackInstance:', playbackInstance ? 'Exists' : 'Null');
    console.log('[CONTEXT] Current isPlaying state:', isPlaying);
    if (playbackInstance) {
      try {
        console.log('[CONTEXT] Attempting playbackInstance.pauseAsync()'); // Add log
        const status = await playbackInstance.pauseAsync();
        console.log('[CONTEXT] pauseAsync status:', status);
        // Note: isPlaying state is primarily updated by onPlaybackStatusUpdate now
        // setIsPlaying(false); // We can remove this if onPlaybackStatusUpdate handles it reliably
      } catch (e) {
        console.error('[CONTEXT] Failed to pause track', e);
      }
    }
  };

  const seek = async (positionMillis) => {
    console.log(`[CONTEXT] Seek function called: ${positionMillis}ms`);
    if (playbackInstance && playbackStatus?.durationMillis) {
      isSeeking.current = true; // Prevent status updates during seek
      try {
        // Ensure position is within bounds
        const clampedPosition = Math.max(0, Math.min(positionMillis, playbackStatus.durationMillis));
        console.log(`[CONTEXT] Attempting playbackInstance.setPositionAsync(${clampedPosition})`);
        await playbackInstance.setPositionAsync(clampedPosition);
        // Get status immediately after seek to update UI faster
        const status = await playbackInstance.getStatusAsync();
        if (status.isLoaded) {
            setPlaybackStatus(status); // Update local status
            setIsPlaying(status.isPlaying); // Update playing state based on post-seek status
        }
        console.log('[CONTEXT] setPositionAsync finished.');
      } catch (e) {
        console.error('[CONTEXT] Failed to seek track', e);
      } finally {
        // Allow status updates again slightly after seek command
        setTimeout(() => { 
            console.log('[CONTEXT] Re-enabling status updates after seek timeout.');
            isSeeking.current = false; 
        }, 150); // Increased timeout slightly
      }
    } else {
        console.log('[CONTEXT] Seek failed: No instance or duration info.');
    }
  };

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        playbackInstance,
        playbackStatus,
        loadTrack,
        play,
        pause,
        seek,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

// Custom hook to use the Player context
export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

PlayerProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
