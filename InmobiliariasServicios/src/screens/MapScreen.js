import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions, ScrollView, Platform } from 'react-native';
import colors from '../theme/colors';
import PrimaryButton from '../components/PrimaryButton';

// Importar react-native-maps de forma condicional
import { MapView, Marker, Callout } from '../utils/mapsLoader';

const { width, height } = Dimensions.get('window');

const MOCK_LOCATIONS = [
  {
    id: 1,
    title: 'Depto 2 amb. - Av. San Nicolás de Bari 123',
    coordinate: { latitude: -29.4131, longitude: -66.8563 },
    type: 'property',
    status: 'Disponible',
    price: 85000,
    rooms: 2,
    bathrooms: 1,
    area: 65,
    image: 'https://via.placeholder.com/300x200?text=Depto+2amb+La+Rioja',
    lastMaintenance: '2024-01-15',
    nextMaintenance: '2024-04-15'
  },
  {
    id: 2,
    title: 'Casa 3 dorm. - Barrio Norte 456',
    coordinate: { latitude: -29.4200, longitude: -66.8500 },
    type: 'property',
    status: 'Alquilado',
    price: 120000,
    rooms: 3,
    bathrooms: 2,
    area: 120,
    image: 'https://via.placeholder.com/300x200?text=Casa+3dorm+La+Rioja',
    lastMaintenance: '2024-01-10',
    nextMaintenance: '2024-07-10'
  },
  {
    id: 3,
    title: 'Oficina comercial - Av. Rivadavia 789',
    coordinate: { latitude: -29.4100, longitude: -66.8600 },
    type: 'property',
    status: 'Mantenimiento',
    price: 95000,
    rooms: 1,
    bathrooms: 1,
    area: 45,
    image: 'https://via.placeholder.com/300x200?text=Oficina+La+Rioja',
    lastMaintenance: '2024-01-05',
    nextMaintenance: '2024-02-05'
  },
  {
    id: 4,
    title: 'Plomería La Rioja',
    coordinate: { latitude: -29.4150, longitude: -66.8550 },
    type: 'provider',
    category: 'Plomería',
    rating: 4.8,
    availability: 'Disponible',
    phone: '+54 9 380 123-4567',
    services: ['Reparación de grifos', 'Instalación de cañerías', 'Desobstrucción'],
    responseTime: '2 horas'
  },
  {
    id: 5,
    title: 'Electricidad del Valle',
    coordinate: { latitude: -29.4080, longitude: -66.8580 },
    type: 'provider',
    category: 'Electricidad',
    rating: 4.6,
    availability: 'Disponible',
    phone: '+54 9 380 234-5678',
    services: ['Instalación eléctrica', 'Reparación de disyuntores', 'Cableado'],
    responseTime: '1 hora'
  },
  {
    id: 6,
    title: 'Limpieza Integral La Rioja',
    coordinate: { latitude: -29.4250, longitude: -66.8450 },
    type: 'provider',
    category: 'Limpieza',
    rating: 4.9,
    availability: 'Ocupado',
    phone: '+54 9 380 345-6789',
    services: ['Limpieza general', 'Limpieza de tanques', 'Desinfección'],
    responseTime: '4 horas'
  },
  {
    id: 7,
    title: 'Casa 4 dorm. - Villa Sanagasta',
    coordinate: { latitude: -29.3500, longitude: -66.8000 },
    type: 'property',
    status: 'Disponible',
    price: 180000,
    rooms: 4,
    bathrooms: 3,
    area: 180,
    image: 'https://via.placeholder.com/300x200?text=Casa+Villa+Sanagasta',
    lastMaintenance: '2024-01-20',
    nextMaintenance: '2024-07-20'
  },
  {
    id: 8,
    title: 'Carpintería del Norte',
    coordinate: { latitude: -29.4000, longitude: -66.8700 },
    type: 'provider',
    category: 'Carpintería',
    rating: 4.7,
    availability: 'Disponible',
    phone: '+54 9 380 456-7890',
    services: ['Reparación de muebles', 'Instalación de puertas', 'Restauración'],
    responseTime: '6 horas'
  }
];

const mapFilters = [
  { key: 'all', label: 'Todo', icon: '🗺️' },
  { key: 'properties', label: 'Propiedades', icon: '🏠' },
  { key: 'providers', label: 'Proveedores', icon: '🔧' },
  { key: 'maintenance', label: 'Mantenimiento', icon: '🔧' },
];

export default function MapScreen({ navigation }) {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapType, setMapType] = useState('standard');
  const [showTraffic, setShowTraffic] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [region, setRegion] = useState({
    latitude: -29.4131,
    longitude: -66.8563,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    // Simular obtención de ubicación del usuario en La Rioja
    setUserLocation({
      latitude: -29.4131,
      longitude: -66.8563,
    });
  }, []);

  const getFilteredLocations = () => {
    switch (selectedFilter) {
      case 'properties':
        return MOCK_LOCATIONS.filter(loc => loc.type === 'property');
      case 'providers':
        return MOCK_LOCATIONS.filter(loc => loc.type === 'provider');
      case 'maintenance':
        return MOCK_LOCATIONS.filter(loc => loc.status === 'Mantenimiento' || loc.availability === 'Ocupado');
      default:
        return MOCK_LOCATIONS;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Disponible': return colors.success;
      case 'Alquilado': return colors.info;
      case 'Mantenimiento': return colors.warning;
      case 'Ocupado': return colors.danger;
      default: return colors.muted;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'property': return '🏠';
      case 'provider': return '🔧';
      default: return '📍';
    }
  };

  const handleLocationPress = (location) => {
    setSelectedLocation(location);
  };

  const handleCallProvider = (provider) => {
    Alert.alert(
      'Contactar Proveedor',
      `¿Deseas llamar a ${provider.title}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Llamar', onPress: () => {
          // Aquí iría la lógica para hacer la llamada
          Alert.alert('Llamada', `Llamando a ${provider.phone}`);
        }}
      ]
    );
  };

  const handleViewProperty = (property) => {
    navigation.navigate('PropertyDetail', { property });
  };

  const handleBookAppointment = (provider) => {
    navigation.navigate('BookAppointment', { provider });
  };

  const renderLocationCard = (location) => (
    <TouchableOpacity
      key={location.id}
      style={styles.locationCard}
      onPress={() => handleLocationPress(location)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.locationIcon}>{getTypeIcon(location.type)}</Text>
        <View style={styles.cardInfo}>
          <Text style={styles.locationTitle} numberOfLines={1}>{location.title}</Text>
          <Text style={styles.locationSubtitle}>
            {location.type === 'property' 
              ? `${location.rooms} dorm. • ${location.bathrooms} baños • ${location.area}m²`
              : `${location.category} • ${location.rating}⭐ • ${location.responseTime}`
            }
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(location.status || location.availability) }]}>
          <Text style={styles.statusText}>{location.status || location.availability}</Text>
        </View>
      </View>

      {location.type === 'property' && (
        <View style={styles.propertyDetails}>
          <Text style={styles.price}>${location.price?.toLocaleString()}/mes</Text>
          <Text style={styles.address}>
            📍 {location.coordinate.latitude.toFixed(4)}, {location.coordinate.longitude.toFixed(4)}
          </Text>
        </View>
      )}

      {location.type === 'provider' && (
        <View style={styles.providerDetails}>
          <Text style={styles.phone}>📞 {location.phone}</Text>
          <Text style={styles.services}>
            {location.services?.slice(0, 2).join(' • ')}
          </Text>
        </View>
      )}

      <View style={styles.cardActions}>
        {location.type === 'property' ? (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleViewProperty(location)}
          >
            <Text style={styles.actionButtonText}>Ver Detalles</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.providerActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.callButton]}
              onPress={() => handleCallProvider(location)}
            >
              <Text style={styles.actionButtonText}>Llamar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.bookButton]}
              onPress={() => handleBookAppointment(location)}
            >
              <Text style={styles.actionButtonText}>Reservar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderWebMap = () => (
    <View style={styles.webMapContainer}>
      <View style={styles.mapHeader}>
        <Text style={styles.mapTitle}>📍 Ubicaciones en La Rioja</Text>
        <Text style={styles.mapSubtitle}>
          {getFilteredLocations().length} ubicaciones encontradas
        </Text>
      </View>
      
      <ScrollView style={styles.locationsList} showsVerticalScrollIndicator={false}>
        {getFilteredLocations().map(renderLocationCard)}
      </ScrollView>
    </View>
  );

  const renderMobileMap = () => {
    if (!MapView) {
      // Fallback si no hay MapView disponible
      return renderWebMap();
    }

    return (
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={region}
          mapType={mapType}
          showsUserLocation={true}
          showsMyLocationButton={true}
          showsTraffic={showTraffic}
          onRegionChangeComplete={setRegion}
        >
          {getFilteredLocations().map((location) => (
            <Marker
              key={location.id}
              coordinate={location.coordinate}
              title={location.title}
              description={location.type === 'property' 
                ? `$${location.price?.toLocaleString()}/mes` 
                : `${location.category} • ${location.rating}⭐`
              }
              onPress={() => handleLocationPress(location)}
            >
              <View style={[styles.marker, { backgroundColor: getStatusColor(location.status || location.availability) }]}>
                <Text style={styles.markerText}>{getTypeIcon(location.type)}</Text>
              </View>
              <Callout>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle}>{location.title}</Text>
                  <Text style={styles.calloutSubtitle}>
                    {location.type === 'property' 
                      ? `$${location.price?.toLocaleString()}/mes`
                      : `${location.category} • ${location.rating}⭐`
                    }
                  </Text>
                  {location.type === 'provider' && (
                    <TouchableOpacity
                      style={styles.calloutButton}
                      onPress={() => handleCallProvider(location)}
                    >
                      <Text style={styles.calloutButtonText}>Llamar</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mapa de Ubicaciones</Text>
        <Text style={styles.subtitle}>Propiedades y proveedores en La Rioja</Text>
      </View>

      {/* Filtros */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersList}
      >
        {mapFilters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              selectedFilter === filter.key && styles.filterButtonActive
            ]}
            onPress={() => setSelectedFilter(filter.key)}
          >
            <Text style={styles.filterIcon}>{filter.icon}</Text>
            <Text style={[
              styles.filterText,
              selectedFilter === filter.key && styles.filterTextActive
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Controles del mapa - Solo en móvil */}
      {Platform.OS !== 'web' && (
        <View style={styles.mapControls}>
          <TouchableOpacity
            style={[styles.controlButton, mapType === 'standard' && styles.controlButtonActive]}
            onPress={() => setMapType('standard')}
          >
            <Text style={styles.controlText}>Estándar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.controlButton, mapType === 'satellite' && styles.controlButtonActive]}
            onPress={() => setMapType('satellite')}
          >
            <Text style={styles.controlText}>Satélite</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.controlButton, showTraffic && styles.controlButtonActive]}
            onPress={() => setShowTraffic(!showTraffic)}
          >
            <Text style={styles.controlText}>Tráfico</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Mapa o lista según plataforma */}
      {Platform.OS === 'web' ? renderWebMap() : renderMobileMap()}

      {/* Información de ubicación seleccionada */}
      {selectedLocation && (
        <View style={styles.selectedLocationCard}>
          <Text style={styles.selectedTitle}>{selectedLocation.title}</Text>
          <Text style={styles.selectedSubtitle}>
            {selectedLocation.type === 'property' 
              ? `$${selectedLocation.price?.toLocaleString()}/mes • ${selectedLocation.rooms} dorm. • ${selectedLocation.area}m²`
              : `${selectedLocation.category} • ${selectedLocation.rating}⭐ • ${selectedLocation.responseTime}`
            }
          </Text>
          <Text style={styles.selectedCoordinates}>
            📍 {selectedLocation.coordinate.latitude.toFixed(4)}, {selectedLocation.coordinate.longitude.toFixed(4)}
          </Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedLocation(null)}
          >
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    backgroundColor: colors.primary,
    padding: 15,
    paddingTop: 50,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.card,
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 14,
    color: colors.bgSecondary,
  },
  filtersContainer: {
    backgroundColor: colors.card,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filtersList: {
    paddingHorizontal: 15,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: colors.bgSecondary,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: colors.secondary,
  },
  filterIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  filterText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: colors.card,
    fontWeight: 'bold',
  },
  mapControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 6,
    backgroundColor: colors.bgSecondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  controlButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.card,
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  controlButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.accent,
  },
  controlText: {
    fontSize: 10,
    color: colors.text,
    fontWeight: '500',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  webMapContainer: {
    flex: 1,
  },
  mapHeader: {
    padding: 20,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  mapTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  mapSubtitle: {
    fontSize: 14,
    color: colors.muted,
  },
  locationsList: {
    flex: 1,
    padding: 20,
  },
  locationCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  locationSubtitle: {
    fontSize: 14,
    color: colors.muted,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: colors.card,
    fontSize: 12,
    fontWeight: 'bold',
  },
  propertyDetails: {
    marginBottom: 12,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  address: {
    fontSize: 12,
    color: colors.muted,
  },
  providerDetails: {
    marginBottom: 12,
  },
  phone: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  services: {
    fontSize: 12,
    color: colors.muted,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.primary,
  },
  actionButtonText: {
    color: colors.card,
    fontSize: 12,
    fontWeight: 'bold',
  },
  providerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  callButton: {
    backgroundColor: colors.success,
  },
  bookButton: {
    backgroundColor: colors.info,
  },
  marker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.card,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  markerText: {
    fontSize: 12,
  },
  callout: {
    width: 180,
    padding: 8,
  },
  calloutTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 3,
  },
  calloutSubtitle: {
    fontSize: 10,
    color: colors.muted,
    marginBottom: 6,
  },
  calloutButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  calloutButtonText: {
    color: colors.card,
    fontSize: 10,
    fontWeight: 'bold',
  },
  selectedLocationCard: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    right: 15,
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  selectedTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 3,
  },
  selectedSubtitle: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 3,
  },
  selectedCoordinates: {
    fontSize: 10,
    color: colors.muted,
    marginBottom: 8,
  },
  closeButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: colors.muted,
  },
  closeButtonText: {
    color: colors.card,
    fontSize: 10,
    fontWeight: 'bold',
  },
});