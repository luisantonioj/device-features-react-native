import React, { useState, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

import { RootStackParamList, TravelEntry } from '../../types';
import { addEntry } from '../../storage/entriesStorage';
import { sendEntrySavedNotification } from '../../notifications/notificationService';
import { useTheme } from '../../context/ThemeContext';
import ThemeToggle from '../../components/ThemeToggle/ThemeToggle';
import { styles } from './AddEntryScreen.styles';

type AddEntryNavProp = NativeStackNavigationProp<RootStackParamList, 'AddEntry'>;

const generateId = (): string => {
  try { return uuidv4(); } catch { return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`; }
};

const AddEntryScreen: React.FC = () => {
  const navigation = useNavigation<AddEntryNavProp>();
  const { colors, mode } = useTheme();
  const insets = useSafeAreaInsets();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [address, setAddress] = useState<string>('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => { resetForm(); }, [])
  );

  const resetForm = () => {
    setImageUri(null); setAddress(''); setLatitude(null); setLongitude(null);
    setIsFetchingLocation(false); setIsSaving(false); setLocationError(null); setCameraError(null);
  };

  const takePicture = async () => {
    setCameraError(null);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow camera access.', [{ text: 'OK' }]);
      return;
    }
    try {
      const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.85 });
      if (result.canceled) return;
      if (result.assets?.[0]?.uri) {
        setImageUri(result.assets[0].uri);
        await fetchCurrentLocation();
      }
    } catch (error) { setCameraError('An error occurred while accessing the camera.'); }
  };

  const fetchCurrentLocation = async () => {
    setLocationError(null); setIsFetchingLocation(true); setAddress('');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { setLocationError('Location permission denied.'); return; }
      const locationData = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude: lat, longitude: lng } = locationData.coords;
      setLatitude(lat); setLongitude(lng);

      const geocoded = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (!geocoded || geocoded.length === 0) {
        setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        return;
      }
      const place = geocoded[0];
      const parts = [place.name, place.street, place.district, place.city, place.region, place.country].filter(Boolean);
      setAddress(parts.length > 0 ? parts.join(', ') : `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    } catch (error) { setLocationError('Failed to retrieve location.'); } 
    finally { setIsFetchingLocation(false); }
  };

  const handleSave = async () => {
    if (!imageUri || !address.trim() || latitude === null || longitude === null) return;
    setIsSaving(true);
    try {
      const newEntry: TravelEntry = {
        id: generateId(), imageUri, address: address.trim(), latitude, longitude, createdAt: new Date().toISOString(),
      };
      const success = await addEntry(newEntry);
      if (success) {
        await sendEntrySavedNotification(address.trim());
        Alert.alert('Saved! 🎉', 'Your travel entry has been saved.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      } else Alert.alert('Save Failed', 'Could not save your entry.');
    } catch (error) { Alert.alert('Error', 'An unexpected error occurred while saving.'); } 
    finally { setIsSaving(false); }
  };

  const canSave = !!imageUri && !!address && latitude !== null && longitude !== null;

  return (
      <View 
            style={[
              styles.safeArea, 
              { 
                backgroundColor: colors.background,
                paddingTop: insets.top,
                paddingBottom: insets.bottom
              }
            ]}
        >
        <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
          <Text style={[styles.backBtnText, { color: colors.primary }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>New Memory</Text>
        <ThemeToggle />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.titleRow}>
            <Ionicons name="camera-outline" size={20} color={colors.text} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Photo</Text>
          </View>
          {cameraError && <Text style={[styles.errorText, { color: colors.danger }]}>{cameraError}</Text>}
          {imageUri ? (
            <View>
              <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
              <TouchableOpacity style={[styles.secondaryBtn, { borderColor: colors.primary }]} onPress={takePicture}>
                <Ionicons name="refresh-outline" size={18} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={[styles.secondaryBtnText, { color: colors.primary }]}>Retake Photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={[styles.cameraPlaceholder, { borderColor: colors.border, backgroundColor: colors.inputBackground }]} onPress={takePicture}>
              <Ionicons name="camera" size={48} color={colors.subText} style={{ opacity: 0.5 }} />
              <Text style={[styles.cameraPlaceholderText, { color: colors.subText }]}>Tap to take a photo</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.titleRow}>
            <Ionicons name="location-outline" size={20} color={colors.text} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Location</Text>
          </View>
          {locationError && <Text style={[styles.errorText, { color: colors.danger }]}>{locationError}</Text>}
          {isFetchingLocation ? (
            <View style={styles.locationLoading}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.locationLoadingText, { color: colors.subText }]}>Getting your location...</Text>
            </View>
          ) : address ? (
            <View>
              <View style={[styles.addressBox, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                <Text style={[styles.addressText, { color: colors.text }]}>{address}</Text>
              </View>
              <TouchableOpacity style={[styles.secondaryBtn, { borderColor: colors.primary, marginTop: 10 }]} onPress={fetchCurrentLocation}>
                <Ionicons name="refresh-outline" size={18} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={[styles.secondaryBtnText, { color: colors.primary }]}>Refresh Location</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.addressBox, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
              <Text style={[styles.addressPlaceholder, { color: colors.placeholder }]}>
                {imageUri ? 'Address will appear after photo is taken' : 'Take a photo to auto-fetch address'}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: canSave ? colors.primary : colors.border, opacity: isSaving ? 0.7 : 1 }]}
          onPress={handleSave} disabled={isSaving || !canSave}
        >
          {isSaving ? <ActivityIndicator color="#fff" /> : (
            <View style={styles.saveBtnRow}>
              {canSave && <Ionicons name="checkmark-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />}
              <Text style={styles.saveBtnText}>{canSave ? 'Save Entry' : 'Complete Steps Above to Save'}</Text>
            </View>
          )}
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

export default AddEntryScreen;