// src/screens/HomeScreen.tsx

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { TravelEntry, RootStackParamList } from '../types';
import { loadEntries, removeEntry } from '../storage/entriesStorage';
import { useTheme } from '../context/ThemeContext';
import EntryItem from '../components/EntryItem';
import ThemeToggle from '../components/ThemeToggle';

type HomeScreenNavProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavProp>();
  const { colors, mode } = useTheme();

  const [entries, setEntries] = useState<TravelEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Reload entries every time this screen is focused
  useFocusEffect(
    useCallback(() => {
      let active = true;

      const fetchEntries = async () => {
        setLoading(true);
        setError(null);
        try {
          const data = await loadEntries();
          if (active) setEntries(data);
        } catch (e) {
          if (active) setError('Failed to load entries. Please try again.');
          console.error('[HomeScreen] Error loading entries:', e);
        } finally {
          if (active) setLoading(false);
        }
      };

      fetchEntries();
      return () => {
        active = false;
      };
    }, [])
  );

  const handleRemove = async (id: string) => {
    if (!id) {
      Alert.alert('Error', 'Invalid entry. Please try again.');
      return;
    }
    const success = await removeEntry(id);
    if (success) {
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } else {
      Alert.alert('Error', 'Failed to remove entry. Please try again.');
    }
  };

  const renderItem = ({ item }: { item: TravelEntry }) => (
    <EntryItem entry={item} onRemove={handleRemove} />
  );

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🗺️</Text>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          No Entries Yet
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.subText }]}>
          Start your travel diary by tapping the button below.
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Travel Diary
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.subText }]}>
            {entries.length} {entries.length === 1 ? 'memory' : 'memories'}
          </Text>
        </View>
        <ThemeToggle />
      </View>

      {/* Error banner */}
      {error && (
        <View style={[styles.errorBanner, { backgroundColor: colors.danger }]}>
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      )}

      {/* Loading */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.subText }]}>
            Loading entries...
          </Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={
            entries.length === 0 ? styles.flatListEmpty : styles.flatListContent
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB Add Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('AddEntry')}
        accessibilityRole="button"
        accessibilityLabel="Add a new travel entry"
      >
        <Text style={styles.fabText}>＋ Add Entry</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  errorBanner: {
    margin: 12,
    padding: 12,
    borderRadius: 10,
  },
  errorBannerText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  flatListContent: {
    paddingTop: 8,
    paddingBottom: 100,
  },
  flatListEmpty: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 10,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    alignSelf: 'center',
    paddingHorizontal: 28,
    paddingVertical: 15,
    borderRadius: 30,
    elevation: 6,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  fabText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default HomeScreen;