import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import TextField from '../components/TextField';
import PrimaryButton from '../components/PrimaryButton';
import colors from '../theme/colors';
import { signUp } from '../services/auth';

export default function RegisterScreen() {
  const [payload, setPayload] = useState({ name:'Demo', email:'demo@demo.com', password:'123456', role:'inquilino' });
  const [loading, setLoading] = useState(false);

  const onRegister = async () => {
    try {
      setLoading(true);
      await signUp({ ...payload, role: 'inquilino' });
      Alert.alert('¡Bienvenido!', 'Registro exitoso');
    } catch (e) {
      Alert.alert('Error', 'No se pudo registrar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear cuenta</Text>
      <TextField label="Nombre" value={payload.name} onChangeText={(t)=>setPayload({...payload,name:t})} />
      <TextField label="Email" value={payload.email} onChangeText={(t)=>setPayload({...payload,email:t})} autoCapitalize="none" keyboardType="email-address" />
      <TextField label="Contraseña" value={payload.password} onChangeText={(t)=>setPayload({...payload,password:t})} secureTextEntry />
      <PrimaryButton title="Registrarme" onPress={onRegister} loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor: colors.bg, padding: 20, justifyContent:'center' },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 20, color: colors.text }
});
