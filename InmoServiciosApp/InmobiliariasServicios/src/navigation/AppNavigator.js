import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import PropertiesScreen from '../screens/PropertiesScreen';
import AddPropertyScreen from '../screens/AddPropertyScreen';
import MaintenanceScreen from '../screens/MaintenanceScreen';
import ProvidersScreen from '../screens/ProvidersScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MapScreen from '../screens/MapScreen';
import BookAppointmentScreen from '../screens/BookAppointmentScreen';
import RateProviderScreen from '../screens/RateProviderScreen';
import InterventionHistoryScreen from '../screens/InterventionHistoryScreen';
import RecommendationsScreen from '../screens/RecommendationsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import { useAuth } from '../contexts/AuthContext';
import colors from '../theme/colors';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tabs.Navigator screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="Inicio" component={HomeScreen} />
      <Tabs.Screen name="Inmuebles" component={PropertiesScreen} />
      <Tabs.Screen name="Mantenimientos" component={MaintenanceScreen} />
      <Tabs.Screen name="Proveedores" component={ProvidersScreen} />
      <Tabs.Screen name="Mapa" component={MapScreen} />
      <Tabs.Screen name="Historial" component={InterventionHistoryScreen} />
      <Tabs.Screen name="Recomendaciones" component={RecommendationsScreen} />
      <Tabs.Screen name="Perfil" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuth, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    // Usamos una key diferente para resetear el estado de navegación
    <NavigationContainer key={isAuth ? 'auth' : 'guest'}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
            {isAuth ? (
              <>
                <Stack.Screen name="Main" component={MainTabs} />
                <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
                <Stack.Screen name="Settings" component={SettingsScreen} />
                <Stack.Screen name="AddProperty" component={AddPropertyScreen} />
                <Stack.Screen name="EditProperty" component={AddPropertyScreen} />
                <Stack.Screen name="PropertyDetail" component={AddPropertyScreen} />
                <Stack.Screen name="CreateRequest" component={AddPropertyScreen} />
                <Stack.Screen name="RequestDetail" component={AddPropertyScreen} />
                <Stack.Screen name="BookAppointment" component={BookAppointmentScreen} />
                <Stack.Screen name="RateProvider" component={RateProviderScreen} />
                <Stack.Screen name="ProviderDetail" component={AddPropertyScreen} />
                <Stack.Screen name="InterventionDetail" component={AddPropertyScreen} />
                <Stack.Screen name="RecommendationDetail" component={AddPropertyScreen} />
              </>
            ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
});
