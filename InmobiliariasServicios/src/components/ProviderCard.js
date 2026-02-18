import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../theme/colors';

export default function ProviderCard({ item }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.subtitle}>{item.category} • {item.location}</Text>
      <Text style={styles.rating}>⭐ {item.rating?.toFixed(1) || 'N/A'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.border
  },
  title: { fontSize: 16, fontWeight: '700', color: colors.text },
  subtitle: { color: colors.muted, marginTop: 2 },
  rating: { marginTop: 8, fontWeight: '800', color: colors.primary }
});
