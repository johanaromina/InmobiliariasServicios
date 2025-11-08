import { Platform } from 'react-native';

export const checkNetworkConnectivity = async () => {
  const baseUrls = {
    web: 'http://localhost:3000/api',
    android: 'http://10.0.2.2:3000/api',
    ios: 'http://localhost:3000/api',
  };

  const currentPlatform = Platform.OS;
  const baseUrl = baseUrls[currentPlatform] || baseUrls.web;

  try {
    const response = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      timeout: 5000,
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend conectado:', data);
      return { connected: true, data };
    } else {
      console.log('❌ Backend respondió con error:', response.status);
      return { connected: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    console.log('❌ Error de conexión:', error.message);
    return { connected: false, error: error.message };
  }
};

export const getApiBaseUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:3000/api';
  } else if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000/api';
  } else {
    return 'http://localhost:3000/api';
  }
};
