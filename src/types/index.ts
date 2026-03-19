// src/types/index.ts

export interface TravelEntry {
  id: string;
  imageUri: string;
  address: string;
  latitude: number;
  longitude: number;
  createdAt: string; // ISO date string
}

export type RootStackParamList = {
  Home: undefined;
  AddEntry: undefined;
};

export interface ThemeColors {
  background: string;
  card: string;
  text: string;
  subText: string;
  border: string;
  primary: string;
  danger: string;
  buttonText: string;
  inputBackground: string;
  placeholder: string;
  shadow: string;
}

export type ThemeMode = 'light' | 'dark';