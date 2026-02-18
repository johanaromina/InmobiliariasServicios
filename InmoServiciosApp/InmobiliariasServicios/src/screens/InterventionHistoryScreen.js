import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl, Dimensions } from 'react-native';
import colors from '../theme/colors';
import PrimaryButton from '../components/PrimaryButton';

const { width } = Dimensions.get('window');

const MOCK_INTERVENTIONS = [
  {
    id: 1,
    property: 'Depto 2 amb. - Av. San Nicolás de Bari 123',
    provider: 'Plomería La Rioja',
    category: 'Plomería',
    title: 'Reparación de grifo principal',
    description: 'Reparación completa del grifo de la cocina que tenía fuga constante',
    status: 'Completada',
    priority: 'Alta',
    startDate: '2024-01-15',
    endDate: '2024-01-15',
    duration: 120, // minutos
    cost: 12000,
    rating: 4.8,
    images: ['https://via.placeholder.com/300x200?text=Antes', 'https://via.placeholder.com/300x200?text=Despues'],
    materials: ['Grifo nuevo', 'Juntas', 'Cinta teflón'],
    notes: 'Trabajo realizado correctamente, sin inconvenientes',
    technician: 'Carlos López',
    phone: '+54 9 380 123-4567',
    warranty: 90, // días
    nextMaintenance: '2024-04-15'
  },
  {
    id: 2,
    property: 'Casa 3 dorm. - Barrio Norte 456',
    provider: 'Electricidad del Valle',
    category: 'Electricidad',
    title: 'Cambio de disyuntor principal',
    description: 'Reemplazo del disyuntor principal que se disparaba constantemente',
    status: 'Completada',
    priority: 'Media',
    startDate: '2024-01-10',
    endDate: '2024-01-12',
    duration: 180,
    cost: 18000,
    rating: 4.6,
    images: ['https://via.placeholder.com/300x200?text=Disyuntor+Antes', 'https://via.placeholder.com/300x200?text=Disyuntor+Nuevo'],
    materials: ['Disyuntor 25A', 'Cables', 'Terminales'],
    notes: 'Se realizó prueba de funcionamiento, todo correcto',
    technician: 'Ana Pérez',
    phone: '+54 9 380 234-5678',
    warranty: 180,
    nextMaintenance: '2024-07-12'
  },
  {
    id: 3,
    property: 'Oficina comercial - Av. Rivadavia 789',
    provider: 'Limpieza Integral La Rioja',
    category: 'Limpieza',
    title: 'Limpieza y desinfección de tanque',
    description: 'Limpieza completa y desinfección del tanque de agua del edificio',
    status: 'Completada',
    priority: 'Baja',
    startDate: '2024-01-05',
    endDate: '2024-01-05',
    duration: 240,
    cost: 6000,
    rating: 4.9,
    images: ['https://via.placeholder.com/300x200?text=Tanque+Antes', 'https://via.placeholder.com/300x200?text=Tanque+Limpio'],
    materials: ['Desinfectante', 'Cepillos', 'Guantes'],
    notes: 'Tanque completamente limpio y desinfectado',
    technician: 'María González',
    phone: '+54 9 380 345-6789',
    warranty: 30,
    nextMaintenance: '2024-02-05'
  },
  {
    id: 4,
    property: 'Depto 2 amb. - Av. San Nicolás de Bari 123',
    provider: 'Carpintería del Norte',
    category: 'Carpintería',
    title: 'Reparación de persianas',
    description: 'Reparación de las persianas del living que no subían correctamente',
    status: 'En Progreso',
    priority: 'Baja',
    startDate: '2024-01-18',
    endDate: null,
    duration: 90,
    cost: 8000,
    rating: null,
    images: ['https://via.placeholder.com/300x200?text=Persianas+Dañadas'],
    materials: ['Cuerdas', 'Poleas', 'Tornillos'],
    notes: 'Trabajo en progreso, se completará mañana',
    technician: 'Roberto Silva',
    phone: '+54 9 380 456-7890',
    warranty: 60,
    nextMaintenance: null
  },
  {
    id: 5,
    property: 'Casa 4 dorm. - Villa Sanagasta',
    provider: 'Jardinería Los Llanos',
    category: 'Jardinería',
    title: 'Mantenimiento de jardín',
    description: 'Poda de árboles y mantenimiento del sistema de riego',
    status: 'Completada',
    priority: 'Media',
    startDate: '2024-01-20',
    endDate: '2024-01-22',
    duration: 300,
    cost: 10000,
    rating: 4.4,
    images: ['https://via.placeholder.com/300x200?text=Jardin+Antes', 'https://via.placeholder.com/300x200?text=Jardin+Despues'],
    materials: ['Tijeras de podar', 'Fertilizante', 'Sistema de riego'],
    notes: 'Jardín completamente renovado y sistema de riego funcionando',
    technician: 'Luis Mendoza',
    phone: '+54 9 380 678-9012',
    warranty: 30,
    nextMaintenance: '2024-04-22'
  },
  {
    id: 6,
    property: 'Casa 2 dorm. - Chilecito',
    provider: 'Gas y Calefacción Riojano',
    category: 'Gas',
    title: 'Reparación de calefón',
    description: 'Reparación completa del calefón que no encendía correctamente',
    status: 'Completada',
    priority: 'Alta',
    startDate: '2024-01-22',
    endDate: '2024-01-23',
    duration: 150,
    cost: 15000,
    rating: 4.8,
    images: ['https://via.placeholder.com/300x200?text=Calefon+Antes', 'https://via.placeholder.com/300x200?text=Calefon+Reparado'],
    materials: ['Termocupla', 'Válvula de gas', 'Limpieza interna'],
    notes: 'Calefón funcionando perfectamente, se realizó limpieza completa',
    technician: 'Pedro Ramírez',
    phone: '+54 9 380 789-0123',
    warranty: 90,
    nextMaintenance: '2024-04-23'
  }
];

const statusColors = {
  'Completada': colors.success,
  'En Progreso': colors.info,
  'Pendiente': colors.warning,
  'Cancelada': colors.danger,
  'Programada': colors.accent,
};

const priorityColors = {
  'Alta': colors.danger,
  'Media': colors.warning,
  'Baja': colors.success,
};

export default function InterventionHistoryScreen({ navigation }) {
  const [interventions, setInterventions] = useState(MOCK_INTERVENTIONS);
  const [filteredInterventions, setFilteredInterventions] = useState(MOCK_INTERVENTIONS);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedProperty, setSelectedProperty] = useState('all');

  const filters = [
    { key: 'all', label: 'Todas', count: interventions.length },
    { key: 'completed', label: 'Completadas', count: interventions.filter(i => i.status === 'Completada').length },
    { key: 'progress', label: 'En Progreso', count: interventions.filter(i => i.status === 'En Progreso').length },
    { key: 'pending', label: 'Pendientes', count: interventions.filter(i => i.status === 'Pendiente').length },
  ];

  const properties = [
    { key: 'all', label: 'Todas las propiedades' },
    { key: 'libertad', label: 'Av. Libertad 123' },
    { key: 'olivos', label: 'Los Olivos 456' },
    { key: 'corrientes', label: 'Corrientes 789' },
  ];

  useEffect(() => {
    filterInterventions();
  }, [selectedFilter, selectedProperty, interventions]);

  const filterInterventions = () => {
    let filtered = [...interventions];

    // Filtrar por estado
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(intervention => {
        switch (selectedFilter) {
          case 'completed': return intervention.status === 'Completada';
          case 'progress': return intervention.status === 'En Progreso';
          case 'pending': return intervention.status === 'Pendiente';
          default: return true;
        }
      });
    }

    // Filtrar por propiedad
    if (selectedProperty !== 'all') {
      filtered = filtered.filter(intervention => {
        switch (selectedProperty) {
          case 'libertad': return intervention.property.includes('Libertad');
          case 'olivos': return intervention.property.includes('Olivos');
          case 'corrientes': return intervention.property.includes('Corrientes');
          default: return true;
        }
      });
    }

    setFilteredInterventions(filtered);
  };

  const loadInterventions = async () => {
    try {
      setLoading(true);
      // Aquí harías la llamada real a la API
      setInterventions(MOCK_INTERVENTIONS);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las intervenciones');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInterventions();
    setRefreshing(false);
  };

  const handleInterventionPress = (intervention) => {
    navigation.navigate('InterventionDetail', { intervention });
  };

  const handleRateProvider = (intervention) => {
    if (intervention.status === 'Completada' && !intervention.rating) {
      navigation.navigate('RateProvider', { 
        provider: { name: intervention.provider, category: intervention.category },
        appointment: { date: intervention.endDate }
      });
    }
  };

  const handleReassignProvider = (intervention) => {
    Alert.alert(
      'Reasignar Proveedor',
      '¿Deseas buscar un nuevo proveedor para esta intervención?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Buscar Proveedor', onPress: () => navigation.navigate('Providers', { interventionId: intervention.id }) }
      ]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'En progreso';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const renderInterventionCard = ({ item }) => (
    <TouchableOpacity style={styles.interventionCard} onPress={() => handleInterventionPress(item)}>
      <View style={styles.cardHeader}>
        <View style={styles.titleContainer}>
          <Text style={styles.interventionTitle}>{item.title}</Text>
          <Text style={styles.propertyName}>{item.property}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.providerInfo}>
        <Text style={styles.providerName}>👷 {item.provider}</Text>
        <Text style={styles.categoryText}>🔧 {item.category}</Text>
        <Text style={styles.technicianText}>👤 {item.technician}</Text>
      </View>

      <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

      <View style={styles.datesContainer}>
        <Text style={styles.dateText}>📅 Inicio: {formatDate(item.startDate)}</Text>
        <Text style={styles.dateText}>📅 Fin: {formatDate(item.endDate)}</Text>
        <Text style={styles.durationText}>⏱️ {formatDuration(item.duration)}</Text>
      </View>

      <View style={styles.costContainer}>
        <Text style={styles.costText}>💰 ${item.cost?.toLocaleString()}</Text>
        <View style={[styles.priorityBadge, { backgroundColor: priorityColors[item.priority] }]}>
          <Text style={styles.priorityText}>{item.priority}</Text>
        </View>
      </View>

      {item.rating && (
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>⭐ {item.rating}/5</Text>
          <Text style={styles.warrantyText}>🛡️ Garantía: {item.warranty} días</Text>
        </View>
      )}

      <View style={styles.cardActions}>
        {item.status === 'Completada' && !item.rating && (
          <TouchableOpacity
            style={[styles.actionButton, styles.rateButton]}
            onPress={() => handleRateProvider(item)}
          >
            <Text style={styles.actionButtonText}>Calificar</Text>
          </TouchableOpacity>
        )}
        
        {item.status === 'En Progreso' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.reassignButton]}
            onPress={() => handleReassignProvider(item)}
          >
            <Text style={styles.actionButtonText}>Reasignar</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionButton, styles.detailButton]}
          onPress={() => handleInterventionPress(item)}
        >
          <Text style={styles.actionButtonText}>Ver Detalles</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Historial de Intervenciones</Text>
        <Text style={styles.subtitle}>{filteredInterventions.length} intervenciones encontradas</Text>
      </View>

      {/* Filters */}
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
                selectedFilter === item.key && styles.filterButtonActive
              ]}
              onPress={() => setSelectedFilter(item.key)}
            >
              <Text style={[
                styles.filterText,
                selectedFilter === item.key && styles.filterTextActive
              ]}>
                {item.label} ({item.count})
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.filtersList}
        />
      </View>

      {/* Property Filter */}
      <View style={styles.propertyFilterContainer}>
        <Text style={styles.propertyFilterLabel}>Propiedad:</Text>
        <View style={styles.propertyFilterButtons}>
          {properties.map((property) => (
            <TouchableOpacity
              key={property.key}
              style={[
                styles.propertyFilterButton,
                selectedProperty === property.key && styles.propertyFilterButtonActive
              ]}
              onPress={() => setSelectedProperty(property.key)}
            >
              <Text style={[
                styles.propertyFilterText,
                selectedProperty === property.key && styles.propertyFilterTextActive
              ]}>
                {property.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Interventions List */}
      <FlatList
        data={filteredInterventions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderInterventionCard}
        contentContainerStyle={styles.interventionsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔧</Text>
            <Text style={styles.emptyTitle}>No hay intervenciones</Text>
            <Text style={styles.emptySubtitle}>
              {selectedFilter !== 'all' || selectedProperty !== 'all'
                ? 'No se encontraron intervenciones con los filtros aplicados'
                : 'No hay intervenciones registradas'
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
  propertyFilterContainer: {
    backgroundColor: colors.card,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  propertyFilterLabel: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 10,
  },
  propertyFilterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  propertyFilterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: colors.bgSecondary,
    marginRight: 8,
    marginBottom: 8,
  },
  propertyFilterButtonActive: {
    backgroundColor: colors.accent,
  },
  propertyFilterText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  propertyFilterTextActive: {
    color: colors.card,
    fontWeight: 'bold',
  },
  interventionsList: {
    padding: 20,
    paddingBottom: 100,
  },
  interventionCard: {
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
  titleContainer: {
    flex: 1,
    marginRight: 10,
  },
  interventionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  propertyName: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: colors.card,
    fontSize: 12,
    fontWeight: 'bold',
  },
  providerInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  providerName: {
    fontSize: 14,
    color: colors.muted,
    marginRight: 15,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 14,
    color: colors.muted,
    marginRight: 15,
    marginBottom: 4,
  },
  technicianText: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  datesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 12,
    color: colors.muted,
  },
  durationText: {
    fontSize: 12,
    color: colors.muted,
  },
  costContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  costText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: 'bold',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: colors.card,
    fontSize: 12,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  ratingText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: 'bold',
  },
  warrantyText: {
    fontSize: 14,
    color: colors.muted,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 8,
    marginBottom: 8,
  },
  rateButton: {
    backgroundColor: colors.success,
  },
  reassignButton: {
    backgroundColor: colors.warning,
  },
  detailButton: {
    backgroundColor: colors.info,
  },
  actionButtonText: {
    color: colors.card,
    fontSize: 12,
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
