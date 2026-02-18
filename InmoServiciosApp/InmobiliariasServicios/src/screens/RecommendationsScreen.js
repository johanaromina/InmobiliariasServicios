import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl, Dimensions } from 'react-native';
import colors from '../theme/colors';
import PrimaryButton from '../components/PrimaryButton';

const { width } = Dimensions.get('window');

const MOCK_RECOMMENDATIONS = [
  {
    id: 1,
    type: 'maintenance',
    title: 'Mantenimiento Preventivo Recomendado',
    description: 'Tu propiedad en Av. San Nicolás de Bari 123 necesita mantenimiento preventivo de plomería',
    priority: 'Alta',
    category: 'Plomería',
    property: 'Depto 2 amb. - Av. San Nicolás de Bari 123',
    reason: 'Última intervención hace 6 meses',
    estimatedCost: 6000,
    estimatedDuration: 60,
    recommendedProviders: [
      { name: 'Plomería La Rioja', rating: 4.8, price: '6000-10000' },
      { name: 'Plomería 24hs La Rioja', rating: 4.6, price: '8000-12000' }
    ],
    benefits: ['Previene problemas mayores', 'Ahorro a largo plazo', 'Garantía extendida'],
    urgency: 'Esta semana',
    icon: '🔧',
    color: colors.warning
  },
  {
    id: 2,
    type: 'upgrade',
    title: 'Mejora de Eficiencia Energética',
    description: 'Considera actualizar el sistema eléctrico para mayor eficiencia',
    priority: 'Media',
    category: 'Electricidad',
    property: 'Casa 3 dorm. - Barrio Norte 456',
    reason: 'Sistema eléctrico de más de 10 años',
    estimatedCost: 25000,
    estimatedDuration: 240,
    recommendedProviders: [
      { name: 'Electricidad del Valle', rating: 4.6, price: '20000-30000' },
      { name: 'Energía Verde La Rioja', rating: 4.9, price: '25000-35000' }
    ],
    benefits: ['Reducción de costos energéticos', 'Mayor seguridad', 'Valorización de la propiedad'],
    urgency: 'Próximo mes',
    icon: '⚡',
    color: colors.info
  },
  {
    id: 3,
    type: 'safety',
    title: 'Actualización de Seguridad',
    description: 'Mejora los sistemas de seguridad de tu propiedad',
    priority: 'Alta',
    category: 'Seguridad',
    property: 'Oficina comercial - Av. Rivadavia 789',
    reason: 'Sistema de seguridad desactualizado',
    estimatedCost: 18000,
    estimatedDuration: 180,
    recommendedProviders: [
      { name: 'Seguridad La Rioja', rating: 4.7, price: '15000-25000' },
      { name: 'Protección del Valle', rating: 4.5, price: '18000-28000' }
    ],
    benefits: ['Mayor protección', 'Reducción de primas de seguro', 'Tranquilidad'],
    urgency: 'Esta semana',
    icon: '🛡️',
    color: colors.danger
  },
  {
    id: 4,
    type: 'cosmetic',
    title: 'Renovación Estética',
    description: 'Actualiza la pintura y acabados para mejorar la apariencia',
    priority: 'Baja',
    category: 'Pintura',
    property: 'Depto 2 amb. - Av. San Nicolás de Bari 123',
    reason: 'Pintura desgastada por el tiempo',
    estimatedCost: 12000,
    estimatedDuration: 120,
    recommendedProviders: [
      { name: 'Pintura del Valle', rating: 4.5, price: '10000-15000' },
      { name: 'Decoración La Rioja', rating: 4.8, price: '12000-18000' }
    ],
    benefits: ['Mejor presentación', 'Aumento del valor', 'Ambiente más agradable'],
    urgency: 'Próximos 3 meses',
    icon: '🎨',
    color: colors.accent
  },
  {
    id: 5,
    type: 'efficiency',
    title: 'Optimización de Espacios',
    description: 'Reorganiza los espacios para mayor funcionalidad',
    priority: 'Media',
    category: 'Carpintería',
    property: 'Casa 3 dorm. - Barrio Norte 456',
    reason: 'Espacios subutilizados identificados',
    estimatedCost: 20000,
    estimatedDuration: 200,
    recommendedProviders: [
      { name: 'Carpintería del Norte', rating: 4.7, price: '18000-25000' },
      { name: 'Muebles a Medida La Rioja', rating: 4.4, price: '15000-30000' }
    ],
    benefits: ['Mejor aprovechamiento del espacio', 'Aumento de funcionalidad', 'Valor agregado'],
    urgency: 'Próximo mes',
    icon: '🏠',
    color: colors.primary
  },
  {
    id: 6,
    type: 'maintenance',
    title: 'Mantenimiento de Jardín',
    description: 'Tu jardín en Villa Sanagasta necesita mantenimiento estacional',
    priority: 'Media',
    category: 'Jardinería',
    property: 'Casa 4 dorm. - Villa Sanagasta',
    reason: 'Temporada de poda y fertilización',
    estimatedCost: 8000,
    estimatedDuration: 180,
    recommendedProviders: [
      { name: 'Jardinería Los Llanos', rating: 4.4, price: '6000-10000' },
      { name: 'Verde La Rioja', rating: 4.6, price: '8000-12000' }
    ],
    benefits: ['Jardín saludable', 'Mejor apariencia', 'Aumento del valor de la propiedad'],
    urgency: 'Próximas 2 semanas',
    icon: '🌱',
    color: colors.success
  }
];

const recommendationTypes = [
  { key: 'all', label: 'Todas', icon: '📋' },
  { key: 'maintenance', label: 'Mantenimiento', icon: '🔧' },
  { key: 'upgrade', label: 'Mejoras', icon: '⬆️' },
  { key: 'safety', label: 'Seguridad', icon: '🛡️' },
  { key: 'cosmetic', label: 'Estética', icon: '🎨' },
  { key: 'efficiency', label: 'Eficiencia', icon: '⚡' },
];

const priorityColors = {
  'Alta': colors.danger,
  'Media': colors.warning,
  'Baja': colors.success,
};

export default function RecommendationsScreen({ navigation }) {
  const [recommendations, setRecommendations] = useState(MOCK_RECOMMENDATIONS);
  const [filteredRecommendations, setFilteredRecommendations] = useState(MOCK_RECOMMENDATIONS);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');

  const filters = [
    { key: 'all', label: 'Todas', count: recommendations.length },
    { key: 'maintenance', label: 'Mantenimiento', count: recommendations.filter(r => r.type === 'maintenance').length },
    { key: 'upgrade', label: 'Mejoras', count: recommendations.filter(r => r.type === 'upgrade').length },
    { key: 'safety', label: 'Seguridad', count: recommendations.filter(r => r.type === 'safety').length },
    { key: 'cosmetic', label: 'Estética', count: recommendations.filter(r => r.type === 'cosmetic').length },
    { key: 'efficiency', label: 'Eficiencia', count: recommendations.filter(r => r.type === 'efficiency').length },
  ];

  const priorityFilters = [
    { key: 'all', label: 'Todas las prioridades' },
    { key: 'high', label: 'Alta prioridad' },
    { key: 'medium', label: 'Media prioridad' },
    { key: 'low', label: 'Baja prioridad' },
  ];

  useEffect(() => {
    filterRecommendations();
  }, [selectedType, selectedPriority, recommendations]);

  const filterRecommendations = () => {
    let filtered = [...recommendations];

    // Filtrar por tipo
    if (selectedType !== 'all') {
      filtered = filtered.filter(rec => rec.type === selectedType);
    }

    // Filtrar por prioridad
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(rec => {
        switch (selectedPriority) {
          case 'high': return rec.priority === 'Alta';
          case 'medium': return rec.priority === 'Media';
          case 'low': return rec.priority === 'Baja';
          default: return true;
        }
      });
    }

    setFilteredRecommendations(filtered);
  };

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      // Aquí harías la llamada real a la API
      setRecommendations(MOCK_RECOMMENDATIONS);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las recomendaciones');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecommendations();
    setRefreshing(false);
  };

  const handleRecommendationPress = (recommendation) => {
    navigation.navigate('RecommendationDetail', { recommendation });
  };

  const handleAcceptRecommendation = (recommendation) => {
    Alert.alert(
      'Aceptar Recomendación',
      `¿Deseas proceder con "${recommendation.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Ver Proveedores', onPress: () => navigation.navigate('Providers', { recommendationId: recommendation.id }) },
        { text: 'Agendar Consulta', onPress: () => Alert.alert('Consulta', 'Funcionalidad de consulta próximamente') }
      ]
    );
  };

  const handleDismissRecommendation = (recommendation) => {
    Alert.alert(
      'Descartar Recomendación',
      '¿Estás seguro de que deseas descartar esta recomendación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Descartar', 
          style: 'destructive',
          onPress: () => {
            setRecommendations(prev => prev.filter(r => r.id !== recommendation.id));
          }
        }
      ]
    );
  };

  const renderRecommendationCard = ({ item }) => (
    <TouchableOpacity style={styles.recommendationCard} onPress={() => handleRecommendationPress(item)}>
      <View style={styles.cardHeader}>
        <View style={styles.titleContainer}>
          <Text style={styles.recommendationTitle}>{item.title}</Text>
          <Text style={styles.propertyName}>{item.property}</Text>
        </View>
        <View style={[styles.priorityBadge, { backgroundColor: priorityColors[item.priority] }]}>
          <Text style={styles.priorityText}>{item.priority}</Text>
        </View>
      </View>

      <View style={styles.categoryContainer}>
        <Text style={styles.categoryIcon}>{item.icon}</Text>
        <Text style={styles.categoryText}>{item.category}</Text>
        <Text style={styles.urgencyText}>⏰ {item.urgency}</Text>
      </View>

      <Text style={styles.description} numberOfLines={3}>{item.description}</Text>

      <View style={styles.reasonContainer}>
        <Text style={styles.reasonLabel}>Motivo:</Text>
        <Text style={styles.reasonText}>{item.reason}</Text>
      </View>

      <View style={styles.costContainer}>
        <Text style={styles.costText}>💰 ${item.estimatedCost?.toLocaleString()}</Text>
        <Text style={styles.durationText}>⏱️ {item.estimatedDuration} min</Text>
      </View>

      <View style={styles.benefitsContainer}>
        <Text style={styles.benefitsTitle}>Beneficios:</Text>
        <View style={styles.benefitsList}>
          {item.benefits.slice(0, 2).map((benefit, index) => (
            <Text key={index} style={styles.benefitItem}>• {benefit}</Text>
          ))}
          {item.benefits.length > 2 && (
            <Text style={styles.moreBenefits}>+{item.benefits.length - 2} más</Text>
          )}
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => handleAcceptRecommendation(item)}
        >
          <Text style={styles.actionButtonText}>Aceptar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.dismissButton]}
          onPress={() => handleDismissRecommendation(item)}
        >
          <Text style={styles.actionButtonText}>Descartar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.detailButton]}
          onPress={() => handleRecommendationPress(item)}
        >
          <Text style={styles.actionButtonText}>Ver Más</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Recomendaciones Inteligentes</Text>
        <Text style={styles.subtitle}>{filteredRecommendations.length} recomendaciones encontradas</Text>
      </View>

      {/* Type Filters */}
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
                selectedType === item.key && styles.filterButtonActive
              ]}
              onPress={() => setSelectedType(item.key)}
            >
              <Text style={styles.filterIcon}>{item.icon}</Text>
              <Text style={[
                styles.filterText,
                selectedType === item.key && styles.filterTextActive
              ]}>
                {item.label} ({item.count})
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.filtersList}
        />
      </View>

      {/* Priority Filter */}
      <View style={styles.priorityFilterContainer}>
        <Text style={styles.priorityFilterLabel}>Prioridad:</Text>
        <View style={styles.priorityFilterButtons}>
          {priorityFilters.map((priority) => (
            <TouchableOpacity
              key={priority.key}
              style={[
                styles.priorityFilterButton,
                selectedPriority === priority.key && styles.priorityFilterButtonActive
              ]}
              onPress={() => setSelectedPriority(priority.key)}
            >
              <Text style={[
                styles.priorityFilterText,
                selectedPriority === priority.key && styles.priorityFilterTextActive
              ]}>
                {priority.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recommendations List */}
      <FlatList
        data={filteredRecommendations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderRecommendationCard}
        contentContainerStyle={styles.recommendationsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💡</Text>
            <Text style={styles.emptyTitle}>No hay recomendaciones</Text>
            <Text style={styles.emptySubtitle}>
              {selectedType !== 'all' || selectedPriority !== 'all'
                ? 'No se encontraron recomendaciones con los filtros aplicados'
                : 'No hay recomendaciones disponibles en este momento'
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.bgSecondary,
    marginRight: 10,
  },
  filterButtonActive: {
    backgroundColor: colors.secondary,
  },
  filterIcon: {
    fontSize: 16,
    marginRight: 6,
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
  priorityFilterContainer: {
    backgroundColor: colors.card,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  priorityFilterLabel: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 10,
  },
  priorityFilterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  priorityFilterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: colors.bgSecondary,
    marginRight: 8,
    marginBottom: 8,
  },
  priorityFilterButtonActive: {
    backgroundColor: colors.accent,
  },
  priorityFilterText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  priorityFilterTextActive: {
    color: colors.card,
    fontWeight: 'bold',
  },
  recommendationsList: {
    padding: 20,
    paddingBottom: 100,
  },
  recommendationCard: {
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
  recommendationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  propertyName: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  priorityText: {
    color: colors.card,
    fontSize: 12,
    fontWeight: 'bold',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 15,
  },
  urgencyText: {
    fontSize: 12,
    color: colors.muted,
  },
  description: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
    lineHeight: 20,
  },
  reasonContainer: {
    marginBottom: 12,
  },
  reasonLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 14,
    color: colors.text,
  },
  costContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  costText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: 'bold',
  },
  durationText: {
    fontSize: 14,
    color: colors.muted,
  },
  benefitsContainer: {
    marginBottom: 15,
  },
  benefitsTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 6,
  },
  benefitsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  benefitItem: {
    fontSize: 12,
    color: colors.textSecondary,
    marginRight: 8,
    marginBottom: 2,
  },
  moreBenefits: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: 'bold',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: colors.success,
  },
  dismissButton: {
    backgroundColor: colors.danger,
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
