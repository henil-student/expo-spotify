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
    try {
      const [storedToken, storedUser] = await Promise.all([
        tokenStorage.getToken(),
        tokenStorage.getUser()
      ]);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      showToast(AUTH_MESSAGES.SERVER_ERROR);
    } finally {
      setLoadingState(LOADING_STATES.NONE);
      setLoading(false);
    }
  };

  const handleLogin = async (userData, authToken) => {
    setLoadingState(LOADING_STATES.LOGIN);
    try {
      await Promise.all([
        tokenStorage.saveToken(authToken),
        tokenStorage.saveUser(userData)
      ]);
      setUser(userData);
      setToken(authToken);
      setIsAuthenticated(true);
      showToast(AUTH_MESSAGES.LOGIN_SUCCESS);
    } catch (error) {
      console.error('Error during login:', error);
      showToast(AUTH_MESSAGES.SERVER_ERROR);
      throw error;
    } finally {
      setLoadingState(LOADING_STATES.NONE);
    }
  };

  const handleLogout = async () => {
    try {
      setLoadingState(LOADING_STATES.LOGOUT);
      // Call API logout if needed
      await apiService.auth.logout().catch(() => {}); // Optional, continue even if fails
      
      // Clear local storage
      await tokenStorage.clearStorage();
      
      // Clear app state
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      showToast(AUTH_MESSAGES.LOGOUT_SUCCESS);
    } catch (error) {
      console.error('Error during logout:', error);
      showToast(AUTH_MESSAGES.SERVER_ERROR);
    } finally {
      setLoadingState(LOADING_STATES.NONE);
    }
  };

  if (loading || loadingState !== LOADING_STATES.NONE) {
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
