import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import colors from '../theme/colors';
import PrimaryButton from '../components/PrimaryButton';

const ratingCategories = [
  { id: 'quality', label: 'Calidad del Trabajo', icon: '⭐' },
  { id: 'punctuality', label: 'Puntualidad', icon: '⏰' },
  { id: 'communication', label: 'Comunicación', icon: '💬' },
  { id: 'cleanliness', label: 'Limpieza', icon: '🧹' },
  { id: 'price', label: 'Relación Precio-Calidad', icon: '💰' },
];

const ratingOptions = [
  { value: 1, label: 'Muy Malo', color: colors.danger },
  { value: 2, label: 'Malo', color: colors.warning },
  { value: 3, label: 'Regular', color: colors.muted },
  { value: 4, label: 'Bueno', color: colors.info },
  { value: 5, label: 'Excelente', color: colors.success },
];

export default function RateProviderScreen({ navigation, route }) {
  const { provider, appointment } = route.params;
  
  const [ratings, setRatings] = useState({
    quality: 0,
    punctuality: 0,
    communication: 0,
    cleanliness: 0,
    price: 0,
  });
  
  const [overallRating, setOverallRating] = useState(0);
  const [review, setReview] = useState('');
  const [recommend, setRecommend] = useState(null); // true, false, null
  const [anonymous, setAnonymous] = useState(false);

  const handleRatingChange = (category, rating) => {
    setRatings(prev => ({
      ...prev,
      [category]: rating
    }));
    
    // Calcular calificación general
    const values = Object.values({ ...ratings, [category]: rating });
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    setOverallRating(Math.round(average));
  };

  const handleSubmitRating = () => {
    const hasAllRatings = Object.values(ratings).every(rating => rating > 0);
    
    if (!hasAllRatings) {
      Alert.alert('Error', 'Por favor califica todas las categorías');
      return;
    }

    if (overallRating === 0) {
      Alert.alert('Error', 'Por favor selecciona una calificación general');
      return;
    }

    Alert.alert(
      'Calificación Enviada',
      '¡Gracias por tu calificación! Tu opinión ayuda a otros usuarios.',
      [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]
    );
  };

  const renderRatingCategory = (category) => (
    <View key={category.id} style={styles.ratingCategory}>
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryIcon}>{category.icon}</Text>
        <Text style={styles.categoryLabel}>{category.label}</Text>
      </View>
      <View style={styles.ratingButtons}>
        {ratingOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.ratingButton,
              ratings[category.id] === option.value && styles.ratingButtonActive,
              { borderColor: option.color }
            ]}
            onPress={() => handleRatingChange(category.id, option.value)}
          >
            <Text style={[
              styles.ratingButtonText,
              ratings[category.id] === option.value && { color: option.color }
            ]}>
              {option.value}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderOverallRating = () => (
    <View style={styles.overallRatingContainer}>
      <Text style={styles.overallRatingTitle}>Calificación General</Text>
      <View style={styles.overallRatingButtons}>
        {[1, 2, 3, 4, 5].map((rating) => (
          <TouchableOpacity
            key={rating}
            style={[
              styles.overallRatingButton,
              overallRating === rating && styles.overallRatingButtonActive
            ]}
            onPress={() => setOverallRating(rating)}
          >
            <Text style={[
              styles.overallRatingText,
              overallRating === rating && styles.overallRatingTextActive
            ]}>
              ⭐
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {overallRating > 0 && (
        <Text style={styles.overallRatingLabel}>
          {ratingOptions.find(opt => opt.value === overallRating)?.label}
        </Text>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Calificar Proveedor</Text>
        <Text style={styles.subtitle}>{provider.name}</Text>
      </View>

      {/* Provider Info */}
      <View style={styles.providerCard}>
        <View style={styles.providerInfo}>
          <Text style={styles.providerName}>{provider.name}</Text>
          <Text style={styles.providerCategory}>{provider.category}</Text>
          <Text style={styles.appointmentInfo}>
            📅 Cita del {appointment?.date || '15 de Enero, 2024'}
          </Text>
        </View>
      </View>

      {/* Rating Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Califica por Categorías</Text>
        {ratingCategories.map(renderRatingCategory)}
      </View>

      {/* Overall Rating */}
      <View style={styles.section}>
        {renderOverallRating()}
      </View>

      {/* Review Text */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Escribe una Reseña (Opcional)</Text>
        <View style={styles.reviewContainer}>
          <TextInput
            style={styles.reviewInput}
            placeholder="Comparte tu experiencia con este proveedor..."
            value={review}
            onChangeText={setReview}
            multiline
            numberOfLines={4}
            placeholderTextColor={colors.muted}
          />
          <Text style={styles.reviewHint}>
            {review.length}/500 caracteres
          </Text>
        </View>
      </View>

      {/* Recommendation */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>¿Recomendarías este proveedor?</Text>
        <View style={styles.recommendationContainer}>
          <TouchableOpacity
            style={[
              styles.recommendButton,
              recommend === true && styles.recommendButtonActive
            ]}
            onPress={() => setRecommend(true)}
          >
            <Text style={styles.recommendIcon}>👍</Text>
            <Text style={styles.recommendText}>Sí, lo recomiendo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.recommendButton,
              recommend === false && styles.recommendButtonActive
            ]}
            onPress={() => setRecommend(false)}
          >
            <Text style={styles.recommendIcon}>👎</Text>
            <Text style={styles.recommendText}>No lo recomiendo</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Anonymous Option */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.anonymousContainer}
          onPress={() => setAnonymous(!anonymous)}
        >
          <View style={styles.checkbox}>
            {anonymous && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.anonymousText}>
            Enviar calificación de forma anónima
          </Text>
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Resumen de tu Calificación</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Calificación General:</Text>
          <Text style={styles.summaryValue}>
            {overallRating > 0 ? `${overallRating}/5 ⭐` : 'No calificada'}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Categorías calificadas:</Text>
          <Text style={styles.summaryValue}>
            {Object.values(ratings).filter(r => r > 0).length}/5
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Recomendación:</Text>
          <Text style={styles.summaryValue}>
            {recommend === true ? 'Sí' : recommend === false ? 'No' : 'Sin respuesta'}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Anónima:</Text>
          <Text style={styles.summaryValue}>
            {anonymous ? 'Sí' : 'No'}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <PrimaryButton 
          title="Enviar Calificación" 
          onPress={handleSubmitRating}
        />
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
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
  providerCard: {
    backgroundColor: colors.card,
    margin: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  providerInfo: {
    alignItems: 'center',
  },
  providerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  providerCategory: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  appointmentInfo: {
    fontSize: 12,
    color: colors.muted,
  },
  section: {
    margin: 20,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
  },
  ratingCategory: {
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  categoryLabel: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  ratingButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bgSecondary,
  },
  ratingButtonActive: {
    backgroundColor: colors.card,
  },
  ratingButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  overallRatingContainer: {
    alignItems: 'center',
  },
  overallRatingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
  },
  overallRatingButtons: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  overallRatingButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    backgroundColor: colors.bgSecondary,
  },
  overallRatingButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  overallRatingText: {
    fontSize: 24,
  },
  overallRatingTextActive: {
    color: colors.card,
  },
  overallRatingLabel: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: 'bold',
  },
  reviewContainer: {
    backgroundColor: colors.bgSecondary,
    borderRadius: 12,
    padding: 16,
  },
  reviewInput: {
    fontSize: 16,
    color: colors.text,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  reviewHint: {
    fontSize: 12,
    color: colors.muted,
    textAlign: 'right',
    marginTop: 8,
  },
  recommendationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  recommendButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginHorizontal: 8,
    borderRadius: 12,
    backgroundColor: colors.bgSecondary,
    borderWidth: 2,
    borderColor: colors.border,
  },
  recommendButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.primary,
  },
  recommendIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  recommendText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  anonymousContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bgSecondary,
  },
  checkmark: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: 'bold',
  },
  anonymousText: {
    fontSize: 16,
    color: colors.text,
  },
  summaryCard: {
    backgroundColor: colors.card,
    margin: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  actionsContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    color: colors.muted,
    fontWeight: '500',
  },
});
