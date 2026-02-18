import React from 'react';
import { TextInput, View, Text, StyleSheet } from 'react-native';
import colors from '../theme/colors';

export default function TextField({ label, ...props }) {
  return (
    <View style={{ marginBottom: 12 }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.muted}
        style={styles.input}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: 6,
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.divider,
    fontSize: 16,
    color: colors.text,
  }
});
