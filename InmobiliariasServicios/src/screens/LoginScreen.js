import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import TextField from '../components/TextField';
import PrimaryButton from '../components/PrimaryButton';
import colors from '../theme/colors';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('demo@demo.com');
  const [password, setPassword] = useState('123456');
  const { signIn, loading } = useAuth();

  const onLogin = async () => {
    try {
      await signIn(email.trim(), password);
      Alert.alert('¡Listo!', 'Sesión iniciada');
    } catch (e) {
      Alert.alert('Error de acceso', 'Revisa tus credenciales.');
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
        <Text style={styles.title}>Iniciar sesión</Text>
        <Text style={styles.subtitle}>Gestioná tus inmuebles y servicios en un solo lugar</Text>
        <TextField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <TextField label="Contraseña" value={password} onChangeText={setPassword} secureTextEntry />
        <PrimaryButton title="Ingresar" onPress={onLogin} loading={loading} />
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>¿No tenés cuenta? Crear una</Text>
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
  title: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    marginBottom: 8, 
    color: colors.text,
    textAlign: 'center',
    textShadowColor: colors.shadow,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    textAlign: 'center',
    color: '#6A5A4A',
    marginBottom: 16
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
  link: { 
    textAlign: 'center', 
    color: colors.primary, 
    marginTop: 16, 
    fontWeight: '600',
    fontSize: 16,
    textDecorationLine: 'underline'
  }
});
