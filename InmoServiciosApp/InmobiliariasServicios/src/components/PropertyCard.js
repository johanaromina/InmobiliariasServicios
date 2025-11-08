import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import colors from '../theme/colors';

export default function PropertyCard({ item, onPress, onEdit, onDelete }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Disponible': return colors.success;
      case 'Alquilado': return colors.info;
      case 'En proceso': return colors.warning;
      case 'Mantenimiento': return colors.danger;
      default: return colors.muted;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Alquiler': return '🏠';
      case 'Venta': return '💰';
      default: return '🏢';
    }
  };

  const formatPrice = (price) => {
    if (!price) return '';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {/* Imagen de la propiedad */}
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: item.images?.[0] || 'https://via.placeholder.com/300x200?text=Sin+imagen' }} 
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
          <View style={styles.typeBadge}>
            <Text style={styles.typeIcon}>{getTypeIcon(item.type)}</Text>
            <Text style={styles.typeText}>{item.type}</Text>
          </View>
        </View>
      </View>

      {/* Contenido de la tarjeta */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.address} numberOfLines={1}>{item.address}</Text>
        
        {/* Características */}
        <View style={styles.features}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🛏️</Text>
            <Text style={styles.featureText}>{item.rooms} dorm.</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🚿</Text>
            <Text style={styles.featureText}>{item.bathrooms} baños</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>📐</Text>
            <Text style={styles.featureText}>{item.area}m²</Text>
          </View>
        </View>

        {/* Precio */}
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{formatPrice(item.price)}</Text>
          <Text style={styles.priceUnit}>/mes</Text>
        </View>
      </View>

      {/* Botones de acción */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]} 
          onPress={onEdit}
        >
          <Text style={styles.actionIcon}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]} 
          onPress={onDelete}
        >
          <Text style={styles.actionIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 180,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 12,
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
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.overlay,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  typeIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  typeText: {
    color: colors.card,
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 6,
  },
  address: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: 12,
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    paddingVertical: 8,
    backgroundColor: colors.bgSecondary,
    borderRadius: 8,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  featureText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  priceUnit: {
    fontSize: 14,
    color: colors.muted,
    marginLeft: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: colors.info,
  },
  deleteButton: {
    backgroundColor: colors.danger,
  },
  actionIcon: {
    fontSize: 16,
  },
});
