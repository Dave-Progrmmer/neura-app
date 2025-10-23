import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// SecureStore is not available on web, so we need a fallback
const createTokenCache = () => {
  return {
    async getToken(key: string) {
      try {
        if (Platform.OS === 'web') {
          // Use localStorage for web
          return localStorage.getItem(key);
        }
        return await SecureStore.getItemAsync(key);
      } catch (err) {
        console.error('Error getting token:', err);
        return null;
      }
    },
    async saveToken(key: string, value: string) {
      try {
        if (Platform.OS === 'web') {
          // Use localStorage for web
          localStorage.setItem(key, value);
          return;
        }
        return await SecureStore.setItemAsync(key, value);
      } catch (err) {
        console.error('Error saving token:', err);
      }
    },
    async clearToken(key: string) {
      try {
        if (Platform.OS === 'web') {
          // Use localStorage for web
          localStorage.removeItem(key);
          return;
        }
        return await SecureStore.deleteItemAsync(key);
      } catch (err) {
        console.error('Error clearing token:', err);
      }
    },
  };
};

export const tokenCache = createTokenCache();