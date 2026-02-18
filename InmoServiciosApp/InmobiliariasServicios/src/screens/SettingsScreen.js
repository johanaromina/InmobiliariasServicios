import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import colors from '../theme/colors';
import PrimaryButton from '../components/PrimaryButton';
import { useTheme } from '../contexts/ThemeContext';

const palette = ['#B85C1B', '#8C3F14', '#3B7AA5', '#2C8F43', '#C63A2F', '#7C3821'];

export default function SettingsScreen({ navigation }) {
  const { prefs, setPreferences, colors: theme } = useTheme();
  const [local, setLocal] = useState(prefs);

  const save = async () => {
    await setPreferences(local);
    navigation.goBack();
  };

  const fontSizes = useMemo(() => ([
    { label: 'Pequeña', value: 0.9 },
    { label: 'Normal', value: 1 },
    { label: 'Grande', value: 1.15 },
    { label: 'Muy grande', value: 1.3 },
  ]), []);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Text style={[styles.title, { color: theme.text }]}>Configuración</Text>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>Tema</Text>
      <View style={styles.row}>
        {['light', 'dark'].map((opt) => (
          <TouchableOpacity key={opt} style={[styles.chip, local.theme === opt && [styles.chipActive, { borderColor: theme.primary }]]} onPress={() => setLocal({ ...local, theme: opt })}>
            <Text style={[styles.chipText, { color: theme.text }]}>{opt === 'light' ? 'Claro' : 'Oscuro'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>Color principal</Text>
      <View style={styles.palette}>
        {palette.map((c) => (
          <TouchableOpacity key={c} onPress={() => setLocal({ ...local, primaryColor: c })} style={[styles.colorDot, { backgroundColor: c }, local.primaryColor === c && styles.colorDotActive]} />
        ))}
      </View>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>Tamaño de letra</Text>
      <View style={styles.row}>
        {fontSizes.map((fs) => (
          <TouchableOpacity key={fs.value} onPress={() => setLocal({ ...local, fontScale: fs.value })} style={[styles.chip, local.fontScale === fs.value && [styles.chipActive, { borderColor: theme.primary }]]}>
            <Text style={[styles.chipText, { color: theme.text }]}>{fs.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.switchRow}>
        <Text style={[styles.switchLabel, { color: theme.text }]}>Reducir animaciones</Text>
        <Switch value={local.reducedMotion} onValueChange={(v) => setLocal({ ...local, reducedMotion: v })} />
      </View>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Brillo (emulado)</Text>
      <View style={styles.row}>
        {[
          { label: 'Bajo', value: 0.85 },
          { label: 'Medio', value: 1 },
          { label: 'Alto', value: 1.15 },
        ].map((b) => (
          <TouchableOpacity key={b.value} onPress={() => setLocal({ ...local, brightness: b.value })} style={[styles.chip, local.brightness === b.value && [styles.chipActive, { borderColor: theme.primary }]]}>
            <Text style={[styles.chipText, { color: theme.text }]}>{b.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.switchRow}>
        <Text style={[styles.switchLabel, { color: theme.text }]}>Notificaciones</Text>
        <Switch value={local.notifications} onValueChange={(v) => setLocal({ ...local, notifications: v })} />
      </View>

      <PrimaryButton title="Guardar" onPress={save} />
      <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.cancelTxt}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.bg },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: colors.divider, marginRight: 8, marginBottom: 8 },
  chipActive: { backgroundColor: '#ffffff' },
  chipText: { fontSize: 14 },
  palette: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  colorDot: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: '#fff', marginRight: 10 },
  colorDotActive: { borderColor: '#000' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  switchLabel: { fontSize: 16 },
  cancelBtn: { paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginVertical: 6, borderWidth: 1, borderColor: colors.divider, backgroundColor: colors.card },
  cancelTxt: { color: colors.text, fontWeight: '600', fontSize: 16 },
});
