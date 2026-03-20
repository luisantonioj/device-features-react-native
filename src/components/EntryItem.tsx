// src/components/EntryItem.tsx

import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // <-- Import the icons
import { TravelEntry } from '../types';
import { useTheme } from '../context/ThemeContext';

interface EntryItemProps {
  entry: TravelEntry;
  onRemove: (id: string) => void;
}

const EntryItem: React.FC<EntryItemProps> = ({ entry, onRemove }) => {
  const { colors } = useTheme();

  const formattedDate = new Date(entry.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleRemove = () => {
    Alert.alert(
      'Remove Memory',
      'Are you sure you want to delete this travel entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onRemove(entry.id),
        },
      ]
    );
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        },
      ]}
    >
      {/* Photo */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: entry.imageUri }}
          style={styles.image}
          resizeMode="cover"
          accessibilityLabel={`Travel photo at ${entry.address}`}
        />
        
        {/* Absolute Positioned Trash Icon */}
        <TouchableOpacity
          style={styles.trashIconBtn}
          onPress={handleRemove}
          accessibilityRole="button"
          accessibilityLabel="Remove this travel entry"
        >
          <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.addressRow}>
          <Ionicons name="location" size={18} color={colors.primary} style={styles.pinIcon} />
          <Text
            style={[styles.address, { color: colors.text }]}
            numberOfLines={2}
          >
            {entry.address || 'Unknown location'}
          </Text>
        </View>
        <Text style={[styles.date, { color: colors.subText }]}>
          {formattedDate}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 10, // Slightly increased spacing between cards
    overflow: 'hidden',
    borderWidth: 1,
    elevation: 3,
    shadowOffset: { width: 0, height: 4 }, // Softened the shadow
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  imageContainer: {
    position: 'relative', // Allows absolute positioning inside
  },
  image: {
    width: '100%',
    height: 220, // Slightly taller for a more immersive feel
  },
  trashIconBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Dark, semi-transparent circle so it pops on any photo
    width: 36,
    height: 36,
    borderRadius: 18, // Perfect circle
    alignItems: 'center',
    justifyContent: 'center',
    // Optional: add a subtle backdrop blur effect for iOS
  },
  info: {
    padding: 16, // Increased padding for breathing room
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  pinIcon: {
    marginRight: 4,
    marginTop: 2,
  },
  address: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    lineHeight: 22,
  },
  date: {
    fontSize: 13,
    marginTop: 2,
    marginLeft: 22, // Aligned perfectly with the text above
    fontWeight: '500',
  },
});

export default EntryItem;