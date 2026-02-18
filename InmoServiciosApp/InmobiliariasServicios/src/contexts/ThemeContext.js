import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import baseColors from '../theme/colors';
import { Platform, Appearance, View, StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const ThemeContext = createContext(null);

const STORAGE_KEY = 'user_preferences';

const defaultPrefs = {
  theme: 'light', // 'light' | 'dark'
  primaryColor: baseColors.primary,
  fontScale: 1,
  reducedMotion: false,
  notifications: true,
  language: 'es',
  brightness: 1, // 0.7 a 1.3 (emulado con overlay)
};

async function loadLocalPrefs() {
  if (Platform.OS === 'web') {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  }
  const raw = await SecureStore.getItemAsync(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

async function saveLocalPrefs(prefs) {
  const raw = JSON.stringify(prefs);
  if (Platform.OS === 'web') {
    localStorage.setItem(STORAGE_KEY, raw);
  } else {
    await SecureStore.setItemAsync(STORAGE_KEY, raw);
  }
}

export function ThemeProvider({ children }) {
  const { isAuth } = useAuth();
  const [prefs, setPrefs] = useState(defaultPrefs);

  // Load from backend/local
  useEffect(() => {
    const load = async () => {
      try {
        if (isAuth) {
          const { data } = await api.get('/auth/me'); // ensure token
          // try preferences
          const res = await api.get('/preferences');
          setPrefs({ ...defaultPrefs, ...(res.data?.preferences || {}) });
          await saveLocalPrefs(res.data?.preferences || {});
        } else {
          const local = await loadLocalPrefs();
          if (local) setPrefs({ ...defaultPrefs, ...local });
        }
      } catch {
        const local = await loadLocalPrefs();
        if (local) setPrefs({ ...defaultPrefs, ...local });
      }
    };
    load();
  }, [isAuth]);

  const setAndPersist = async (next) => {
    const nextPrefs = { ...prefs, ...next };
    setPrefs(nextPrefs);
    try {
      if (isAuth) await api.put('/preferences', nextPrefs);
    } catch {}
    await saveLocalPrefs(nextPrefs);
  };

  const systemScheme = Appearance?.getColorScheme?.() || 'light';
  const scheme = prefs.theme === 'auto' ? systemScheme : prefs.theme;

  const colors = useMemo(() => {
    const c = { ...baseColors };
    c.primary = prefs.primaryColor || baseColors.primary;
    if (scheme === 'dark') {
      c.bg = '#121212';
      c.bgSecondary = '#1E1E1E';
      c.card = '#1A1A1A';
      c.text = '#EAEAEA';
      c.textSecondary = '#C7C7C7';
      c.muted = '#A0A0A0';
      c.divider = '#2C2C2C';
      c.shadow = 'rgba(0,0,0,0.4)';
    }
    return c;
  }, [prefs.primaryColor, scheme]);

  const scale = (size) => Math.round(size * (prefs.fontScale || 1));

  const value = {
    prefs,
    colors,
    scale,
    setPreferences: setAndPersist,
  };

  // Overlay para emular brillo en web/móvil sin API nativa
  const overlayStyle = useMemo(() => {
    const b = prefs.brightness ?? 1;
    if (b === 1) return null;
    if (b < 1) {
      return { backgroundColor: `rgba(0,0,0,${(1 - b).toFixed(2)})` };
    }
    // brillo alto: capa blanca suave
    return { backgroundColor: `rgba(255,255,255,${Math.min((b - 1) * 0.6, 0.6).toFixed(2)})` };
  }, [prefs.brightness]);

  return (
    <ThemeContext.Provider value={value}>
      <React.Fragment>
        {children}
        {overlayStyle && (
          Platform.OS === 'web' ? (
            // Web permite un overlay fijo con div para cubrir todo
            <div style={{ position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, pointerEvents: 'none', ...overlayStyle }} />
          ) : (
            <View pointerEvents="none" style={[styles.overlay, overlayStyle]} />
          )
        )}
      </React.Fragment>
    </ThemeContext.Provider>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
});

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme debe usarse dentro de ThemeProvider');
  return ctx;
}
