import React from 'react';
import { View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TravelEntry } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { styles } from './EntryItem.styles';

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
        { text: 'Delete', style: 'destructive', onPress: () => onRemove(entry.id) },
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
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: entry.imageUri }}
          style={styles.image}
          resizeMode="cover"
        />
        <TouchableOpacity style={styles.trashIconBtn} onPress={handleRemove}>
          <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <View style={styles.addressRow}>
          <Ionicons name="location" size={18} color={colors.primary} style={styles.pinIcon} />
          <Text style={[styles.address, { color: colors.text }]} numberOfLines={2}>
            {entry.address || 'Unknown location'}
          </Text>
        </View>
        <Text style={[styles.date, { color: colors.subText }]}>{formattedDate}</Text>
      </View>
    </View>
  );
};

export default EntryItem;