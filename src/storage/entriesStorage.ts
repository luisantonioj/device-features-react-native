// src/storage/entriesStorage.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { TravelEntry } from '../types';

const STORAGE_KEY = '@travel_diary_entries';

/**
 * Load all travel entries from AsyncStorage.
 * Returns an empty array if none exist or on error.
 */
export const loadEntries = async (): Promise<TravelEntry[]> => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (json === null) return [];
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed as TravelEntry[];
  } catch (error) {
    console.error('[Storage] Failed to load entries:', error);
    return [];
  }
};

/**
 * Save (overwrite) the entire entries array to AsyncStorage.
 */
export const saveEntries = async (entries: TravelEntry[]): Promise<boolean> => {
  try {
    if (!Array.isArray(entries)) {
      throw new Error('entries must be an array');
    }
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    return true;
  } catch (error) {
    console.error('[Storage] Failed to save entries:', error);
    return false;
  }
};

/**
 * Append a single new entry to the existing list.
 */
export const addEntry = async (entry: TravelEntry): Promise<boolean> => {
  try {
    const existing = await loadEntries();
    const updated = [entry, ...existing]; // newest first
    return await saveEntries(updated);
  } catch (error) {
    console.error('[Storage] Failed to add entry:', error);
    return false;
  }
};

/**
 * Remove a single entry by id.
 */
export const removeEntry = async (id: string): Promise<boolean> => {
  try {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid entry id');
    }
    const existing = await loadEntries();
    const updated = existing.filter((e) => e.id !== id);
    return await saveEntries(updated);
  } catch (error) {
    console.error('[Storage] Failed to remove entry:', error);
    return false;
  }
};