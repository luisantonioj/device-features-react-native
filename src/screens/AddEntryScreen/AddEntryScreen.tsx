import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator, StatusBar, Modal } from 'react-native';
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

type ModalType = 'none' | 'cancel' | 'confirm' | 'success';

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

  // Modern Modals State
  const [activeModal, setActiveModal] = useState<ModalType>('none');
  const [pendingNavigation, setPendingNavigation] = useState<any>(null); // Stores the back action

  useFocusEffect(
    useCallback(() => { resetForm(); }, [])
  );

  const resetForm = () => {
    setImageUri(null); setAddress(''); setLatitude(null); setLongitude(null);
    setIsFetchingLocation(false); setIsSaving(false); setLocationError(null); setCameraError(null);
    setActiveModal('none');
  };

  // Intercept the back button (hardware & software) if picture is taken
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // Allow navigation if no image, or if we just successfully saved
      if (!imageUri || activeModal === 'success') {
        return; 
      }
      // Prevent default behavior
      e.preventDefault();
      // Save the action they tried to take and show our Cancel Modal
      setPendingNavigation(e.data.action);
      setActiveModal('cancel');
    });
    return unsubscribe;
  }, [navigation, imageUri, activeModal]);

  const takePicture = async () => {
    setCameraError(null);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { setCameraError('Camera access denied.'); return; }
    
    try {
      const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.85 });
      if (result.canceled) return;
      if (result.assets?.[0]?.uri) {
        setImageUri(result.assets[0].uri);
        await fetchCurrentLocation();
      }
    } catch (error) { setCameraError('Error accessing the camera.'); }
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

  const onPreSave = () => {
    if (!imageUri || !address.trim() || latitude === null || longitude === null) return;
    setActiveModal('confirm'); // Trigger Confirmation Modal instead of saving immediately
  };

  const confirmAndSave = async () => {
    setIsSaving(true);
    try {
      const newEntry: TravelEntry = {
        id: generateId(), imageUri: imageUri!, address: address.trim(), latitude: latitude!, longitude: longitude!, createdAt: new Date().toISOString(),
      };
      const success = await addEntry(newEntry);
      if (success) {
        await sendEntrySavedNotification(address.trim());
        setActiveModal('success'); // Trigger Success Modal
      }
    } catch (error) {
       // Silent fail fallback
    } finally { 
      setIsSaving(false); 
    }
  };

  const canSave = !!imageUri && !!address && latitude !== null && longitude !== null;

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
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
        
        {/* Camera Section */}
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

        {/* Location Section */}
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
          style={[styles.saveBtn, { backgroundColor: canSave ? colors.primary : colors.border }]}
          onPress={onPreSave} disabled={!canSave}
        >
          <View style={styles.saveBtnRow}>
            {canSave && <Ionicons name="checkmark-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />}
            <Text style={styles.saveBtnText}>{canSave ? 'Review & Save' : 'Complete Steps Above to Save'}</Text>
          </View>
        </TouchableOpacity>

      </ScrollView>

      {/* --- 1. CANCEL MODAL (Triggered on Back Press) --- */}
      <Modal visible={activeModal === 'cancel'} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <View style={[styles.modalIconCircle, { backgroundColor: mode === 'dark' ? '#5A3A00' : '#FFF0D4' }]}>
              <Ionicons name="warning" size={32} color="#F59E0B" />
            </View>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Discard Memory?</Text>
            <Text style={[styles.modalMessage, { color: colors.text, opacity: 0.7 }]}>
              You have taken a photo. If you leave now, this entry will be permanently lost.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.inputBackground }]} onPress={() => setActiveModal('none')}>
                <Text style={[styles.modalBtnText, { color: colors.text }]}>Keep Editing</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: '#D93025' }]} 
                onPress={() => { setActiveModal('none'); navigation.dispatch(pendingNavigation); }}
              >
                <Text style={[styles.modalBtnText, { color: '#FFF' }]}>Discard</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- 2. CONFIRM MODAL (Triggered on Save Press) --- */}
      <Modal visible={activeModal === 'confirm'} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <View style={[styles.modalIconCircle, { backgroundColor: mode === 'dark' ? '#1A364F' : '#E5F0FA' }]}>
              <Ionicons name="document-text" size={32} color={colors.primary} />
            </View>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Save this Entry?</Text>

            {/* Collected Details */}
            {imageUri && <Image source={{ uri: imageUri }} style={styles.confirmPreviewImage} resizeMode="cover" />}
            <View style={[styles.confirmDetailsBox, { backgroundColor: colors.inputBackground }]}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Ionicons name="location" size={16} color={colors.primary} style={{ marginRight: 6, marginTop: 2 }} />
                <Text style={[styles.confirmAddressText, { color: colors.text, flex: 1 }]} numberOfLines={2}>{address}</Text>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.inputBackground }]} onPress={() => setActiveModal('none')} disabled={isSaving}>
                <Text style={[styles.modalBtnText, { color: colors.text }]}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.primary }]} onPress={confirmAndSave} disabled={isSaving}>
                {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={[styles.modalBtnText, { color: '#FFF' }]}>Confirm</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- 3. SUCCESS MODAL (Triggered after successful save) --- */}
      <Modal visible={activeModal === 'success'} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <View style={[styles.modalIconCircle, { backgroundColor: mode === 'dark' ? '#143A14' : '#E5F6E5' }]}>
              <Ionicons name="checkmark-circle" size={36} color="#10B981" />
            </View>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Awesome!</Text>
            <Text style={[styles.modalMessage, { color: colors.text, opacity: 0.7 }]}>
              Your new travel memory has been safely saved to your diary.
            </Text>
            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.primary, width: '100%' }]} onPress={() => navigation.navigate('Home')}>
              <Text style={[styles.modalBtnText, { color: '#FFF' }]}>Go to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
};

export default AddEntryScreen;