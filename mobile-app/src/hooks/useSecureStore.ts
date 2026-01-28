import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Custom hook for secure storage operations that works across platforms
 * Uses SecureStore on native platforms and falls back to AsyncStorage for web
 */
export function useSecureStore() {
  /**
   * Save a value securely
   * @param key The key to store the value under
   * @param value The value to store
   */
  const saveSecureValue = async (key: string, value: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        // For web, we use AsyncStorage with a prefix to identify secure values
        await AsyncStorage.setItem(`secure_${key}`, value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      console.error('Error saving secure value:', error);
      throw error;
    }
  };

  /**
   * Retrieve a securely stored value
   * @param key The key to retrieve
   * @returns The stored value or null if not found
   */
  const getSecureValue = async (key: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        return await AsyncStorage.getItem(`secure_${key}`);
      } else {
        return await SecureStore.getItemAsync(key);
      }
    } catch (error) {
      console.error('Error getting secure value:', error);
      return null;
    }
  };

  /**
   * Delete a securely stored value
   * @param key The key to delete
   */
  const deleteSecureValue = async (key: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.removeItem(`secure_${key}`);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      console.error('Error deleting secure value:', error);
      throw error;
    }
  };

  return {
    saveSecureValue,
    getSecureValue,
    deleteSecureValue
  };
}