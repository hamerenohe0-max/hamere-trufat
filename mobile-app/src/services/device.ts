import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import { Platform } from 'react-native';

const DEVICE_ID_KEY = 'hamere-device-id';

export async function getDeviceIdentifier() {
  let identifier = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (!identifier) {
    const base = Platform.OS;
    identifier = `${base}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}`;
    await AsyncStorage.setItem(DEVICE_ID_KEY, identifier);
  }
  return identifier;
}

export async function buildDeviceContext() {
  const deviceId = await getDeviceIdentifier();
  let vendorId: string | null = null;

  if (Platform.OS === 'ios' && Application.getIosIdForVendorAsync) {
    try {
      vendorId = await Application.getIosIdForVendorAsync();
    } catch {
      vendorId = null;
    }
  }

  return {
    deviceId: vendorId ?? deviceId,
    deviceName: Device.deviceName ?? 'Unknown Device',
    devicePlatform: `${Device.osName ?? Platform.OS} ${
      Device.osVersion ?? ''
    }`.trim(),
    appVersion:
      Application.nativeApplicationVersion ??
      Application.applicationVersion ??
      'dev',
  };
}


