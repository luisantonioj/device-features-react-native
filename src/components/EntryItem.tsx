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
      'Remove Entry',
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
      <Image
        source={{ uri: entry.imageUri }}
        style={styles.image}
        resizeMode="cover"
        accessibilityLabel={`Travel photo at ${entry.address}`}
      />

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.addressRow}>
          <Text style={styles.pinIcon}>📍</Text>
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

      {/* Remove Button */}
      <TouchableOpacity
        style={[styles.removeBtn, { backgroundColor: colors.danger }]}
        onPress={handleRemove}
        accessibilityRole="button"
        accessibilityLabel="Remove this travel entry"
      >
        <Text style={styles.removeBtnText}>✕ Remove</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
    borderWidth: 1,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  image: {
    width: '100%',
    height: 200,
  },
  info: {
    padding: 12,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  pinIcon: {
    fontSize: 14,
    marginRight: 4,
    marginTop: 1,
  },
  address: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    lineHeight: 21,
  },
  date: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 18,
  },
  removeBtn: {
    margin: 12,
    marginTop: 0,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  removeBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default EntryItem;