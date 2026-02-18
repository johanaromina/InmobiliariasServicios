import React, { useState, useMemo, useCallback } from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import PropertyCard from '../components/PropertyCard';
import colors from '../theme/colors';
import { getProperties, deleteProperty } from '../services/properties';

const STATUS_MAPPINGS = {
  available: { key: 'available', label: 'Disponible' },
  disponible: { key: 'available', label: 'Disponible' },
  rented: { key: 'rented', label: 'Alquilado' },
  alquilado: { key: 'rented', label: 'Alquilado' },
  maintenance: { key: 'maintenance', label: 'Mantenimiento' },
  mantenimiento: { key: 'maintenance', label: 'Mantenimiento' },
  'en proceso': { key: 'maintenance', label: 'En proceso' },
  en_proceso: { key: 'maintenance', label: 'En proceso' },
  sold: { key: 'sold', label: 'Vendido' },
  vendido: { key: 'sold', label: 'Vendido' },
};

const PROPERTY_TYPE_LABELS = {
  apartment: 'Departamento',
  departamento: 'Departamento',
  house: 'Casa',
  casa: 'Casa',
  office: 'Oficina',
  oficina: 'Oficina',
  commercial: 'Local',
  local: 'Local',
  land: 'Terreno',
  terreno: 'Terreno',
};

const PUBLICATION_TYPE_LABELS = {
  alquiler: 'Alquiler',
  rent: 'Alquiler',
  renta: 'Alquiler',
  lease: 'Alquiler',
  venta: 'Venta',
  sale: 'Venta',
};

const composeAddress = (property) => {
  if (property.address) return property.address;
  if (property.direccion_completa) return property.direccion_completa;
  const parts = [property.calle, property.numero, property.ciudad, property.provincia]
    .map((part) => (part ? String(part).trim() : ''))
    .filter(Boolean);
  return parts.join(', ') || 'Dirección sin especificar';
};

const normalizeStatus = (statusValue) => {
  if (!statusValue) {
    return { key: 'available', label: 'Disponible' };
  }
  const statusKey = String(statusValue).toLowerCase();
  return STATUS_MAPPINGS[statusKey] || { key: 'available', label: 'Disponible' };
};

const toNumber = (value) => {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }
  const parsed = typeof value === 'string' ? parseFloat(value) : value;
  if (Number.isNaN(parsed)) return undefined;
  return parsed;
};

const normalizeProperty = (property) => {
  const { key: statusKey, label: statusLabel } = normalizeStatus(property.status || property.estado);
  const priceValue = toNumber(property.price ?? property.precio);
  const roomsValue = toNumber(property.rooms ?? property.bedrooms ?? property.ambientes);
  const bathroomsValue = toNumber(property.bathrooms ?? property.banos);
  const areaValue = toNumber(property.area ?? property.area_sqm ?? property.superficie_m2);
  const rawPublicationType = (property.tipo_publicacion || property.publication_type || '').toLowerCase();
  const propertyTypeKey = (property.property_type || property.tipo || '').toLowerCase();
  const typeLabel = PUBLICATION_TYPE_LABELS[rawPublicationType] || PROPERTY_TYPE_LABELS[propertyTypeKey] || 'Propiedad';

  return {
    id: property.id,
    title: property.title || property.titulo || 'Propiedad sin título',
    address: composeAddress(property),
    type: typeLabel,
    price: Number.isFinite(priceValue) ? priceValue : 0,
    rooms: Number.isFinite(roomsValue) ? roomsValue : 0,
    bathrooms: Number.isFinite(bathroomsValue) ? bathroomsValue : 0,
    area: Number.isFinite(areaValue) ? areaValue : 0,
    status: statusLabel,
    statusKey,
    currency: property.moneda || property.currency || 'ARS',
    images: Array.isArray(property.images) ? property.images : [],
    raw: property,
  };
};

const FILTER_OPTIONS = [
  { key: 'all', label: 'Todos' },
  { key: 'available', label: 'Disponibles' },
  { key: 'rented', label: 'Alquilados' },
  { key: 'maintenance', label: 'Mantenimiento' },
];

export default function PropertiesScreen({ navigation }) {
  const route = useRoute();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  const loadProperties = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProperties({ mine: true });
      const list = Array.isArray(data?.properties) ? data.properties : Array.isArray(data) ? data : [];
      setProperties(list.map(normalizeProperty));
    } catch (error) {
      const message = error?.response?.data?.message || 'No se pudieron cargar las propiedades. Verifica tu conexión o el estado del servidor.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProperties();
    }, [loadProperties])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProperties();
    setRefreshing(false);
  }, [loadProperties]);

  React.useEffect(() => {
    if (route.params?.refresh) {
      loadProperties();
    }
  }, [route.params?.refresh, loadProperties]);

  const counts = useMemo(() => {
    return properties.reduce(
      (acc, property) => {
        acc.total += 1;
        if (property.statusKey === 'available') acc.available += 1;
        if (property.statusKey === 'rented') acc.rented += 1;
        if (property.statusKey === 'maintenance') acc.maintenance += 1;
        return acc;
      },
      { total: 0, available: 0, rented: 0, maintenance: 0 }
    );
  }, [properties]);

  const filters = useMemo(() => {
    return FILTER_OPTIONS.map((option) => {
      if (option.key === 'all') return { ...option, count: counts.total };
      return { ...option, count: counts[option.key] };
    });
  }, [counts]);

  const filteredProperties = useMemo(() => {
    if (filter === 'all') return properties;
    return properties.filter((property) => property.statusKey === filter);
  }, [filter, properties]);

  const handleDeleteProperty = useCallback(
    async (property) => {
      try {
        setLoading(true);
        await deleteProperty(property.id);
        setProperties((prev) => prev.filter((item) => item.id !== property.id));
        Alert.alert('Propiedad eliminada', 'La propiedad se eliminó correctamente.');
      } catch (error) {
        const message = error?.response?.data?.message || 'No se pudo eliminar la propiedad.';
        Alert.alert('Error', message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleAddProperty = () => {
    Alert.alert(
      'Agregar Propiedad',
      '¿Qué tipo de propiedad deseas agregar?',
      [
        { text: 'Casa', onPress: () => navigation.navigate('AddProperty', { type: 'casa' }) },
        { text: 'Departamento', onPress: () => navigation.navigate('AddProperty', { type: 'departamento' }) },
        { text: 'Oficina', onPress: () => navigation.navigate('AddProperty', { type: 'oficina' }) },
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
  };

  const handlePropertyPress = (property) => {
    navigation.navigate('PropertyDetail', { property: property.raw || property });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mis Inmuebles</Text>
        <Text style={styles.subtitle}>{filteredProperties.length} propiedades encontradas</Text>
      </View>

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filters}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterButton,
                filter === item.key && styles.filterButtonActive
              ]}
              onPress={() => setFilter(item.key)}
            >
              <Text style={[
                styles.filterText,
                filter === item.key && styles.filterTextActive
              ]}>
                {item.label} ({item.count})
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.filtersList}
        />
      </View>

      {/* Lista de propiedades */}
      <FlatList
        data={filteredProperties}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PropertyCard 
            item={item} 
            onPress={() => handlePropertyPress(item)}
            onEdit={() => navigation.navigate('EditProperty', { property: item.raw || item })}
            onDelete={() => {
              Alert.alert(
                'Eliminar Propiedad',
                '¿Estás seguro de que deseas eliminar esta propiedad?',
                [
                  { text: 'Cancelar', style: 'cancel' },
                  { text: 'Eliminar', style: 'destructive', onPress: () => handleDeleteProperty(item) }
                ]
              );
            }}
          />
        )}
        contentContainerStyle={styles.propertiesList}
        refreshControl={
          <RefreshControl refreshing={refreshing || loading} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🏠</Text>
            <Text style={styles.emptyTitle}>No hay propiedades</Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'all' 
                ? 'Agrega tu primera propiedad para comenzar'
                : 'No hay propiedades con este filtro'
              }
            </Text>
          </View>
        }
      />

      {/* Botón flotante para agregar */}
      <TouchableOpacity style={styles.fab} onPress={handleAddProperty}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
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
  filtersContainer: {
    backgroundColor: colors.card,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filtersList: {
    paddingHorizontal: 20,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.bgSecondary,
    marginRight: 10,
  },
  filterButtonActive: {
    backgroundColor: colors.secondary,
  },
  filterText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: colors.card,
    fontWeight: 'bold',
  },
  propertiesList: {
    padding: 20,
    paddingBottom: 100,
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
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 30,
    color: colors.card,
    fontWeight: 'bold',
  },
});
