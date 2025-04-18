import { Platform } from 'react-native';

// Get your computer's IP address (usually starts with 192.168.x.x or similar)
// Replace this with your actual local IP address
const LOCAL_IP = '192.168.29.103'; // Example IP, replace with your computer's IP

// API Configuration
export const API_BASE_URL = Platform.select({
  // For Android physical device
  android: `http://${LOCAL_IP}:3000/api`,
  // For iOS physical device
  ios: `http://${LOCAL_IP}:3000/api`,
  // For emulators
  native: Platform.OS === 'android' ? 'http://10.0.2.2:3000/api' : 'http://localhost:3000/api',
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

// For debugging
if (__DEV__) {
  console.log('API Base URL:', API_BASE_URL);
}
