import axios from 'axios';
import { Platform } from 'react-native';

// Configuración de URL según la plataforma
const getApiBaseUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:3000/api';
  } else if (Platform.OS === 'android') {
    // Para Android AVD (emulador) usar 10.0.2.2
    return 'http://10.0.2.2:3000/api';
  } else {
    // Para iOS o otros
    return 'http://localhost:3000/api';
  }
};

const API_BASE_URL = Platform.OS === 'web'
  ? 'http://localhost:3000/api'
  : (process.env.EXPO_PUBLIC_API_BASE_URL || getApiBaseUrl());

console.log('Platform:', Platform.OS);
console.log('API_BASE_URL:', API_BASE_URL);
console.log('EXPO_PUBLIC_API_BASE_URL:', process.env.EXPO_PUBLIC_API_BASE_URL);

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Log de requests para depurar URL final
api.interceptors.request.use((cfg) => {
  try {
    const method = (cfg.method || 'GET').toUpperCase();
    const fullUrl = `${cfg.baseURL || ''}${cfg.url || ''}`;
    console.log('REQ', method, fullUrl);
  } catch {}
  return cfg;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err?.response?.data?.message || err.message;
    console.warn('API error:', message);
    
    // Manejo específico de errores de red
    if (err.code === 'NETWORK_ERROR' || err.message === 'Network Error') {
      console.error('Error de red: Verifica que el backend esté ejecutándose en', API_BASE_URL);
    }
    
    return Promise.reject(err);
  }
);
