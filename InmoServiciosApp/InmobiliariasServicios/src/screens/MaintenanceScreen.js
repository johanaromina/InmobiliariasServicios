import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import colors from '../theme/colors';
import PrimaryButton from '../components/PrimaryButton';

const MOCK_REQUESTS = [
  {
    id: 1,
    title: 'Reparación de grifo principal',
    description: 'El grifo de la cocina tiene una fuga constante que necesita reparación urgente',
    status: 'Pendiente',
    priority: 'Alta',
    category: 'Plomería',
    property: 'Depto 2 amb. - Av. San Nicolás de Bari 123',
    requester: 'Juan Pérez',
    assignedProvider: 'Plomería La Rioja',
    createdAt: '2024-01-15',
    dueDate: '2024-01-20',
    estimatedCost: 12000,
  },
  {
    id: 2,
    title: 'Cambio de disyuntor',
    description: 'El disyuntor principal se dispara constantemente, necesita revisión',
    status: 'En Progreso',
    priority: 'Media',
    category: 'Electricidad',
    property: 'Casa 3 dorm. - Barrio Norte 456',
    requester: 'María González',
    assignedProvider: 'Electricidad del Valle',
    createdAt: '2024-01-10',
    dueDate: '2024-01-18',
    estimatedCost: 18000,
  },
  {
    id: 3,
    title: 'Limpieza de tanque de agua',
    description: 'Limpieza y desinfección del tanque de agua del edificio',
    status: 'Completada',
    priority: 'Baja',
    category: 'Limpieza',
    property: 'Oficina comercial - Av. Rivadavia 789',
    requester: 'Carlos López',
    assignedProvider: 'Limpieza Integral La Rioja',
    createdAt: '2024-01-05',
    dueDate: '2024-01-12',
    estimatedCost: 6000,
  },
  {
    id: 4,
    title: 'Reparación de persianas',
    description: 'Las persianas del living no suben correctamente',
    status: 'Pendiente',
    priority: 'Baja',
    category: 'Carpintería',
    property: 'Depto 2 amb. - Av. San Nicolás de Bari 123',
    requester: 'Ana Martínez',
    assignedProvider: null,
    createdAt: '2024-01-18',
    dueDate: '2024-01-25',
    estimatedCost: 8000,
  },
  {
    id: 5,
    title: 'Mantenimiento de jardín',
    description: 'Poda de árboles y mantenimiento del sistema de riego',
    status: 'Pendiente',
    priority: 'Media',
    category: 'Jardinería',
    property: 'Casa 4 dorm. - Villa Sanagasta',
    requester: 'Roberto Silva',
    assignedProvider: 'Jardinería Los Llanos',
    createdAt: '2024-01-20',
    dueDate: '2024-01-27',
    estimatedCost: 10000,
  },
  {
    id: 6,
    title: 'Reparación de calefón',
    description: 'El calefón no enciende correctamente, necesita revisión',
    status: 'En Progreso',
    priority: 'Alta',
    category: 'Gas',
    property: 'Casa 2 dorm. - Chilecito',
    requester: 'Laura Fernández',
    assignedProvider: 'Gas y Calefacción Riojano',
    createdAt: '2024-01-22',
    dueDate: '2024-01-25',
    estimatedCost: 15000,
  }
];

export default function MaintenanceScreen({ navigation }) {
  const [requests, setRequests] = useState(MOCK_REQUESTS);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  const filters = [
    { key: 'all', label: 'Todas', count: requests.length },
    { key: 'pending', label: 'Pendientes', count: requests.filter(r => r.status === 'Pendiente').length },
    { key: 'progress', label: 'En Progreso', count: requests.filter(r => r.status === 'En Progreso').length },
    { key: 'completed', label: 'Completadas', count: requests.filter(r => r.status === 'Completada').length },
  ];

  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true;
    if (filter === 'pending') return request.status === 'Pendiente';
    if (filter === 'progress') return request.status === 'En Progreso';
    if (filter === 'completed') return request.status === 'Completada';
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pendiente': return colors.warning;
      case 'En Progreso': return colors.info;
      case 'Completada': return colors.success;
      case 'Cancelada': return colors.danger;
      default: return colors.muted;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Alta': return colors.danger;
      case 'Media': return colors.warning;
      case 'Baja': return colors.success;
      default: return colors.muted;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Plomería': return '🔧';
      case 'Electricidad': return '⚡';
      case 'Limpieza': return '🧽';
      case 'Carpintería': return '🔨';
      case 'Pintura': return '🎨';
      case 'Jardinería': return '🌱';
      default: return '🔧';
    }
  };

  const loadRequests = async () => {
    try {
      setLoading(true);
      // Aquí harías la llamada real a la API
      // const response = await api.get('/requests');
      // setRequests(response.data);
      
      // Por ahora usamos datos mock
      setRequests(MOCK_REQUESTS);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  };

  const handleCreateRequest = () => {
    navigation.navigate('CreateRequest');
  };

  const handleRequestPress = (request) => {
    navigation.navigate('RequestDetail', { request });
  };

  const handleAssignProvider = (request) => {
    Alert.alert(
      'Asignar Proveedor',
      '¿Deseas buscar y asignar un proveedor para esta solicitud?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Buscar Proveedor', onPress: () => navigation.navigate('Providers', { requestId: request.id }) }
      ]
    );
  };

  const handleUpdateStatus = (request, newStatus) => {
    setRequests(prev => prev.map(r => 
      r.id === request.id ? { ...r, status: newStatus } : r
    ));
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const renderRequestCard = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleRequestPress(item)}>
      <View style={styles.cardHeader}>
        <View style={styles.titleContainer}>
          <Text style={styles.categoryIcon}>{getCategoryIcon(item.category)}</Text>
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      
      <View style={styles.propertyInfo}>
        <Text style={styles.propertyText}>🏠 {item.property}</Text>
        <Text style={styles.requesterText}>👤 {item.requester}</Text>
      </View>

      <View style={styles.metaInfo}>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
          <Text style={styles.priorityText}>{item.priority}</Text>
        </View>
        <Text style={styles.categoryText}>{item.category}</Text>
        <Text style={styles.costText}>${item.estimatedCost?.toLocaleString()}</Text>
      </View>

      <View style={styles.datesContainer}>
        <Text style={styles.dateText}>📅 Creada: {item.createdAt}</Text>
        <Text style={styles.dateText}>⏰ Vence: {item.dueDate}</Text>
      </View>

      {item.assignedProvider && (
        <View style={styles.providerInfo}>
          <Text style={styles.providerText}>👷 Asignado: {item.assignedProvider}</Text>
        </View>
      )}

      <View style={styles.actions}>
        {item.status === 'Pendiente' && !item.assignedProvider && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.assignButton]}
            onPress={() => handleAssignProvider(item)}
          >
            <Text style={styles.actionButtonText}>Asignar Proveedor</Text>
          </TouchableOpacity>
        )}
        
        {item.status === 'En Progreso' && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.completeButton]}
            onPress={() => handleUpdateStatus(item, 'Completada')}
          >
            <Text style={styles.actionButtonText}>Marcar Completada</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Solicitudes de Mantenimiento</Text>
        <Text style={styles.subtitle}>{filteredRequests.length} solicitudes encontradas</Text>
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

      {/* Lista de solicitudes */}
      <FlatList
        data={filteredRequests}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderRequestCard}
        contentContainerStyle={styles.requestsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔧</Text>
            <Text style={styles.emptyTitle}>No hay solicitudes</Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'all' 
                ? 'Crea tu primera solicitud de mantenimiento'
                : 'No hay solicitudes con este filtro'
              }
            </Text>
          </View>
        }
      />

      {/* Botón flotante para crear solicitud */}
      <TouchableOpacity style={styles.fab} onPress={handleCreateRequest}>
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
  requestsList: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
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
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
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
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  propertyInfo: {
    marginBottom: 12,
  },
  propertyText: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: 4,
  },
  requesterText: {
    fontSize: 14,
    color: colors.muted,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  priorityText: {
    color: colors.card,
    fontSize: 12,
    fontWeight: 'bold',
  },
  categoryText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginRight: 8,
    marginBottom: 4,
  },
  costText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: 4,
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
  providerInfo: {
    backgroundColor: colors.bgSecondary,
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  providerText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 8,
  },
  assignButton: {
    backgroundColor: colors.info,
  },
  completeButton: {
    backgroundColor: colors.success,
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
