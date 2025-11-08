import { api } from './api';

export async function getProperties(params = {}) {
  const { data } = await api.get('/properties', { params });
  return data;
}

export async function getProperty(id) {
  const { data } = await api.get(`/properties/${id}`);
  return data;
}

export async function createProperty(payload) {
  const { data } = await api.post('/properties', payload);
  return data;
}

export async function updateProperty(id, payload) {
  const { data } = await api.put(`/properties/${id}`, payload);
  return data;
}

export async function deleteProperty(id) {
  const { data } = await api.delete(`/properties/${id}`);
  return data;
}

export async function addPropertyImage(propertyId, { imageUrl, isPrimary = false }) {
  const { data } = await api.post(`/properties/${propertyId}/images`, {
    image_url: imageUrl,
    is_primary: isPrimary,
  });
  return data;
}
