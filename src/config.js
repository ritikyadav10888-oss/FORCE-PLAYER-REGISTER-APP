import { Platform } from 'react-native';

// Production API URL from Render
// export const API_URL = 'https://force-player-register-app.onrender.com/api';

// Dynamic API URL: localhost for Web, Network IP for Mobile
// Note: We are using the specific Wi-Fi IP to ensure connectivity
const LOCAL_IP = '192.168.1.173';

export const API_URL = Platform.OS === 'web'
    ? 'http://localhost:5000/api'
    : `http://${LOCAL_IP}:5000/api`;

export const RAZORPAY_KEY_ID = 'rzp_test_RumA22x2lbG1jk';
console.log('API Connected to:', API_URL);
