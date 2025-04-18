import * as SecureStore from 'expo-secure-store';
import { TOKEN_KEYS, AUTH_MESSAGES } from '../constants/auth';

export const tokenStorage = {
  async saveToken(token) {
    try {
      await SecureStore.setItemAsync(TOKEN_KEYS.ACCESS_TOKEN, token);
    } catch (error) {
      console.error('Error saving token:', error);
      throw new Error(AUTH_MESSAGES.SERVER_ERROR);
    }
  },

  async getToken() {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('Error getting token:', error);
      throw new Error(AUTH_MESSAGES.SERVER_ERROR);
    }
  },

  async removeToken() {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('Error removing token:', error);
      throw new Error(AUTH_MESSAGES.SERVER_ERROR);
    }
  },

  async saveUser(user) {
    try {
      await SecureStore.setItemAsync(TOKEN_KEYS.USER_DATA, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user data:', error);
      throw new Error(AUTH_MESSAGES.SERVER_ERROR);
    }
  },

  async getUser() {
    try {
      const userData = await SecureStore.getItemAsync(TOKEN_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      throw new Error(AUTH_MESSAGES.SERVER_ERROR);
    }
  },

  async removeUser() {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEYS.USER_DATA);
    } catch (error) {
      console.error('Error removing user data:', error);
      throw new Error(AUTH_MESSAGES.SERVER_ERROR);
    }
  },

  async clearStorage() {
    try {
      await Promise.all([
        this.removeToken(),
        this.removeUser()
      ]);
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw new Error(AUTH_MESSAGES.SERVER_ERROR);
    }
  }
};
