// src/screens/AddEntryScreen.tsx

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

import { RootStackParamList, TravelEntry } from '../types';
import { addEntry } from '../storage/entriesStorage';
import { sendEntrySavedNotification } from '../notifications/notificationService';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

type AddEntryNavProp = NativeStackNavigationProp<RootStackParamList, 'AddEntry'>;

// Simple UUID fallback if react-native-get-random-values isn't available
const generateId = (): string => {
  try {
    return uuidv4();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
};

const AddEntryScreen: React.FC = () => {
  const navigation = useNavigation<AddEntryNavProp>();
  const { colors, mode } = useTheme();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [address, setAddress] = useState<string>('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Clear form state whenever screen comes into focus (handles back-navigation reset)
  useFocusEffect(
    useCallback(() => {
      resetForm();
    }, [])
  );

  const resetForm = () => {
    setImageUri(null);
    setAddress('');
    setLatitude(null);
    setLongitude(null);
    setIsFetchingLocation(false);
    setIsSaving(false);
    setLocationError(null);
    setCameraError(null);
  };

  // ─── Camera ────────────────────────────────────────────────────────────────

  const requestCameraPermission = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Camera Permission Required',
        'Please allow camera access in your device settings to take photos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const takePicture = async () => {
    setCameraError(null);

    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.85,
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];
      if (!asset?.uri) {
        setCameraError('Failed to capture image. Please try again.');
        return;
      }

      setImageUri(asset.uri);

      // Automatically fetch location after taking the photo
      await fetchCurrentLocation();
    } catch (error) {
      console.error('[AddEntry] Camera error:', error);
      setCameraError('An error occurred while accessing the camera.');
    }
  };

  // ─── Location ──────────────────────────────────────────────────────────────

  const requestLocationPermission = async (): Promise<boolean> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Location Permission Required',
        'Please allow location access to automatically record the address of your entry.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const fetchCurrentLocation = async () => {
    setLocationError(null);
    setIsFetchingLocation(true);
    setAddress('');

    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setLocationError('Location permission denied.');
        return;
      }

      // Get current GPS position
      const locationData = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude: lat, longitude: lng } = locationData.coords;

      if (typeof lat !== 'number' || typeof lng !== 'number') {
        throw new Error('Invalid coordinates received.');
      }

      setLatitude(lat);
      setLongitude(lng);

      // Reverse geocode to get human-readable address
      const geocoded = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lng,
      });

      if (!geocoded || geocoded.length === 0) {
        setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        return;
      }

      const place = geocoded[0];
      const parts = [
        place.name,
        place.street,
        place.district,
        place.city,
        place.region,
        place.country,
      ].filter(Boolean);

      setAddress(parts.length > 0 ? parts.join(', ') : `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    } catch (error) {
      console.error('[AddEntry] Location error:', error);
      setLocationError('Failed to retrieve location. Please try again.');
    } finally {
      setIsFetchingLocation(false);
    }
  };

  // ─── Validation ────────────────────────────────────────────────────────────

  const validateEntry = (): string | null => {
    if (!imageUri) return 'Please take a photo before saving.';
    if (!address.trim()) return 'Address is not yet available. Please wait or retry location.';
    if (latitude === null || longitude === null) return 'Location coordinates are missing.';
    return null;
  };

  // ─── Save ──────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    const validationError = validateEntry();
    if (validationError) {
      Alert.alert('Cannot Save', validationError);
      return;
    }

    setIsSaving(true);

    try {
      const newEntry: TravelEntry = {
        id: generateId(),
        imageUri: imageUri!,
        address: address.trim(),
        latitude: latitude!,
        longitude: longitude!,
        createdAt: new Date().toISOString(),
      };

      const success = await addEntry(newEntry);

      if (!success) {
        Alert.alert('Save Failed', 'Could not save your entry. Please try again.');
        return;
      }

      // Send local push notification
      await sendEntrySavedNotification(address.trim());

      Alert.alert('Saved! 🎉', 'Your travel entry has been saved.', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('[AddEntry] Save error:', error);
      Alert.alert('Error', 'An unexpected error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const canSave = !!imageUri && !!address && latitude !== null && longitude !== null;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.backBtn}
        >
          <Text style={[styles.backBtnText, { color: colors.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>New Entry</Text>
        <ThemeToggle />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Camera Section */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>📷 Photo</Text>

          {cameraError && (
            <Text style={[styles.errorText, { color: colors.danger }]}>{cameraError}</Text>
          )}

          {imageUri ? (
            <View>
              <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
              <TouchableOpacity
                style={[styles.secondaryBtn, { borderColor: colors.primary }]}
                onPress={takePicture}
                accessibilityRole="button"
                accessibilityLabel="Retake photo"
              >
                <Text style={[styles.secondaryBtnText, { color: colors.primary }]}>
                  🔄 Retake Photo
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.cameraPlaceholder, { borderColor: colors.border, backgroundColor: colors.inputBackground }]}
              onPress={takePicture}
              accessibilityRole="button"
              accessibilityLabel="Take a photo"
            >
              <Text style={styles.cameraPlaceholderIcon}>📸</Text>
              <Text style={[styles.cameraPlaceholderText, { color: colors.subText }]}>
                Tap to take a photo
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Location Section */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>📍 Location</Text>

          {locationError && (
            <Text style={[styles.errorText, { color: colors.danger }]}>{locationError}</Text>
          )}

          {isFetchingLocation ? (
            <View style={styles.locationLoading}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.locationLoadingText, { color: colors.subText }]}>
                Getting your location...
              </Text>
            </View>
          ) : address ? (
            <View>
              <View style={[styles.addressBox, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                <Text style={[styles.addressText, { color: colors.text }]}>{address}</Text>
              </View>
              <TouchableOpacity
                style={[styles.secondaryBtn, { borderColor: colors.primary }]}
                onPress={fetchCurrentLocation}
                accessibilityRole="button"
                accessibilityLabel="Refresh location"
              >
                <Text style={[styles.secondaryBtnText, { color: colors.primary }]}>
                  🔄 Refresh Location
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.addressBox, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
              <Text style={[styles.addressPlaceholder, { color: colors.placeholder }]}>
                {imageUri
                  ? 'Address will appear after photo is taken'
                  : 'Take a photo to auto-fetch address'}
              </Text>
            </View>
          )}

          {/* Coordinates display */}
          {latitude !== null && longitude !== null && (
            <Text style={[styles.coordText, { color: colors.subText }]}>
              {latitude.toFixed(5)}, {longitude.toFixed(5)}
            </Text>
          )}
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveBtn,
            {
              backgroundColor: canSave ? colors.primary : colors.border,
              opacity: isSaving ? 0.7 : 1,
            },
          ]}
          onPress={handleSave}
          disabled={isSaving || !canSave}
          accessibilityRole="button"
          accessibilityLabel="Save travel entry"
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>
              {canSave ? '💾 Save Entry' : 'Complete Steps Above to Save'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  backBtn: {
    paddingVertical: 4,
  },
  backBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  section: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '500',
  },
  cameraPlaceholder: {
    height: 180,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cameraPlaceholderIcon: {
    fontSize: 40,
  },
  cameraPlaceholderText: {
    fontSize: 14,
    fontWeight: '500',
  },
  previewImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginBottom: 10,
  },
  secondaryBtn: {
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  locationLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  locationLoadingText: {
    fontSize: 14,
  },
  addressBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 48,
    justifyContent: 'center',
  },
  addressText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  addressPlaceholder: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  coordText: {
    fontSize: 11,
    textAlign: 'right',
    marginTop: -4,
  },
  saveBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default AddEntryScreen;