import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions, Platform } from 'react-native';
import colors from '../theme/colors';
import PrimaryButton from '../components/PrimaryButton';

// Importar Picker solo en plataformas nativas
let Picker;
if (Platform.OS !== 'web') {
  const PickerModule = require('@react-native-picker/picker');
  Picker = PickerModule.Picker;
}

const { width } = Dimensions.get('window');

const timeSlots = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
];

const appointmentTypes = [
  { id: 1, name: 'Consulta inicial', duration: 60, price: 0 },
  { id: 2, name: 'Presupuesto', duration: 90, price: 0 },
  { id: 3, name: 'Trabajo urgente', duration: 120, price: 5000 },
  { id: 4, name: 'Mantenimiento programado', duration: 180, price: 0 },
];

export default function BookAppointmentScreen({ navigation, route }) {
  const { provider, requestId } = route.params;
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedType, setSelectedType] = useState(appointmentTypes[0].id);
  const [notes, setNotes] = useState('');
  const [contactInfo, setContactInfo] = useState({
    name: 'Usuario Demo',
    phone: '+54 9 11 1234-5678',
    email: 'demo@demo.com'
  });

  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  const getAvailableTimeSlots = (date) => {
    // Simular disponibilidad - en una app real vendría de la API
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    if (isWeekend) {
      return timeSlots.slice(0, 6); // Solo mañana los fines de semana
    }
    
    return timeSlots;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleBookAppointment = () => {
    if (!selectedTime) {
      Alert.alert('Error', 'Por favor selecciona un horario');
      return;
    }

    const appointmentType = appointmentTypes.find(type => type.id === selectedType);
    
    Alert.alert(
      'Confirmar Cita',
      `¿Confirmar cita con ${provider.name}?\n\n` +
      `📅 Fecha: ${formatDate(selectedDate)}\n` +
      `⏰ Hora: ${selectedTime}\n` +
      `📋 Tipo: ${appointmentType.name}\n` +
      `⏱️ Duración: ${appointmentType.duration} minutos\n` +
      `💰 Precio: ${appointmentType.price > 0 ? `$${appointmentType.price}` : 'Gratis'}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar', 
          onPress: () => {
            Alert.alert('¡Cita Confirmada!', 'Tu cita ha sido agendada exitosamente. Recibirás una confirmación por email.');
            navigation.goBack();
          }
        }
      ]
    );
  };

  const availableDates = getAvailableDates();
  const availableTimes = getAvailableTimeSlots(selectedDate);
  const selectedAppointmentType = appointmentTypes.find(type => type.id === selectedType);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Agendar Cita</Text>
        <Text style={styles.subtitle}>Con {provider.name}</Text>
      </View>

      {/* Provider Info */}
      <View style={styles.providerInfoCard}>
        <View style={styles.providerHeader}>
          <Text style={styles.providerName}>{provider.name}</Text>
          <Text style={styles.providerCategory}>{provider.category}</Text>
        </View>
        <View style={styles.providerDetails}>
          <Text style={styles.providerDetail}>⭐ {provider.rating} ({provider.reviews} reseñas)</Text>
          <Text style={styles.providerDetail}>📍 {provider.location}</Text>
          <Text style={styles.providerDetail}>💰 {provider.priceRange}</Text>
        </View>
      </View>

      {/* Appointment Type */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tipo de Cita</Text>
        <View style={styles.typesContainer}>
          {appointmentTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.typeCard,
                selectedType === type.id && styles.typeCardActive
              ]}
              onPress={() => setSelectedType(type.id)}
            >
              <Text style={styles.typeName}>{type.name}</Text>
              <Text style={styles.typeDuration}>{type.duration} min</Text>
              <Text style={styles.typePrice}>
                {type.price > 0 ? `$${type.price}` : 'Gratis'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Date Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Seleccionar Fecha</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.datesContainer}>
          {availableDates.map((date, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dateCard,
                selectedDate.toDateString() === date.toDateString() && styles.dateCardActive
              ]}
              onPress={() => setSelectedDate(date)}
            >
              <Text style={styles.dateWeekday}>
                {date.toLocaleDateString('es-AR', { weekday: 'short' })}
              </Text>
              <Text style={styles.dateDay}>{date.getDate()}</Text>
              <Text style={styles.dateMonth}>
                {date.toLocaleDateString('es-AR', { month: 'short' })}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Time Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Seleccionar Hora</Text>
        <View style={styles.timesContainer}>
          {availableTimes.map((time) => (
            <TouchableOpacity
              key={time}
              style={[
                styles.timeCard,
                selectedTime === time && styles.timeCardActive
              ]}
              onPress={() => setSelectedTime(time)}
            >
              <Text style={styles.timeText}>{time}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Contact Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información de Contacto</Text>
        <View style={styles.contactCard}>
          <View style={styles.contactRow}>
            <Text style={styles.contactLabel}>Nombre:</Text>
            <Text style={styles.contactValue}>{contactInfo.name}</Text>
          </View>
          <View style={styles.contactRow}>
            <Text style={styles.contactLabel}>Teléfono:</Text>
            <Text style={styles.contactValue}>{contactInfo.phone}</Text>
          </View>
          <View style={styles.contactRow}>
            <Text style={styles.contactLabel}>Email:</Text>
            <Text style={styles.contactValue}>{contactInfo.email}</Text>
          </View>
        </View>
      </View>

      {/* Notes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notas Adicionales (Opcional)</Text>
        <View style={styles.notesContainer}>
          <Text style={styles.notesPlaceholder}>
            Describe brevemente el problema o servicio que necesitas...
          </Text>
        </View>
      </View>

      {/* Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Resumen de la Cita</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Proveedor:</Text>
          <Text style={styles.summaryValue}>{provider.name}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Fecha:</Text>
          <Text style={styles.summaryValue}>{formatDate(selectedDate)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Hora:</Text>
          <Text style={styles.summaryValue}>{selectedTime || 'No seleccionada'}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tipo:</Text>
          <Text style={styles.summaryValue}>{selectedAppointmentType?.name}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Duración:</Text>
          <Text style={styles.summaryValue}>{selectedAppointmentType?.duration} minutos</Text>
        </View>
        <View style={[styles.summaryRow, styles.summaryTotal]}>
          <Text style={styles.summaryLabelTotal}>Total:</Text>
          <Text style={styles.summaryValueTotal}>
            {selectedAppointmentType?.price > 0 ? `$${selectedAppointmentType.price}` : 'Gratis'}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <PrimaryButton 
          title="Agendar Cita" 
          onPress={handleBookAppointment}
          disabled={!selectedTime}
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
  providerInfoCard: {
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
  providerHeader: {
    marginBottom: 12,
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
  },
  providerDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  providerDetail: {
    fontSize: 12,
    color: colors.muted,
    marginRight: 15,
    marginBottom: 4,
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
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  typeCard: {
    width: (width - 60) / 2,
    backgroundColor: colors.bgSecondary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeCardActive: {
    backgroundColor: colors.accent,
    borderColor: colors.primary,
  },
  typeName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  typeDuration: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  typePrice: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: 'bold',
  },
  datesContainer: {
    marginBottom: 10,
  },
  dateCard: {
    backgroundColor: colors.bgSecondary,
    padding: 16,
    borderRadius: 12,
    marginRight: 10,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateCardActive: {
    backgroundColor: colors.accent,
    borderColor: colors.primary,
  },
  dateWeekday: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  dateDay: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  dateMonth: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  timesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeCard: {
    backgroundColor: colors.bgSecondary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    width: (width - 80) / 3,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeCardActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timeText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  contactCard: {
    backgroundColor: colors.bgSecondary,
    padding: 16,
    borderRadius: 12,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  contactLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  contactValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  notesContainer: {
    backgroundColor: colors.bgSecondary,
    padding: 16,
    borderRadius: 12,
    minHeight: 80,
  },
  notesPlaceholder: {
    fontSize: 14,
    color: colors.muted,
    fontStyle: 'italic',
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
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    marginTop: 8,
  },
  summaryLabelTotal: {
    fontSize: 16,
    color: colors.text,
    fontWeight: 'bold',
  },
  summaryValueTotal: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: 'bold',
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
