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
  login: () => {},
  logout: () => {},
  loading: true,
  loadingState: LOADING_STATES.INITIAL
});

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
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
        console.log('[AuthContext] User is authenticated from storage.');
      } else {
         console.log('[AuthContext] No valid token/user found in storage.');
         // Ensure state is cleared if storage is inconsistent
         setUser(null);
         setToken(null);
         setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('[AuthContext] Error checking auth state:', error);
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
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
      setIsAuthenticated(true);
      console.log('[AuthContext] Login successful, state updated.');
      showToast('success', 'Login Successful', AUTH_MESSAGES.LOGIN_SUCCESS); 
    } catch (error) {
      console.error('[AuthContext] Error during login:', error);
      showToast('error', 'Login Error', AUTH_MESSAGES.SERVER_ERROR); 
      // Clear potentially partially saved data on login error? Maybe not needed.
      throw error; // Re-throw for the calling screen
    } finally {
      setLoadingState(LOADING_STATES.NONE);
      console.log('[AuthContext] Login attempt finished.');
    }
  };

  const handleLogout = async () => {
    console.log('[AuthContext] Attempting logout...');
    setLoadingState(LOADING_STATES.LOGOUT); // Set loading state immediately
    try {
      // Call API logout if needed - currently simulated
      console.log('[AuthContext] Calling simulated API logout...');
      await apiService.auth.logout().catch((apiErr) => {
         console.warn('[AuthContext] Simulated API logout failed (ignored):', apiErr);
      }); 
      console.log('[AuthContext] Simulated API logout finished.');
      
      // Clear local storage
      console.log('[AuthContext] Clearing token storage...');
      await tokenStorage.clearStorage();
      console.log('[AuthContext] Token storage cleared successfully.');
      
      // Clear app state
      console.log('[AuthContext] Clearing app state (user, token, isAuthenticated)...');
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      console.log('[AuthContext] App state cleared.');
      showToast('success', 'Logout Successful', AUTH_MESSAGES.LOGOUT_SUCCESS); 
    } catch (error) {
      console.error('[AuthContext] Error during logout:', error);
      // Attempt to clear state even if storage fails? Risky if storage is needed later.
      // Let's log the error and show toast, but state might remain logged in.
      showToast('error', 'Logout Error', AUTH_MESSAGES.SERVER_ERROR); 
      // Consider resetting state here too for robustness?
      // setUser(null);
      // setToken(null);
      // setIsAuthenticated(false);
    } finally {
      setLoadingState(LOADING_STATES.NONE);
      console.log('[AuthContext] Logout attempt finished.');
    }
  };

  // Keep the loading screen logic
  if (loading || (loadingState !== LOADING_STATES.NONE && loadingState !== LOADING_STATES.AUTH_CHECK && !isAuthenticated)) {
     // Show loading screen on initial load, or during login/signup/logout if not already authenticated
     // Avoid showing loading screen during background auth check if user is already authenticated
    return <LoadingScreen message={getLoadingMessage(loadingState)} />;
  }


  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        token,
        user,
        login: handleLogin,
        logout: handleLogout,
        loading, // This is mainly for initial load
        loadingState // This reflects ongoing operations like login/logout
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
