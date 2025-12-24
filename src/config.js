import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getBaseUrl = () => {
    if (Platform.OS === 'web') return 'http://localhost:5000/api';

    // Attempt to get the host IP from Expo Constants (works for Expo Go)
    const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost || Constants.manifest2?.extra?.expoGo?.debuggerHost;

    if (debuggerHost) {
        const ip = debuggerHost.split(':')[0];
        return `http://${ip}:5000/api`;
    }

    // Fallback Manual IP (Found via system check: 192.168.0.102)
    const MANUAL_IP = '192.168.0.102';

    // Fallback for Android
    if (Platform.OS === 'android') {
        return `http://${MANUAL_IP}:5000/api`;
    }

    // Fallback for iOS Simulator / Physical
    return `http://${MANUAL_IP}:5000/api`;
};

export const API_URL = getBaseUrl();
export const RAZORPAY_KEY_ID = 'rzp_test_YOUR_KEY_ID';
console.log('API config:', API_URL);
