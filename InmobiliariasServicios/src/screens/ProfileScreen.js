import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Platform } from 'react-native';
import colors from '../theme/colors';
import { useTheme } from '../contexts/ThemeContext';
import PrimaryButton from '../components/PrimaryButton';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { signOut, user } = useAuth();
  const { colors: theme, scale } = useTheme();
  const [userInfo] = useState({
    name: user?.name || user?.nombre || 'Usuario',
    email: user?.email || '—',
    role: user?.role || user?.rol || 'Usuario',
    phone: user?.phone || user?.telefono || '—',
    joinDate: (user?.created_at || '').toString().slice(0, 10) || '—',
  });

  const handleLogout = () => {
    // En web, Alert.alert no soporta botones. Usamos window.confirm
    if (Platform.OS === 'web') {
      const confirmed = typeof window !== 'undefined' && window.confirm('¿Estás seguro de que deseas cerrar sesión?');
      if (confirmed) {
        signOut()
          .then(() => {
            if (typeof window !== 'undefined') window.alert('Sesión cerrada');
          })
          .catch(() => {
          if (typeof window !== 'undefined') window.alert('No se pudo cerrar la sesión');
          });
      }
      return;
    }

    // En iOS/Android usamos Alert nativo con botones
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              Alert.alert('Listo', 'Sesión cerrada');
            } catch (error) {
              Alert.alert('Error', 'No se pudo cerrar la sesión');
            }
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  const menuItems = [
    { id: 1, title: 'Editar Perfil', icon: '✏️', action: handleEditProfile },
    { id: 2, title: 'Cambiar Contraseña', icon: '🔒', action: handleChangePassword },
    { id: 3, title: 'Configuración', icon: '⚙️', action: handleSettings },
    { id: 4, title: 'Ayuda y Soporte', icon: '❓', action: () => Alert.alert('Ayuda', 'Centro de ayuda próximamente disponible') },
    { id: 5, title: 'Acerca de', icon: 'ℹ️', action: () => Alert.alert('Acerca de', 'InmoServiciosApp v1.0.0') },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }] }>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {userInfo.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.userName, { fontSize: scale(24) }]}>{userInfo.name}</Text>
        <Text style={[styles.userEmail, { fontSize: scale(16) }]}>{userInfo.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{userInfo.role}</Text>
        </View>
      </View>

      {/* User Info */}
      <View style={styles.infoContainer}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Información Personal</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📱</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Teléfono</Text>
              <Text style={styles.infoValue}>{userInfo.phone}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📅</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Miembro desde</Text>
              <Text style={styles.infoValue}>{userInfo.joinDate}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Configuración</Text>
        <View style={styles.menuCard}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.action}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: theme.danger || colors.danger }]} onPress={handleLogout}>
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    backgroundColor: colors.primary,
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.card,
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: colors.bgSecondary,
    marginBottom: 10,
  },
  roleBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: {
    color: colors.card,
    fontSize: 14,
    fontWeight: '600',
  },
  infoContainer: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 15,
    width: 24,
    textAlign: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  menuContainer: {
    padding: 20,
    paddingTop: 0,
  },
  menuCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 15,
    width: 24,
    textAlign: 'center',
  },
  menuTitle: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  menuArrow: {
    fontSize: 20,
    color: colors.muted,
  },
  logoutContainer: {
    padding: 20,
    paddingTop: 0,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.danger,
    padding: 16,
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  logoutText: {
    fontSize: 16,
    color: colors.card,
    fontWeight: 'bold',
  },
});
