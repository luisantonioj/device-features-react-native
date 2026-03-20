import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StatusBar, Modal } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { TravelEntry, RootStackParamList } from '../../types';
import { loadEntries, removeEntry } from '../../storage/entriesStorage';
import { useTheme } from '../../context/ThemeContext';
import EntryItem from '../../components/EntryItem/EntryItem';
import ThemeToggle from '../../components/ThemeToggle/ThemeToggle';
import { styles } from './HomeScreen.styles';

type HomeScreenNavProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavProp>();
  const { colors, mode } = useTheme();
  const insets = useSafeAreaInsets();

  const [entries, setEntries] = useState<TravelEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // New state for modern delete modal
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const fetchEntries = async () => {
        setLoading(true); setError(null);
        try {
          const data = await loadEntries();
          if (active) setEntries(data);
        } catch (e) {
          if (active) setError('Failed to load entries. Please try again.');
        } finally {
          if (active) setLoading(false);
        }
      };
      fetchEntries();
      return () => { active = false; };
    }, [])
  );

  const confirmDelete = async () => {
    if (!entryToDelete) return;
    const success = await removeEntry(entryToDelete);
    if (success) {
      setEntries((prev) => prev.filter((e) => e.id !== entryToDelete));
    } else {
      setError('Failed to remove entry. Please try again.');
    }
    setEntryToDelete(null); // Close modal
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="map-outline" size={80} color={colors.primary} style={{ opacity: 0.5, marginBottom: 16 }} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>No Entries Yet</Text>
        <Text style={[styles.emptySubtitle, { color: colors.text, opacity: 0.6 }]}>
          Start your travel diary by tapping the button below.
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      <View style={[styles.header, { borderBottomColor: mode === 'dark' ? '#333' : '#E5E5E5' }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Travel Diary</Text>
          <Text style={[styles.headerSubtitle, { color: colors.text, opacity: 0.6 }]}>
            {entries.length} {entries.length === 1 ? 'memory' : 'memories'}
          </Text>
        </View>
        <ThemeToggle />
      </View>

      {error && (
        <View style={[styles.errorBanner, { backgroundColor: '#FFE5E5' }]}>
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text, opacity: 0.6 }]}>Loading memories...</Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <EntryItem entry={item} onRemove={(id) => setEntryToDelete(id)} />}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={entries.length === 0 ? styles.flatListEmpty : styles.flatListContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary, shadowColor: colors.primary, bottom: insets.bottom + 20 }]}
        onPress={() => navigation.navigate('AddEntry')}
        activeOpacity={0.8}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.fabText}>Add Entry</Text>
        </View>
      </TouchableOpacity>

      {/* --- MODERN DELETE MODAL --- */}
      <Modal visible={!!entryToDelete} transparent animationType="fade" onRequestClose={() => setEntryToDelete(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            
            <View style={[styles.modalIconCircle, { backgroundColor: mode === 'dark' ? '#4A1515' : '#FFE5E5' }]}>
              <Ionicons name="trash" size={32} color="#D93025" />
            </View>

            <Text style={[styles.modalTitle, { color: colors.text }]}>Delete Memory?</Text>
            <Text style={[styles.modalMessage, { color: colors.text, opacity: 0.7 }]}>
              Are you sure you want to delete this travel entry? This action cannot be undone.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: colors.inputBackground }]} 
                onPress={() => setEntryToDelete(null)}
              >
                <Text style={[styles.modalBtnText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: '#D93025' }]} 
                onPress={confirmDelete}
              >
                <Text style={[styles.modalBtnText, { color: '#FFF' }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
};

export default HomeScreen;