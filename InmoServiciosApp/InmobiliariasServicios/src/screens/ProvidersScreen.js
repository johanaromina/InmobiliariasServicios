import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, RefreshControl, Dimensions } from 'react-native';
import colors from '../theme/colors';
import PrimaryButton from '../components/PrimaryButton';

const { width } = Dimensions.get('window');

const MOCK_PROVIDERS = [
  {
    id: 1,
    name: 'Plomería La Rioja',
    category: 'Plomería',
    rating: 4.8,
    reviews: 156,
    priceRange: '$8,000 - $15,000',
    availability: 'Disponible',
    responseTime: '2 horas',
    location: 'Centro, La Rioja',
    phone: '+54 9 380 123-4567',
    services: ['Reparación de grifos', 'Instalación de cañerías', 'Desobstrucción'],
    image: 'https://via.placeholder.com/300x200?text=Plomeria+La+Rioja',
    verified: true,
    distance: '1.2 km'
  },
  {
    id: 2,
    name: 'Electricidad del Valle',
    category: 'Electricidad',
    rating: 4.6,
    reviews: 89,
    priceRange: '$12,000 - $20,000',
    availability: 'Disponible',
    responseTime: '1 hora',
    location: 'Barrio Norte, La Rioja',
    phone: '+54 9 380 234-5678',
    services: ['Instalación eléctrica', 'Reparación de disyuntores', 'Cableado'],
    image: 'https://via.placeholder.com/300x200?text=Electricidad+del+Valle',
    verified: true,
    distance: '0.8 km'
  },
  {
    id: 3,
    name: 'Limpieza Integral La Rioja',
    category: 'Limpieza',
    rating: 4.9,
    reviews: 203,
    priceRange: '$5,000 - $10,000',
    availability: 'Ocupado',
    responseTime: '4 horas',
    location: 'Villa Sanagasta, La Rioja',
    phone: '+54 9 380 345-6789',
    services: ['Limpieza general', 'Limpieza de tanques', 'Desinfección'],
    image: 'https://via.placeholder.com/300x200?text=Limpieza+Integral+La+Rioja',
    verified: true,
    distance: '2.5 km'
  },
  {
    id: 4,
    name: 'Carpintería del Norte',
    category: 'Carpintería',
    rating: 4.7,
    reviews: 67,
    priceRange: '$15,000 - $25,000',
    availability: 'Disponible',
    responseTime: '6 horas',
    location: 'Chilecito, La Rioja',
    phone: '+54 9 380 456-7890',
    services: ['Reparación de muebles', 'Instalación de puertas', 'Restauración'],
    image: 'https://via.placeholder.com/300x200?text=Carpinteria+del+Norte',
    verified: false,
    distance: '3.1 km'
  },
  {
    id: 5,
    name: 'Pintura del Valle',
    category: 'Pintura',
    rating: 4.5,
    reviews: 134,
    priceRange: '$7,000 - $12,000',
    availability: 'Disponible',
    responseTime: '3 horas',
    location: 'Aimogasta, La Rioja',
    phone: '+54 9 380 567-8901',
    services: ['Pintura interior', 'Pintura exterior', 'Preparación de superficies'],
    image: 'https://via.placeholder.com/300x200?text=Pintura+del+Valle',
    verified: true,
    distance: '1.9 km'
  },
  {
    id: 6,
    name: 'Jardinería Los Llanos',
    category: 'Jardinería',
    rating: 4.4,
    reviews: 78,
    priceRange: '$6,000 - $12,000',
    availability: 'Disponible',
    responseTime: '5 horas',
    location: 'Chamical, La Rioja',
    phone: '+54 9 380 678-9012',
    services: ['Mantenimiento de jardines', 'Poda de árboles', 'Sistemas de riego'],
    image: 'https://via.placeholder.com/300x200?text=Jardineria+Los+Llanos',
    verified: true,
    distance: '4.2 km'
  },
  {
    id: 7,
    name: 'Gas y Calefacción Riojano',
    category: 'Gas',
    rating: 4.8,
    reviews: 95,
    priceRange: '$10,000 - $18,000',
    availability: 'Disponible',
    responseTime: '2 horas',
    location: 'Famatina, La Rioja',
    phone: '+54 9 380 789-0123',
    services: ['Instalación de gas', 'Mantenimiento de calefones', 'Reparación de estufas'],
    image: 'https://via.placeholder.com/300x200?text=Gas+y+Calefaccion+Riojano',
    verified: true,
    distance: '2.8 km'
  }
];

const categories = [
  { key: 'all', label: 'Todos', icon: '🔧' },
  { key: 'plomeria', label: 'Plomería', icon: '🚿' },
  { key: 'electricidad', label: 'Electricidad', icon: '⚡' },
  { key: 'limpieza', label: 'Limpieza', icon: '🧽' },
  { key: 'carpinteria', label: 'Carpintería', icon: '🔨' },
  { key: 'pintura', label: 'Pintura', icon: '🎨' },
  { key: 'jardineria', label: 'Jardinería', icon: '🌱' },
  { key: 'gas', label: 'Gas', icon: '🔥' },
];

export default function ProvidersScreen({ navigation, route }) {
  const [providers, setProviders] = useState(MOCK_PROVIDERS);
  const [filteredProviders, setFilteredProviders] = useState(MOCK_PROVIDERS);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('rating'); // rating, distance, price, name

  const requestId = route.params?.requestId;

  useEffect(() => {
    filterProviders();
  }, [searchQuery, selectedCategory, sortBy, providers]);

  const filterProviders = () => {
    let filtered = [...providers];

    // Filtrar por categoría
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(provider => 
        provider.category.toLowerCase() === selectedCategory
      );
    }

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      filtered = filtered.filter(provider =>
        provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.services.some(service => 
          service.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'distance':
          return parseFloat(a.distance) - parseFloat(b.distance);
        case 'price':
          return a.priceRange.localeCompare(b.priceRange);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredProviders(filtered);
  };

  const loadProviders = async () => {
    try {
      setLoading(true);
      // Aquí harías la llamada real a la API
      // const response = await api.get('/providers');
      // setProviders(response.data);

      // Por ahora usamos datos mock
      setProviders(MOCK_PROVIDERS);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los proveedores');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProviders();
    setRefreshing(false);
  };

  const handleProviderPress = (provider) => {
    navigation.navigate('ProviderDetail', { provider });
  };

  const handleContactProvider = (provider) => {
    Alert.alert(
      'Contactar Proveedor',
      `¿Deseas contactar a ${provider.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Llamar', onPress: () => Alert.alert('Llamar', `Llamando a ${provider.phone}`) },
        { text: 'Enviar Mensaje', onPress: () => Alert.alert('Mensaje', 'Funcionalidad de mensajería próximamente') }
      ]
    );
  };

  const handleBookAppointment = (provider) => {
    if (requestId) {
      navigation.navigate('BookAppointment', { provider, requestId });
    } else {
      navigation.navigate('BookAppointment', { provider });
    }
  };

  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case 'Disponible': return colors.success;
      case 'Ocupado': return colors.warning;
      case 'No disponible': return colors.danger;
      default: return colors.muted;
    }
  };

  const renderProviderCard = ({ item }) => (
    <TouchableOpacity style={styles.providerCard} onPress={() => handleProviderPress(item)}>
      <View style={styles.cardHeader}>
        <View style={styles.providerInfo}>
          <Text style={styles.providerName}>{item.name}</Text>
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryIcon}>
              {categories.find(cat => cat.key === item.category.toLowerCase())?.icon || '🔧'}
            </Text>
            <Text style={styles.categoryText}>{item.category}</Text>
            {item.verified && <Text style={styles.verifiedBadge}>✓</Text>}
          </View>
        </View>
        <View style={[styles.availabilityBadge, { backgroundColor: getAvailabilityColor(item.availability) }]}>
          <Text style={styles.availabilityText}>{item.availability}</Text>
        </View>
      </View>

      <View style={styles.ratingContainer}>
        <Text style={styles.ratingText}>⭐ {item.rating}</Text>
        <Text style={styles.reviewsText}>({item.reviews} reseñas)</Text>
        <Text style={styles.distanceText}>📍 {item.distance}</Text>
      </View>

      <Text style={styles.priceText}>💰 {item.priceRange}</Text>
      <Text style={styles.responseText}>⏱️ Respuesta: {item.responseTime}</Text>

      <View style={styles.servicesContainer}>
        <Text style={styles.servicesTitle}>Servicios:</Text>
        <View style={styles.servicesList}>
          {item.services.slice(0, 3).map((service, index) => (
            <Text key={index} style={styles.serviceTag}>• {service}</Text>
          ))}
          {item.services.length > 3 && (
            <Text style={styles.moreServices}>+{item.services.length - 3} más</Text>
          )}
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.contactButton]}
          onPress={() => handleContactProvider(item)}
        >
          <Text style={styles.actionButtonText}>Contactar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.bookButton]}
          onPress={() => handleBookAppointment(item)}
        >
          <Text style={styles.actionButtonText}>Agendar</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Proveedores de Servicios</Text>
        <Text style={styles.subtitle}>{filteredProviders.length} proveedores encontrados</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar proveedores o servicios..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.muted}
        />
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === item.key && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(item.key)}
            >
              <Text style={styles.categoryButtonIcon}>{item.icon}</Text>
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === item.key && styles.categoryButtonTextActive
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Ordenar por:</Text>
        <View style={styles.sortButtons}>
          {[
            { key: 'rating', label: 'Calificación' },
            { key: 'distance', label: 'Distancia' },
            { key: 'price', label: 'Precio' },
            { key: 'name', label: 'Nombre' }
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.sortButton,
                sortBy === option.key && styles.sortButtonActive
              ]}
              onPress={() => setSortBy(option.key)}
            >
              <Text style={[
                styles.sortButtonText,
                sortBy === option.key && styles.sortButtonTextActive
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Providers List */}
      <FlatList
        data={filteredProviders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProviderCard}
        contentContainerStyle={styles.providersList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔧</Text>
            <Text style={styles.emptyTitle}>No hay proveedores</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery || selectedCategory !== 'all'
                ? 'No se encontraron proveedores con los filtros aplicados'
                : 'No hay proveedores disponibles en este momento'
              }
            </Text>
          </View>
        }
      />
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
    padding: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.card,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.bgSecondary,
  },
  searchContainer: {
    padding: 20,
    paddingTop: 15,
  },
  searchInput: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: colors.text,
  },
  categoriesContainer: {
    backgroundColor: colors.card,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoriesList: {
    paddingHorizontal: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.bgSecondary,
    marginRight: 10,
  },
  categoryButtonActive: {
    backgroundColor: colors.secondary,
  },
  categoryButtonIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: colors.card,
    fontWeight: 'bold',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 15,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sortLabel: {
    fontSize: 16,
    color: colors.text,
    marginRight: 15,
    fontWeight: '600',
  },
  sortButtons: {
    flexDirection: 'row',
    flex: 1,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: colors.bgSecondary,
    marginRight: 8,
  },
  sortButtonActive: {
    backgroundColor: colors.accent,
  },
  sortButtonText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  sortButtonTextActive: {
    color: colors.card,
    fontWeight: 'bold',
  },
  providersList: {
    padding: 20,
    paddingBottom: 100,
  },
  providerCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 8,
  },
  verifiedBadge: {
    fontSize: 12,
    color: colors.success,
    fontWeight: 'bold',
  },
  availabilityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  availabilityText: {
    color: colors.card,
    fontSize: 12,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: 'bold',
    marginRight: 8,
  },
  reviewsText: {
    fontSize: 14,
    color: colors.muted,
    marginRight: 15,
  },
  distanceText: {
    fontSize: 14,
    color: colors.muted,
  },
  priceText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  responseText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  servicesContainer: {
    marginBottom: 15,
  },
  servicesTitle: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 6,
  },
  servicesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  serviceTag: {
    fontSize: 12,
    color: colors.textSecondary,
    marginRight: 8,
    marginBottom: 2,
  },
  moreServices: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: 'bold',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  contactButton: {
    backgroundColor: colors.info,
  },
  bookButton: {
    backgroundColor: colors.primary,
  },
  actionButtonText: {
    color: colors.card,
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 24,
  },
});