import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { AUTH_ENDPOINTS, AUTH_MESSAGES, AUTH_TIMEOUTS } from '../constants/auth';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: AUTH_TIMEOUTS.REQUEST_TIMEOUT,
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
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
        const response = await api.post(AUTH_ENDPOINTS.LOGIN, { email, password });
        return response.data;
      } catch (error) {
        if (error.response) {
          throw error.response.data.message || AUTH_MESSAGES.LOGIN_ERROR;
        }
        throw AUTH_MESSAGES.NETWORK_ERROR;
      }
    },

    async signup(name, email, password) {
      try {
        const response = await api.post(AUTH_ENDPOINTS.SIGNUP, {
          name,
          email,
          password
        });
        return response.data;
      } catch (error) {
        if (error.response) {
          if (error.response.status === 400 && error.response.data.message.includes('exists')) {
            throw AUTH_MESSAGES.USER_EXISTS;
          }
          throw error.response.data.message || AUTH_MESSAGES.SIGNUP_ERROR;
        }
        throw AUTH_MESSAGES.NETWORK_ERROR;
      }
    },

    async logout() {
      try {
        const response = await api.post(AUTH_ENDPOINTS.LOGOUT);
        return response.data;
      } catch (error) {
        console.error('Logout error:', error);
        // We don't throw here since logout should succeed even if the API call fails
        return { message: AUTH_MESSAGES.LOGOUT_SUCCESS };
      }
    }
  }
};
