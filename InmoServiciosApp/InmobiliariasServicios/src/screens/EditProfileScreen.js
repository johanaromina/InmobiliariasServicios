import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import TextField from '../components/TextField';
import PrimaryButton from '../components/PrimaryButton';
import colors from '../theme/colors';
import { updateProfile } from '../services/profile';
import { useAuth } from '../contexts/AuthContext';

export default function EditProfileScreen({ navigation }) {
  const { user, checkAuth } = useAuth();
  const [name, setName] = useState(user?.name || user?.nombre || '');
  const [phone, setPhone] = useState(user?.phone || user?.telefono || '');
  const [loading, setLoading] = useState(false);

  const onSave = async () => {
    try {
      setLoading(true);
      await updateProfile({ name, phone });
      Alert.alert('Datos actualizados', 'Tu perfil fue guardado.');
      await checkAuth();
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar el perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Perfil</Text>
      <TextField label="Nombre" value={name} onChangeText={setName} />
      <TextField label="Teléfono" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <PrimaryButton title="Guardar" onPress={onSave} loading={loading} />
      <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()} disabled={loading}>
        <Text style={styles.cancelTxt}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 20 },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  cancelBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginVertical: 6,
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.card,
  },
  cancelTxt: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 16,
  },
});
