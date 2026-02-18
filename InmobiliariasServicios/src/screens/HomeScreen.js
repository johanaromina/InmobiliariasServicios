import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert, Platform } from 'react-native';
import colors from '../theme/colors';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

const withAlpha = (hex, alpha = '26') => {
  if (!hex || typeof hex !== 'string') {
    return hex;
  }
  return `${hex}${alpha}`;
};

export default function HomeScreen({ navigation }) {
  const { colors: theme, scale } = useTheme();
  const [showMenu, setShowMenu] = useState(false);
  const { signOut } = useAuth();

  const isLargeScreen = width >= 768;

  const quickActions = [
    { id: 1, title: 'Publicar Propiedad', icon: '🏠', color: colors.primary, action: 'addProperty' },
    { id: 2, title: 'Registrar Solicitud', icon: '🔧', color: colors.secondary, action: 'createRequest' },
    { id: 3, title: 'Buscar Proveedor', icon: '👷', color: colors.accent, action: 'providers' },
    { id: 4, title: 'Ver Inmuebles', icon: '📋', color: colors.info, action: 'properties' },
    { id: 5, title: 'Mantenimientos', icon: '⚙️', color: colors.warning, action: 'maintenance' },
    { id: 6, title: 'Reportes', icon: '📊', color: colors.danger, action: 'reports' }
  ];

  const stats = [
    { label: 'Propiedades Activas', value: '12', color: colors.success },
    { label: 'Solicitudes Pendientes', value: '5', color: colors.warning },
    { label: 'Proveedores Disponibles', value: '8', color: colors.info }
  ];

  const handleQuickAction = (action) => {
    switch (action) {
      case 'addProperty':
        navigation.navigate('AddProperty');
        break;
      case 'createRequest':
        navigation.navigate('CreateRequest');
        break;
      case 'providers':
        navigation.navigate('Proveedores');
        break;
      case 'properties':
        navigation.navigate('Inmuebles');
        break;
      case 'maintenance':
        navigation.navigate('Mantenimientos');
        break;
      case 'reports':
        Alert.alert('Reportes', 'Funcionalidad de reportes próximamente disponible');
        break;
      default:
        break;
    }
  };

  const handleLogout = () => {
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

  const menuOptions = [
    { id: 1, title: 'Mi Perfil', icon: '👤', action: () => navigation.navigate('Perfil') },
    { id: 2, title: 'Configuración', icon: '⚙️', action: () => navigation.navigate('Settings') },
    { id: 3, title: 'Ayuda', icon: '❓', action: () => Alert.alert('Ayuda', 'Centro de ayuda próximamente') },
    { id: 4, title: 'Cerrar Sesión', icon: '🚪', action: handleLogout, isDestructive: true },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <Text style={[styles.title, { fontSize: scale(28) }]}>InmoServicios La Rioja</Text>
        <Text style={[styles.subtitle, { fontSize: scale(17) }]}>Gestión de Inmuebles y Servicios en La Rioja</Text>
      </View>

      {/* Estadísticas */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Resumen General</Text>
        <View style={styles.sectionCard}>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <View
                key={index}
                style={[
                  styles.statCard,
                  isLargeScreen && styles.statCardLarge,
                  {
                    borderLeftColor: stat.color,
                  },
                ]}
              >
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Acciones Rápidas */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        <View style={styles.sectionCard}>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[
                  styles.actionCard,
                  isLargeScreen && styles.actionCardLarge,
                  {
                    borderColor: withAlpha(action.color, '55'),
                  },
                ]}
                onPress={() => handleQuickAction(action.action)}
                activeOpacity={0.85}
              >
                <View
                  style={[
                    styles.actionIconWrapper,
                    {
                      backgroundColor: withAlpha(action.color, '1A'),
                      borderColor: withAlpha(action.color, '44'),
                    },
                  ]}
                >
                  <Text style={styles.actionIcon}>{action.icon}</Text>
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Notificaciones Recientes */}
      <View style={styles.notificationsContainer}>
        <Text style={styles.sectionTitle}>Notificaciones Recientes</Text>
        <View style={styles.sectionCard}>
          <View style={styles.notificationCard}>
            <Text style={styles.notificationText}>✅ Nueva solicitud de mantenimiento en Propiedad #123</Text>
            <Text style={styles.notificationTime}>Hace 2 horas</Text>
          </View>
          <View style={styles.notificationCard}>
            <Text style={styles.notificationText}>🔔 Proveedor "Juan Pérez" disponible para plomería</Text>
            <Text style={styles.notificationTime}>Hace 4 horas</Text>
          </View>
          <View style={styles.notificationCard}>
            <Text style={styles.notificationText}>📋 Inspección programada para mañana 10:00 AM</Text>
            <Text style={styles.notificationTime}>Ayer</Text>
          </View>
        </View>
      </View>

      {/* Menu Flotante */}
      {showMenu && (
        <View style={styles.menuOverlay}>
          <TouchableOpacity 
            style={styles.menuBackdrop} 
            onPress={() => setShowMenu(false)}
            activeOpacity={1}
          />
          <View style={styles.menuContainer}>
            <Text style={styles.menuTitle}>Menú</Text>
            {menuOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.menuItem,
                  option.isDestructive && styles.menuItemDestructive
                ]}
                onPress={() => {
                  option.action();
                  setShowMenu(false);
                }}
              >
                <Text style={styles.menuIcon}>{option.icon}</Text>
                <Text style={[
                  styles.menuItemText,
                  option.isDestructive && styles.menuItemTextDestructive
                ]}>
                  {option.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Botón de Menú Flotante */}
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => setShowMenu(true)}
        activeOpacity={0.85}
      >
        <Text style={styles.menuButtonIcon}>☰</Text>
      </TouchableOpacity>
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
    paddingHorizontal: 24,
    paddingVertical: 48,
    paddingTop: 64,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 28,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textInverse,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 17,
    color: colors.highlight,
    letterSpacing: 0.2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  statsContainer: {
    paddingBottom: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  statCard: {
    backgroundColor: colors.card,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: colors.divider,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    width: '48%',
    marginBottom: 16,
  },
  statCardLarge: {
    width: '31%',
  },
  statValue: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  actionsContainer: {
    paddingBottom: 8,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: colors.card,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    width: '48%',
  },
  actionCardLarge: {
    width: '31%',
  },
  actionIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
  },
  actionIcon: {
    fontSize: 26,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 20,
  },
  notificationsContainer: {
    paddingBottom: 40,
  },
  notificationCard: {
    backgroundColor: colors.card,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
    borderWidth: 1,
    borderColor: colors.divider,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  notificationText: {
    fontSize: 15,
    color: colors.text,
    marginBottom: 6,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
  },
  menuContainer: {
    position: 'absolute',
    top: 100,
    right: 20,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    minWidth: 200,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 6,
  },
  menuItemDestructive: {
    backgroundColor: withAlpha(colors.danger, '14'),
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
  menuItemTextDestructive: {
    color: colors.danger,
  },
  menuButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  menuButtonIcon: {
    fontSize: 24,
    color: colors.textInverse,
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: colors.card,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.divider,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
});
