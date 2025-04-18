import { Platform } from 'react-native';

// API Configuration
export const API_BASE_URL = Platform.select({
  // For Android Emulator
  android: 'http://10.0.2.2:3000/api',
  // For iOS Simulator
  ios: 'http://localhost:3000/api',
  // For web
  default: 'http://localhost:3000/api'
});

// API Versions
export const API_VERSION = 'v1';

// Timeout configurations
export const REQUEST_TIMEOUT = 10000; // 10 seconds

// Headers
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

// Endpoints
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    LOGOUT: '/auth/logout'
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE: '/user/update'
  }
};
