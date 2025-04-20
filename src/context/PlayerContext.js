import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import PropTypes from 'prop-types';

// Define the shape of the context data
const PlayerContext = createContext({
  currentTrack: null,
  isPlaying: false,
  isLoadingTrack: false, 
  playbackInstance: null,
  playbackStatus: null,
  queue: [], 
  currentIndex: null, 
  loadTrack: async (initialTrack, trackQueue, initialIndex) => {}, 
  play: async () => {},
  pause: async () => {},
  seek: async (position) => {},
  playNext: async () => {}, 
  playPrevious: async () => {}, 
});

export const PlayerProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingTrack, setIsLoadingTrack] = useState(false); 
  const [playbackInstance, setPlaybackInstance] = useState(null);
  const [playbackStatus, setPlaybackStatus] = useState(null);
  const [queue, setQueue] = useState([]); 
  const [currentIndex, setCurrentIndex] = useState(null); 
  const isSeeking = useRef(false);
  const currentPlaybackInstanceRef = useRef(null); 

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
        // console.log('Audio mode configured successfully.'); // Keep this one maybe
      } catch (e) {
        console.error('Failed to set audio mode', e);
      }
    };
    configureAudio();
  }, []);

  // Unload sound on unmount
  useEffect(() => {
    return () => {
      // console.log('PlayerProvider unmounting. Unloading sound.'); // Keep this one maybe
      currentPlaybackInstanceRef.current?.unloadAsync(); 
    };
  }, []); 

  // Update playback status handler
  const onPlaybackStatusUpdate = (status) => {
    // REMOVED console.log(`[PlayerContext] onPlaybackStatusUpdate: ...`);
    
    if (!status.isLoaded) {
      if (status.error) {
         console.error(`[PlayerContext] Playback Error: ${status.error}`);
         setIsLoadingTrack(false); 
      }
      // Consider setting status to null or a minimal unloaded state here?
      // setPlaybackStatus(prevStatus => (prevStatus?.isLoaded ? status : prevStatus)); // Only update if it was previously loaded?
      return; 
    }

    // Only update state if not currently seeking manually
    if (!isSeeking.current) {
      // REMOVED console.log(`[PlayerContext] Applying status update: ...`);
      
      // Optimization: Only update if necessary? Compare with previous status.
      // This adds complexity, let's see if removing logs is enough first.
      setPlaybackStatus(status); 
      
      // Only update isPlaying/isLoadingTrack if they actually changed
      setIsPlaying(prev => prev !== status.isPlaying ? status.isPlaying : prev);
      setIsLoadingTrack(prev => prev ? false : prev); // Set loading to false if it was true

      // Handle track finishing
      if (status.didJustFinish && !status.isLooping) {
        console.log('[PlayerContext] Track finished naturally.'); // Keep this log
        const nextIndex = currentIndex !== null ? currentIndex + 1 : null;
        if (nextIndex !== null && nextIndex < queue.length) {
          // console.log(`[PlayerContext] Preparing to load next track at index: ${nextIndex}`); // Remove?
          const nextTrack = queue[nextIndex];
          _loadAudio(nextTrack, nextIndex); 
        } else {
          console.log('[PlayerContext] End of queue reached after track finish.'); // Keep this log
           if (currentPlaybackInstanceRef.current) { 
              currentPlaybackInstanceRef.current.stopAsync(); 
           }
           setIsPlaying(false); 
        }
      }
    } else {
        // REMOVED console.log("[PlayerContext] Ignoring status update while seeking.");
    }
  };

  // Internal function to load and play a specific track object
  const _loadAudio = async (track, indexToSet) => {
    if (!track || !track.previewUrl) {
      console.error('[PlayerContext] Cannot load audio: Invalid track data or preview URL missing. Track:', track);
      setIsLoadingTrack(false); 
      return false; 
    }

    // console.log(`[PlayerContext] Loading audio for track: ${track.title} at index ${indexToSet}`); // Remove?
    setIsLoadingTrack(true); 
    setIsPlaying(false); 
    
    setCurrentTrack(track); 
    setCurrentIndex(indexToSet);

    const oldPlaybackInstance = currentPlaybackInstanceRef.current; 

    try {
      // console.log('[PlayerContext] Calling Audio.Sound.createAsync...'); // Remove?
      const { sound: newSound, status: initialStatus } = await Audio.Sound.createAsync(
        { uri: track.previewUrl },
        { 
          shouldPlay: true, 
          progressUpdateIntervalMillis: 1000, 
        }, 
        onPlaybackStatusUpdate 
      );
      // console.log('[PlayerContext] Audio loaded successfully. New instance created.'); // Remove?

      currentPlaybackInstanceRef.current = newSound; 
      
      setPlaybackInstance(newSound); 
      setPlaybackStatus(initialStatus); 
      // console.log('[PlayerContext] New playback instance set.'); // Remove?

      if (oldPlaybackInstance) {
        // console.log('[PlayerContext] Unloading previous playback instance.'); // Remove?
        await oldPlaybackInstance.unloadAsync();
        // console.log('[PlayerContext] Previous instance unloaded.'); // Remove?
      }
      
      return true; 

    } catch (e) {
      console.error('[PlayerContext] Failed to load audio', e); // Keep error logs
       if (oldPlaybackInstance) {
          try { await oldPlaybackInstance.stopAsync(); } catch {} 
       }
       currentPlaybackInstanceRef.current = null; 
       setPlaybackInstance(null);
       setPlaybackStatus(null);
       setCurrentTrack(null); 
       setCurrentIndex(null);
       setIsPlaying(false);
       setIsLoadingTrack(false); 
      return false; 
    }
  };

  // Exposed function to load track(s) and set the queue
  const loadTrack = async (initialTrack, trackQueue = [], initialIndex = 0) => {
    // console.log(`[PlayerContext] loadTrack called. Index: ${initialIndex}, Queue length: ${trackQueue.length}`); // Remove?
    const validQueue = Array.isArray(trackQueue) ? trackQueue : [];
    const validIndex = (typeof initialIndex === 'number' && initialIndex >= 0 && initialIndex < validQueue.length) ? initialIndex : 0;
    const trackToLoad = validQueue[validIndex] || initialTrack; 

    if (!trackToLoad) {
        console.error("[PlayerContext] No valid track to load."); // Keep error
        return;
    }

    setQueue(validQueue);
    await _loadAudio(trackToLoad, validIndex); 
  };

  // Play next track in the queue
  const playNext = async () => {
    // console.log('[PlayerContext] playNext called manually.'); // Remove?
    if (isLoadingTrack) { /* console.log("[PlayerContext] Already loading track, ignoring manual playNext."); */ return; } 
    if (queue.length === 0 || currentIndex === null) {
      // console.log('[PlayerContext] PlayNext: No queue or index.'); // Remove?
      return;
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex < queue.length) {
      // console.log(`[PlayerContext] Manually playing next track at index: ${nextIndex}`); // Remove?
      const nextTrack = queue[nextIndex];
      await _loadAudio(nextTrack, nextIndex); 
    } else {
      // console.log('[PlayerContext] End of queue reached on manual next.'); // Remove?
       if (currentPlaybackInstanceRef.current) { 
          await currentPlaybackInstanceRef.current.stopAsync(); 
       }
       setIsPlaying(false); 
    }
  };

  // Play previous track in the queue
  const playPrevious = async () => {
    // console.log('[PlayerContext] playPrevious called manually.'); // Remove?
     if (isLoadingTrack) { /* console.log("[PlayerContext] Already loading track, ignoring manual playPrevious."); */ return; } 
     if (queue.length === 0 || currentIndex === null) {
      // console.log('[PlayerContext] PlayPrevious: No queue or index.'); // Remove?
      return;
    }

    const currentPositionMs = playbackStatus?.positionMillis || 0;
    if (currentPositionMs > 3000 && currentIndex >= 0) { 
        // console.log('[PlayerContext] Seeking to beginning of current track.'); // Remove?
        await seek(0);
        return; 
    }

    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      // console.log(`[PlayerContext] Manually playing previous track at index: ${prevIndex}`); // Remove?
      const prevTrack = queue[prevIndex];
      await _loadAudio(prevTrack, prevIndex); 
    } else {
      // console.log('[PlayerContext] Start of queue reached on manual previous.'); // Remove?
      if (currentPositionMs !== 0) {
          await seek(0);
      }
    }
  };

  // Playback controls
  const play = async () => {
    // console.log('[PlayerContext] Play function called.'); // Remove?
    const instance = currentPlaybackInstanceRef.current; 
    if (instance) {
      try {
        // console.log('[PlayerContext] Attempting playbackInstance.playAsync()'); // Remove?
        await instance.playAsync();
      } catch (e) {
        console.error('[PlayerContext] Failed to play track', e); // Keep error
      }
    } else if (currentTrack) {
      // console.log('[PlayerContext] Playback instance not found, reloading current track...'); // Remove?
      await _loadAudio(currentTrack, currentIndex); 
    } else {
      // console.log('[PlayerContext] Play called but no track loaded.'); // Remove?
    }
  };

  const pause = async () => {
    // console.log('[PlayerContext] Pause function called.'); // Remove?
    const instance = currentPlaybackInstanceRef.current; 
    if (instance) {
      try {
        // console.log('[PlayerContext] Attempting playbackInstance.pauseAsync()'); // Remove?
        await instance.pauseAsync();
      } catch (e) {
        console.error('[PlayerContext] Failed to pause track', e); // Keep error
      }
    }
  };

  const seek = async (positionMillis) => {
    // console.log(`[PlayerContext] Seek function called: ${positionMillis}ms`); // Remove?
    const instance = currentPlaybackInstanceRef.current; 
    const currentStatus = instance ? await instance.getStatusAsync() : playbackStatus; 

    if (instance && currentStatus?.isLoaded && currentStatus?.durationMillis) {
      isSeeking.current = true;
      // console.log('[PlayerContext] Seek started, isSeeking=true'); // Remove?

      try {
        const clampedPosition = Math.max(0, Math.min(positionMillis, currentStatus.durationMillis));
        // console.log(`[PlayerContext] Attempting playbackInstance.setPositionAsync(${clampedPosition})`); // Remove?
        
        await instance.setPositionAsync(clampedPosition);
        
        const statusAfterSeek = await instance.getStatusAsync();
        if (statusAfterSeek.isLoaded) {
            // console.log(`[PlayerContext] Seek finished, applying status: positionMillis=${statusAfterSeek.positionMillis}`); // Remove?
            setPlaybackStatus(statusAfterSeek); 
            setIsPlaying(statusAfterSeek.isPlaying); 
        } else {
             // console.log('[PlayerContext] Seek finished, but instance unloaded unexpectedly.'); // Remove?
        }
        
      } catch (e) {
        console.error('[PlayerContext] Failed to seek track', e); // Keep error
      } finally {
        setTimeout(() => { 
            // console.log('[PlayerContext] Seek finished, resetting isSeeking=false'); // Remove?
            isSeeking.current = false; 
        }, 50); 
      }
    } else {
        // console.log('[PlayerContext] Seek failed: No instance or duration info.'); // Remove?
    }
  };

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        isLoadingTrack, 
        playbackInstance, 
        playbackStatus,
        queue, 
        currentIndex, 
        loadTrack, 
        play,
        pause,
        seek,
        playNext, 
        playPrevious, 
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

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
