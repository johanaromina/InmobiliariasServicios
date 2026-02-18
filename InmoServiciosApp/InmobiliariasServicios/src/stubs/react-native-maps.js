// Stub para react-native-maps en web
// Este archivo reemplaza react-native-maps cuando se ejecuta en web

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Componente MapView stub para web
export const MapView = ({ children, style, ...props }) => {
  return (
    <View style={[styles.mapView, style]}>
      <Text style={styles.mapText}>🗺️ Mapa no disponible en web</Text>
      <Text style={styles.mapSubtext}>Usa la versión móvil para ver el mapa</Text>
      {children}
    </View>
  );
};

// Componente Marker stub
export const Marker = ({ children, ...props }) => {
  return <View>{children}</View>;
};

// Componente Callout stub
export const Callout = ({ children, ...props }) => {
  return <View>{children}</View>;
};

// Exportar como default
const Maps = {
  default: MapView,
  MapView,
  Marker,
  Callout,
};

export default Maps;

const styles = StyleSheet.create({
  mapView: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  mapText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  mapSubtext: {
    fontSize: 14,
    color: '#999',
  },
});

