import React, { createContext, useState, useContext, useEffect } from 'react';
import { tokenStorage } from '../utils/tokenStorage';
import { AUTH_MESSAGES } from '../constants/auth';
import { LOADING_STATES, getLoadingMessage } from '../constants/loading';
import { useToast } from './ToastContext';
import LoadingScreen from '../screens/LoadingScreen';
import { setAuthToken, apiService } from '../utils/api';

export const AuthContext = createContext({
  isAuthenticated: false,
  token: null,
  user: null,
  likedSongIds: new Set(), // Add likedSongIds state
  login: async () => {},
  logout: async () => {},
  likeSong: async (songId) => {}, // Add likeSong function
  unlikeSong: async (songId) => {}, // Add unlikeSong function
  loading: true,
  loadingState: LOADING_STATES.INITIAL
});

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [likedSongIds, setLikedSongIds] = useState(new Set()); // State for liked song IDs
  const [loading, setLoading] = useState(true);
  const [loadingState, setLoadingState] = useState(LOADING_STATES.INITIAL);
  const { showToast } = useToast();

  useEffect(() => {
    checkAuthState();
  }, []);

  // Set/remove auth token whenever token state changes
  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  // Fetch liked songs when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchLikedSongs();
    } else {
      // Clear liked songs if user logs out
      setLikedSongIds(new Set());
    }
  }, [isAuthenticated, token]); // Re-run if auth state changes

  const fetchLikedSongs = async () => {
    console.log('[AuthContext] Fetching liked songs...');
    try {
      const ids = await apiService.user.getLikes(); // Assumes apiService is updated
      setLikedSongIds(new Set(ids));
      console.log(`[AuthContext] Fetched ${ids.length} liked song IDs.`);
    } catch (error) {
      console.error('[AuthContext] Error fetching liked songs:', error);
      // Don't necessarily show a toast for this, could be noisy
      // showToast('error', 'Error', 'Could not fetch liked songs.');
      setLikedSongIds(new Set()); // Reset on error
    }
  };

  const likeSong = async (songId) => {
    if (!isAuthenticated || !songId) return;
    console.log(`[AuthContext] Liking song ${songId}...`);
    try {
      await apiService.user.likeSong(songId); // Assumes apiService is updated
      // Optimistic update: add immediately
      setLikedSongIds(prev => new Set(prev).add(songId));
      console.log(`[AuthContext] Song ${songId} liked (optimistic).`);
      // Optional: show subtle feedback instead of toast
      // showToast('success', 'Liked', 'Song added to your likes.');
    } catch (error) {
      console.error(`[AuthContext] Error liking song ${songId}:`, error);
      showToast('error', 'Error', 'Could not like song.');
      // Revert optimistic update if needed, though unlikely necessary if API handles conflicts
      // fetchLikedSongs(); // Or refetch to be sure
    }
  };

  const unlikeSong = async (songId) => {
    if (!isAuthenticated || !songId) return;
    console.log(`[AuthContext] Unliking song ${songId}...`);
    try {
      await apiService.user.unlikeSong(songId); // Assumes apiService is updated
      // Optimistic update: remove immediately
      setLikedSongIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(songId);
        return newSet;
      });
      console.log(`[AuthContext] Song ${songId} unliked (optimistic).`);
      // Optional: show subtle feedback
      // showToast('info', 'Unliked', 'Song removed from your likes.');
    } catch (error) {
      console.error(`[AuthContext] Error unliking song ${songId}:`, error);
      showToast('error', 'Error', 'Could not unlike song.');
      // Revert optimistic update if needed
      // fetchLikedSongs(); // Or refetch to be sure
    }
  };


  const checkAuthState = async () => {
    setLoadingState(LOADING_STATES.AUTH_CHECK);
    console.log('[AuthContext] Checking auth state...');
    try {
      const [storedToken, storedUser] = await Promise.all([
        tokenStorage.getToken(),
        tokenStorage.getUser()
      ]);
      console.log('[AuthContext] Retrieved from storage:', { storedToken: !!storedToken, storedUser: !!storedUser });

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
        setIsAuthenticated(true);
        // fetchLikedSongs(); // Moved to useEffect based on isAuthenticated
        console.log('[AuthContext] User is authenticated from storage.');
      } else {
         console.log('[AuthContext] No valid token/user found in storage.');
         setUser(null);
         setToken(null);
         setIsAuthenticated(false);
         setLikedSongIds(new Set()); // Clear likes if not authenticated
      }
    } catch (error) {
      console.error('[AuthContext] Error checking auth state:', error);
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      setLikedSongIds(new Set()); // Clear likes on error
      showToast('error', 'Auth Error', AUTH_MESSAGES.SERVER_ERROR);
    } finally {
      setLoadingState(LOADING_STATES.NONE);
      setLoading(false);
      console.log('[AuthContext] Auth check finished.');
    }
  };

  const handleLogin = async (userData, authToken) => {
    setLoadingState(LOADING_STATES.LOGIN);
    console.log('[AuthContext] Attempting login...');
    try {
      await Promise.all([
        tokenStorage.saveToken(authToken),
        tokenStorage.saveUser(userData)
      ]);
      console.log('[AuthContext] Token and user saved to storage.');
      setUser(userData);
      setToken(authToken);
      setIsAuthenticated(true); // This will trigger the useEffect to fetch likes
      console.log('[AuthContext] Login successful, state updated.');
      showToast('success', 'Login Successful', AUTH_MESSAGES.LOGIN_SUCCESS);
    } catch (error) {
      console.error('[AuthContext] Error during login:', error);
      showToast('error', 'Login Error', AUTH_MESSAGES.SERVER_ERROR);
      throw error; // Re-throw for the calling screen
    } finally {
      setLoadingState(LOADING_STATES.NONE);
      console.log('[AuthContext] Login attempt finished.');
    }
  };

  const handleLogout = async () => {
    console.log('[AuthContext] Attempting logout...');
    setLoadingState(LOADING_STATES.LOGOUT);
    try {
      console.log('[AuthContext] Calling simulated API logout...');
      await apiService.auth.logout().catch((apiErr) => {
         console.warn('[AuthContext] Simulated API logout failed (ignored):', apiErr);
      });
      console.log('[AuthContext] Simulated API logout finished.');

      console.log('[AuthContext] Clearing token storage...');
      await tokenStorage.clearStorage();
      console.log('[AuthContext] Token storage cleared successfully.');

      console.log('[AuthContext] Clearing app state (user, token, isAuthenticated, likedSongIds)...');
      setUser(null);
      setToken(null);
      setIsAuthenticated(false); // This will trigger the useEffect to clear likes
      // setLikedSongIds(new Set()); // Also cleared by useEffect
      console.log('[AuthContext] App state cleared.');
      showToast('success', 'Logout Successful', AUTH_MESSAGES.LOGOUT_SUCCESS);
    } catch (error) {
      console.error('[AuthContext] Error during logout:', error);
      showToast('error', 'Logout Error', AUTH_MESSAGES.SERVER_ERROR);
    } finally {
      setLoadingState(LOADING_STATES.NONE);
      console.log('[AuthContext] Logout attempt finished.');
    }
  };

  // Keep the loading screen logic
  if (loading || (loadingState !== LOADING_STATES.NONE && loadingState !== LOADING_STATES.AUTH_CHECK && !isAuthenticated)) {
    return <LoadingScreen message={getLoadingMessage(loadingState)} />;
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        token,
        user,
        likedSongIds, // Provide liked IDs
        login: handleLogin,
        logout: handleLogout,
        likeSong, // Provide like function
        unlikeSong, // Provide unlike function
        loading,
        loadingState
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
