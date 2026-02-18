import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import TextField from '../components/TextField';
import PrimaryButton from '../components/PrimaryButton';
import colors from '../theme/colors';
import { changePassword } from '../services/profile';

export default function ChangePasswordScreen({ navigation }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    try {
      setLoading(true);
      await changePassword({ currentPassword, newPassword });
      Alert.alert('Listo', 'Contraseña actualizada');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'No se pudo cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cambiar Contraseña</Text>
      <TextField label="Contraseña actual" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry />
      <TextField label="Nueva contraseña" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
      <PrimaryButton title="Guardar" onPress={onSubmit} loading={loading} />
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
