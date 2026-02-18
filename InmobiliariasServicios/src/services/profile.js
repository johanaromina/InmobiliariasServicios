import { api } from './api';

export async function getCurrentUser() {
  const { data } = await api.get('/auth/me');
  return data.user;
}

export async function updateProfile(payload) {
  const { data } = await api.put('/auth/profile', payload);
  return data.user;
}

export async function changePassword(payload) {
  const { data } = await api.put('/auth/change-password', payload);
  return data;
}

