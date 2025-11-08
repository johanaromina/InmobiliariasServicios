import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { api } from './api';

const TOKEN_KEY = 'auth_token';

// Función para almacenar token que funciona en web y móvil
async function setToken(token) {
  if (Platform.OS === 'web') {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
}

// Función para obtener token que funciona en web y móvil
async function getToken() {
  if (Platform.OS === 'web') {
    return localStorage.getItem(TOKEN_KEY);
  } else {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  }
}

// Función para eliminar token que funciona en web y móvil
async function removeToken() {
  if (Platform.OS === 'web') {
    localStorage.removeItem(TOKEN_KEY);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}

export async function signIn(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  await setToken(data.token);
  api.defaults.headers.common.Authorization = `Bearer ${data.token}`;
  return data.user;
}

export async function signUp(payload) {
  const { data } = await api.post('/auth/register', payload);
  await setToken(data.token);
  api.defaults.headers.common.Authorization = `Bearer ${data.token}`;
  return data.user;
}

export async function signOut() {
  await removeToken();
  delete api.defaults.headers.common.Authorization;
}

export async function loadToken() {
  const token = await getToken();
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  return token;
}
