import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TravelEntry, RootStackParamList } from '../types';
import { loadEntries, removeEntry } from '../storage/entriesStorage';
import { useTheme } from '../context/ThemeContext';
import EntryItem from '../components/EntryItem';
import ThemeToggle from '../components/ThemeToggle';
import { Ionicons } from '@expo/vector-icons';

type HomeScreenNavProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavProp>();
  const { colors, mode } = useTheme();

  const [entries, setEntries] = useState<TravelEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
    if (!id) return;
    const success = await removeEntry(id);
    if (success) {
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } else {
      Alert.alert('Error', 'Failed to remove entry. Please try again.');
    }
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="map-outline" size={80} color={colors.primary} style={{ opacity: 0.5, marginBottom: 16 }} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          No Entries Yet
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.text, opacity: 0.6 }]}>
          Start your travel diary by tapping the button below.
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView 
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['top', 'bottom', 'left', 'right']} 
    >
      <StatusBar
        barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      
      {/* Custom Modern Header */}
      <View style={[styles.header, { borderBottomColor: mode === 'dark' ? '#333' : '#E5E5E5' }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Travel Diary
          </Text>
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
          <Text style={[styles.loadingText, { color: colors.text, opacity: 0.6 }]}>
            Loading memories...
          </Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <EntryItem entry={item} onRemove={handleRemove} />}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={
            entries.length === 0 ? styles.flatListEmpty : styles.flatListContent
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        style={[
          styles.fab, 
          { 
            backgroundColor: colors.primary,
            shadowColor: colors.primary
          }
        ]}
        onPress={() => navigation.navigate('AddEntry')}
        activeOpacity={0.8}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.fabText}>Add Entry</Text>
        </View>
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
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
  },
  errorBanner: {
    margin: 16,
    padding: 12,
    borderRadius: 10,
  },
  errorBannerText: {
    color: '#D93025',
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
    fontSize: 15,
    fontWeight: '500',
  },
  flatListContent: {
    paddingTop: 16,
    paddingBottom: 120, // Prevents the last item from hiding behind the FAB
    paddingHorizontal: 16,
  },
  flatListEmpty: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 72, // Made slightly larger for better empty-state visual
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 30, // Adjusts safely for Android nav bars
    alignSelf: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default HomeScreen;