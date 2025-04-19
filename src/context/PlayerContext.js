import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import PropTypes from 'prop-types';

// Define the shape of the context data
const PlayerContext = createContext({
  currentTrack: null,
  isPlaying: false,
  playbackInstance: null,
  playbackStatus: null,
  queue: [], // Added queue state
  currentIndex: null, // Added currentIndex state
  loadTrack: async (initialTrack, trackQueue, initialIndex) => {}, // Updated signature
  play: async () => {},
  pause: async () => {},
  seek: async (position) => {},
  playNext: async () => {}, // Added playNext
  playPrevious: async () => {}, // Added playPrevious
});

export const PlayerProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackInstance, setPlaybackInstance] = useState(null);
  const [playbackStatus, setPlaybackStatus] = useState(null);
  const [queue, setQueue] = useState([]); // State for the track queue
  const [currentIndex, setCurrentIndex] = useState(null); // State for the current index in the queue
  const isSeeking = useRef(false);

  // Configure audio settings
  useEffect(() => {
    const configureAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          interruptionModeIOS: 1, 
          shouldDuckAndroid: true,
          interruptionModeAndroid: 1, 
          playThroughEarpieceAndroid: false,
          staysActiveInBackground: true,
        });
        console.log('Audio mode configured successfully.');
      } catch (e) {
        console.error('Failed to set audio mode', e);
      }
    };
    configureAudio();
  }, []);

  // Unload sound on unmount
  useEffect(() => {
    return () => {
      console.log('PlayerProvider unmounting. Unloading sound.');
      playbackInstance?.unloadAsync();
    };
  }, [playbackInstance]);

  // Internal function to load and play a specific track object
  const _loadAudio = async (track) => {
    if (!track || !track.previewUrl) {
      console.error('Cannot load audio: Invalid track data or preview URL missing. Track:', track);
      // Reset state if loading fails fundamentally
      setCurrentTrack(null);
      setPlaybackInstance(null);
      setPlaybackStatus(null);
      setIsPlaying(false);
      // Consider clearing queue? Maybe not, user might retry.
      return false; // Indicate failure
    }

    console.log('Loading audio for track:', track.title, track.previewUrl);
    setCurrentTrack(track); // Update current track state
    setIsPlaying(false); // Assume paused initially

    try {
      // Unload previous sound
      if (playbackInstance) {
        console.log('Unloading previous playback instance.');
        await playbackInstance.unloadAsync();
        // Keep playbackInstance state until new one is set? No, set to null.
        setPlaybackInstance(null); 
        setPlaybackStatus(null); // Reset status too
      }

      // Load new sound
      console.log('Calling Audio.Sound.createAsync...');
      const { sound, status } = await Audio.Sound.createAsync(
        { uri: track.previewUrl },
        { 
          shouldPlay: true, // Attempt to play immediately after loading
          progressUpdateIntervalMillis: 1000, 
        }, 
        onPlaybackStatusUpdate // Use the single status update handler
      );

      setPlaybackInstance(sound);
      setPlaybackStatus(status); // Set initial status
      // isPlaying state will be updated by onPlaybackStatusUpdate based on actual playback
      console.log('Audio loaded successfully. Initial Status:', status);
      return true; // Indicate success

    } catch (e) {
      console.error('Failed to load audio', e);
      setCurrentTrack(null); // Reset track if loading failed
      setPlaybackInstance(null);
      setPlaybackStatus(null);
      setIsPlaying(false);
      return false; // Indicate failure
    }
  };

  // Update playback status handler
  const onPlaybackStatusUpdate = (status) => {
    if (!status.isLoaded) {
      // Handle unload or error during loading/playback
      if (playbackStatus?.isLoaded) { // Check if it *was* loaded before
        console.log('Playback instance unloaded unexpectedly or failed to load.');
        setIsPlaying(false);
        // Optionally reset currentTrack/playbackInstance here if needed
        // setPlaybackInstance(null); 
        // setCurrentTrack(null); // Maybe keep track info?
      }
      setPlaybackStatus(status); // Update status anyway
      return; // Don't proceed if not loaded
    }

    // Only update state if not currently seeking manually
    if (!isSeeking.current) {
      setPlaybackStatus(status);
      setIsPlaying(status.isPlaying); 

      // Handle track finishing
      if (status.didJustFinish && !status.isLooping) {
        console.log('Track finished, playing next.');
        playNext(); // Call playNext when track finishes
      }
    }
  };

  // Exposed function to load track(s) and set the queue
  const loadTrack = async (initialTrack, trackQueue = [], initialIndex = 0) => {
    console.log(`[CONTEXT] loadTrack called. Index: ${initialIndex}, Queue length: ${trackQueue.length}`);
    // Ensure queue is valid array
    const validQueue = Array.isArray(trackQueue) ? trackQueue : [];
    // Ensure index is valid
    const validIndex = (typeof initialIndex === 'number' && initialIndex >= 0 && initialIndex < validQueue.length) ? initialIndex : 0;
    // Ensure the track at the index is valid
    const trackToLoad = validQueue[validIndex] || initialTrack; // Fallback to initialTrack if index/queue invalid

    if (!trackToLoad) {
        console.error("No valid track to load.");
        return;
    }

    setQueue(validQueue);
    setCurrentIndex(validIndex);
    
    // Load the specific track using the internal function
    await _loadAudio(trackToLoad); 
  };

  // Play next track in the queue
  const playNext = async () => {
    console.log('[CONTEXT] playNext called.');
    if (queue.length === 0 || currentIndex === null) {
      console.log('PlayNext: No queue or index.');
      return;
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex < queue.length) {
      console.log(`Playing next track at index: ${nextIndex}`);
      setCurrentIndex(nextIndex);
      const nextTrack = queue[nextIndex];
      await _loadAudio(nextTrack);
    } else {
      console.log('End of queue reached.');
      // Optional: Stop playback, seek to start of last track, etc.
      // For now, just stop and reset state slightly
      if (playbackInstance) {
          await playbackInstance.stopAsync(); // Stop playback
          // Optionally unload: await playbackInstance.unloadAsync(); setPlaybackInstance(null);
      }
      // Resetting index might be confusing if user presses prev later
      // setCurrentIndex(null); 
      // setQueue([]);
      setIsPlaying(false); // Ensure state reflects stopped playback
    }
  };

  // Play previous track in the queue
  const playPrevious = async () => {
    console.log('[CONTEXT] playPrevious called.');
     if (queue.length === 0 || currentIndex === null) {
      console.log('PlayPrevious: No queue or index.');
      return;
    }

    // If near the beginning of the track, just seek to 0
    if (playbackStatus?.positionMillis > 3000 && currentIndex >= 0) { // More than 3 seconds in
        console.log('Seeking to beginning of current track.');
        await seek(0);
        return; // Don't go to previous track yet
    }

    // Otherwise, go to the previous track if possible
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      console.log(`Playing previous track at index: ${prevIndex}`);
      setCurrentIndex(prevIndex);
      const prevTrack = queue[prevIndex];
      await _loadAudio(prevTrack);
    } else {
      console.log('Start of queue reached.');
      // Optional: Seek to 0 of the first track if not already there
      if (playbackStatus?.positionMillis !== 0) {
          await seek(0);
      }
    }
  };


  // Playback controls (play, pause, seek remain largely the same)
  const play = async () => {
    console.log('[CONTEXT] Play function called.');
    if (playbackInstance) {
      try {
        console.log('[CONTEXT] Attempting playbackInstance.playAsync()');
        await playbackInstance.playAsync();
        // isPlaying state updated via onPlaybackStatusUpdate
      } catch (e) {
        console.error('[CONTEXT] Failed to play track', e);
      }
    } else if (currentTrack) {
      console.log('[CONTEXT] Playback instance not found, reloading current track...');
      // Attempt to reload the current track if instance is lost
      await _loadAudio(currentTrack); 
    } else {
      console.log('[CONTEXT] Play called but no track loaded.'); 
    }
  };

  const pause = async () => {
    console.log('[CONTEXT] Pause function called.');
    if (playbackInstance) {
      try {
        console.log('[CONTEXT] Attempting playbackInstance.pauseAsync()');
        await playbackInstance.pauseAsync();
         // isPlaying state updated via onPlaybackStatusUpdate
      } catch (e) {
        console.error('[CONTEXT] Failed to pause track', e);
      }
    }
  };

  const seek = async (positionMillis) => {
    console.log(`[CONTEXT] Seek function called: ${positionMillis}ms`);
    if (playbackInstance && playbackStatus?.durationMillis) {
      isSeeking.current = true;
      try {
        const clampedPosition = Math.max(0, Math.min(positionMillis, playbackStatus.durationMillis));
        console.log(`[CONTEXT] Attempting playbackInstance.setPositionAsync(${clampedPosition})`);
        await playbackInstance.setPositionAsync(clampedPosition);
        // Get status immediately after seek
        const status = await playbackInstance.getStatusAsync();
        if (status.isLoaded) {
            setPlaybackStatus(status); 
            setIsPlaying(status.isPlaying); 
        }
        console.log('[CONTEXT] setPositionAsync finished.');
      } catch (e) {
        console.error('[CONTEXT] Failed to seek track', e);
      } finally {
        setTimeout(() => { 
            console.log('[CONTEXT] Re-enabling status updates after seek timeout.');
            isSeeking.current = false; 
        }, 150); 
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
        queue, // Expose queue
        currentIndex, // Expose index
        loadTrack, // Expose updated loadTrack
        play,
        pause,
        seek,
        playNext, // Expose playNext
        playPrevious, // Expose playPrevious
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

// Custom hook remains the same
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
