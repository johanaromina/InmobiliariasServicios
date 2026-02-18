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
      <Text style={styles.title}>Iniciar sesión</Text>
      <TextField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextField label="Contraseña" value={password} onChangeText={setPassword} secureTextEntry />
      <PrimaryButton title="Ingresar" onPress={onLogin} loading={loading} />
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>¿No tenés cuenta? Crear una</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.bg, 
    padding: 20, 
    justifyContent: 'center',
    background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.bgSecondary} 100%)`
  },
  title: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    marginBottom: 30, 
    color: colors.text,
    textAlign: 'center',
    textShadowColor: colors.shadow,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  link: { 
    textAlign: 'center', 
    color: colors.primary, 
    marginTop: 20, 
    fontWeight: '600',
    fontSize: 16,
    textDecorationLine: 'underline'
  }
});
