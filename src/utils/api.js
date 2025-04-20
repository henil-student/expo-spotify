import axios from 'axios';
import { Platform } from 'react-native';
import { API_BASE_URL } from '../config/api';
import { AUTH_MESSAGES, AUTH_TIMEOUTS } from '../constants/auth';

// Create axios instance with longer timeout for mobile devices
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: Platform.OS === 'web' ? 10000 : 30000, // Longer timeout for mobile
});

// Add request interceptor for debugging
api.interceptors.request.use(
  config => {
    if (__DEV__) {
      console.log('API Request:', {
        url: config.url,
        method: config.method,
        baseURL: config.baseURL,
        headers: config.headers,
      });
    }
    return config;
  },
  error => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  response => {
    if (__DEV__) {
      console.log('API Response:', {
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },
  error => {
    if (__DEV__) {
      console.error('API Error Details:', {
        message: error.message,
        code: error.code,
        config: error.config,
        response: error.response?.data,
      });
    }

    if (error.code === 'ECONNABORTED') {
      return Promise.reject(AUTH_MESSAGES.CONNECTION_TIMEOUT);
    }

    if (!error.response) {
      return Promise.reject(AUTH_MESSAGES.NETWORK_ERROR);
    }

    return Promise.reject(
      error.response.data?.message || error.message || AUTH_MESSAGES.SERVER_ERROR
    );
  }
);

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const apiService = {
  auth: {
    async login(email, password) {
      try {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    async signup(name, email, password) {
      try {
        const response = await api.post('/auth/signup', {
          name,
          email,
          password
        });
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    async logout() {
      try {
        const response = await api.post('/auth/logout');
        return response.data;
      } catch (error) {
        console.error('Logout error:', error);
        // Don't throw on logout errors
        return { message: AUTH_MESSAGES.LOGOUT_SUCCESS };
      }
    }
  },
  music: {
    async getAllAlbums() {
      try {
        const response = await api.get('/albums');
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    async getAlbumById(id) {
      try {
        const response = await api.get(`/albums/${id}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    async getAllArtists() {
      try {
        const response = await api.get('/artists');
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    async getArtistById(id) {
      try {
        const response = await api.get(`/artists/${id}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    async getAllSongs() {
      try {
        const response = await api.get('/songs');
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    async getPopularSongs() {
      try {
        const response = await api.get('/songs/popular');
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    // Add the search function
    async searchAll(query) {
      if (!query || query.trim() === '') {
        // Avoid sending empty queries
        return { artists: [], albums: [], songs: [] };
      }
      try {
        const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
        return response.data; // Should be { artists: [], albums: [], songs: [] }
      } catch (error) {
        console.error('Search API error:', error);
        throw error; // Re-throw for the component to handle
      }
    }
  }
};

// Export for direct use if needed
export { api };
