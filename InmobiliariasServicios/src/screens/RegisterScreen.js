import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import TextField from '../components/TextField';
import PrimaryButton from '../components/PrimaryButton';
import colors from '../theme/colors';
import { signUp } from '../services/auth';

export default function RegisterScreen({ navigation }) {
  const [payload, setPayload] = useState({ name:'', email:'', password:'', phone:'', role:'inquilino' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const onRegister = async () => {
    try {
      setLoading(true);
      setStatus({ type: '', message: '' });

      const normalizedPayload = {
        ...payload,
        name: payload.name.trim(),
        email: payload.email.trim(),
        phone: payload.phone.trim(),
      };

      await signUp(normalizedPayload);
      setStatus({ type: 'success', message: 'Usuario creado con éxito.' });
      Alert.alert('Registro exitoso', 'Tu cuenta fue creada correctamente.');
    } catch (e) {
      const apiMessage = e?.response?.data?.message;
      const validationErrors = e?.response?.data?.errors;
      const firstValidationError = Array.isArray(validationErrors) && validationErrors.length > 0
        ? validationErrors[0]?.msg
        : null;
      const errorMessage = firstValidationError || apiMessage || 'No se pudo registrar.';

      console.error('RegisterScreen onRegister error:', {
        message: e?.message,
        status: e?.response?.status,
        data: e?.response?.data
      });

      setStatus({ type: 'error', message: errorMessage });
      Alert.alert('Error en registro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.bgTopBlob} />
      <View style={styles.bgBottomBlob} />

      <View style={styles.card}>
        <View style={styles.logo}>
          <Text style={styles.logoIcon}>INMO</Text>
          <Text style={styles.logoText}>InmoServicios</Text>
        </View>
        <Text style={styles.title}>Crear cuenta</Text>
        <Text style={styles.subtitle}>Registrate como propietario, inquilino o proveedor</Text>
        <TextField label="Nombre" value={payload.name} onChangeText={(t)=>setPayload({...payload,name:t})} />
        <TextField label="Email" value={payload.email} onChangeText={(t)=>setPayload({...payload,email:t})} autoCapitalize="none" keyboardType="email-address" />
        <TextField label="Teléfono" value={payload.phone} onChangeText={(t)=>setPayload({...payload,phone:t})} keyboardType="phone-pad" />
        <TextField label="Contraseña" value={payload.password} onChangeText={(t)=>setPayload({...payload,password:t})} secureTextEntry />
        <Text style={styles.roleLabel}>Tipo de cuenta</Text>
        <View style={styles.roleRow}>
          <TouchableOpacity
            style={[styles.roleOption, payload.role === 'propietario' && styles.roleOptionActive]}
            onPress={() => setPayload({ ...payload, role: 'propietario' })}
          >
            <Text style={[styles.roleOptionText, payload.role === 'propietario' && styles.roleOptionTextActive]}>
              Propietario
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleOption, payload.role === 'inquilino' && styles.roleOptionActive]}
            onPress={() => setPayload({ ...payload, role: 'inquilino' })}
          >
            <Text style={[styles.roleOptionText, payload.role === 'inquilino' && styles.roleOptionTextActive]}>
              Inquilino
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleOption, payload.role === 'proveedor' && styles.roleOptionActive]}
            onPress={() => setPayload({ ...payload, role: 'proveedor' })}
          >
            <Text style={[styles.roleOptionText, payload.role === 'proveedor' && styles.roleOptionTextActive]}>
              Proveedor
            </Text>
          </TouchableOpacity>
        </View>
        <PrimaryButton title="Registrarme" onPress={onRegister} loading={loading} />
        {!!status.message && (
          <Text style={[styles.statusText, status.type === 'error' ? styles.statusError : styles.statusSuccess]}>
            {status.message}
          </Text>
        )}
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.backLink}>Volver al inicio</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2EDE6',
    padding: 20,
    justifyContent: 'center',
    overflow: 'hidden'
  },
  bgTopBlob: {
    position: 'absolute',
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: '#EEC9A7',
    top: -230,
    left: -100,
    opacity: 0.55
  },
  bgBottomBlob: {
    position: 'absolute',
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: '#E2B07E',
    bottom: -200,
    right: -120,
    opacity: 0.35
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.90)',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(181, 112, 46, 0.18)',
    shadowColor: '#8C5A2B',
    shadowOpacity: 0.14,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3
  },
  logo: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    width: 140,
    height: 90,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: '#FFF2E8'
  },
  logoIcon: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
    color: colors.primary
  },
  logoText: {
    marginTop: 4,
    color: colors.primary,
    fontWeight: '800'
  },
  title: { fontSize: 30, fontWeight: '800', marginBottom: 6, color: colors.text, textAlign: 'center' },
  subtitle: { textAlign: 'center', color: '#6A5A4A', marginBottom: 16 },
  roleLabel: { marginBottom: 8, marginTop: 2, fontSize: 14, color: colors.text },
  roleRow: { flexDirection: 'row', gap: 10, marginBottom: 16, flexWrap: 'wrap' },
  roleOption: {
    minWidth: '30%',
    flexGrow: 1,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF'
  },
  roleOptionActive: {
    borderColor: colors.primary,
    backgroundColor: '#FFF2E8'
  },
  roleOptionText: { color: '#555', fontWeight: '600' },
  roleOptionTextActive: { color: colors.primary },
  statusText: {
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '600'
  },
  statusSuccess: {
    color: '#1E7D32'
  },
  statusError: {
    color: '#B42318'
  },
  backLink: {
    textAlign: 'center',
    color: colors.primary,
    marginTop: 14,
    fontWeight: '600',
    textDecorationLine: 'underline'
  }
});
