import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import colors from '../theme/colors';
import { useTheme } from '../contexts/ThemeContext';

export default function PrimaryButton({ title, onPress, loading, disabled }) {
  const { colors: theme } = useTheme();
  return (
    <TouchableOpacity
      style={[
        styles.btn,
        { backgroundColor: theme.primary, borderColor: theme.primaryDark || colors.primaryDark },
        (disabled || loading) && styles.btnDisabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading ? <ActivityIndicator /> : <Text style={[styles.txt, { color: theme.textInverse || colors.textInverse }]}>{title}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginVertical: 8,
    shadowColor: colors.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.primaryDark,
  },
  btnDisabled: {
    opacity: 0.6,
    backgroundColor: colors.divider,
    borderColor: colors.divider,
  },
  txt: {
    color: colors.textInverse,
    fontWeight: '700',
    fontSize: 17,
    letterSpacing: 0.3,
  }
});
