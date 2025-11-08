import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  Image,
  Dimensions,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import TextField from '../components/TextField';
import PrimaryButton from '../components/PrimaryButton';
import colors from '../theme/colors';
import { createProperty, addPropertyImage } from '../services/properties';

const { width } = Dimensions.get('window');

const PROPERTY_TYPES = [
  { key: 'casa', label: 'Casa', icon: '🏠' },
  { key: 'departamento', label: 'Departamento', icon: '🏢' },
  { key: 'oficina', label: 'Oficina', icon: '🏢' },
  { key: 'local', label: 'Local Comercial', icon: '🏪' },
  { key: 'terreno', label: 'Terreno', icon: '🌱' },
];

const PUBLICATION_TYPES = [
  { key: 'alquiler', label: 'Alquiler', icon: '🏠' },
  { key: 'venta', label: 'Venta', icon: '💰' },
];

const CURRENCIES = [
  { key: 'ARS', label: 'Pesos Argentinos', symbol: '$' },
  { key: 'USD', label: 'Dólares', symbol: 'US$' },
];

const PROPERTY_TYPE_TO_API = {
  casa: 'house',
  departamento: 'apartment',
  oficina: 'office',
  local: 'commercial',
  terreno: 'land',
};

const PUBLICATION_STATUS = {
  alquiler: 'available',
  venta: 'available',
};

const sanitizeNumber = (value, { integer = false } = {}) => {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }
  const parsed = integer ? parseInt(value, 10) : parseFloat(value);
  if (Number.isNaN(parsed)) {
    return undefined;
  }
  return parsed;
};

const getBackendPropertyType = (type) => PROPERTY_TYPE_TO_API[type] || 'house';

const buildAddress = (street, number, city, province) => {
  const parts = [street?.trim(), number?.trim()].filter(Boolean);
  const address = parts.join(' ').trim();
  const location = [city?.trim(), province?.trim()].filter(Boolean).join(', ');
  return location ? `${address}, ${location}` : address;
};

export default function AddPropertyScreen({ navigation, route }) {
  const { type: initialType } = route.params || {};
  
  const [formData, setFormData] = useState({
    // Información básica
    title: '',
    description: '',
    propertyType: initialType || 'casa',
    publicationType: 'alquiler',
    
    // Ubicación
    street: '',
    number: '',
    city: '',
    province: '',
    postalCode: '',
    latitude: '',
    longitude: '',
    
    // Características
    rooms: '',
    bathrooms: '',
    area: '',
    parking: false,
    balcony: false,
    garden: false,
    pool: false,
    elevator: false,
    
    // Precio
    price: '',
    currency: 'ARS',
    expenses: '',
    
    // Imágenes
    images: [],
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageUrlError, setImageUrlError] = useState(null);

  const steps = [
    { number: 1, title: 'Información Básica', icon: '📝' },
    { number: 2, title: 'Ubicación', icon: '📍' },
    { number: 3, title: 'Características', icon: '🏠' },
    { number: 4, title: 'Precio', icon: '💰' },
    { number: 5, title: 'Imágenes', icon: '📸' },
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title?.trim() || !formData.street?.trim() || !formData.city?.trim() || !formData.province?.trim() || !formData.price) {
      Alert.alert('Campos obligatorios', 'Por favor completa el título, dirección, ciudad, provincia y precio.');
      return;
    }

    const price = sanitizeNumber(formData.price);
    if (price === undefined) {
      Alert.alert('Precio inválido', 'El precio debe ser un número válido.');
      return;
    }

    const payload = {
      title: formData.title.trim(),
      description: formData.description?.trim() || undefined,
      address: buildAddress(formData.street, formData.number, formData.city, formData.province),
      city: formData.city.trim(),
      state: formData.province.trim(),
      property_type: getBackendPropertyType(formData.propertyType),
      bedrooms: sanitizeNumber(formData.rooms, { integer: true }),
      bathrooms: sanitizeNumber(formData.bathrooms, { integer: true }),
      area_sqm: sanitizeNumber(formData.area),
      price,
      status: PUBLICATION_STATUS[formData.publicationType] || 'available',
      published: true,
    };

    if (formData.postalCode?.trim()) payload.zip_code = formData.postalCode.trim();
    const latitude = sanitizeNumber(formData.latitude);
    if (latitude !== undefined) payload.latitude = latitude;
    const longitude = sanitizeNumber(formData.longitude);
    if (longitude !== undefined) payload.longitude = longitude;

    setLoading(true);
    try {
      const { property } = await createProperty(payload);

      if (formData.images?.length && property?.id) {
        await Promise.allSettled(
          formData.images.map((imageUrl, index) =>
            addPropertyImage(property.id, { imageUrl, isPrimary: index === 0 })
          )
        );
      }

      Alert.alert(
        '¡Éxito!',
        'La propiedad se ha publicado correctamente',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Properties', { refresh: Date.now(), lastCreated: property }),
          },
        ]
      );
    } catch (error) {
      const serverMessage = error?.response?.data?.message;
      const validationErrors = error?.response?.data?.errors;
      const detailed = Array.isArray(validationErrors)
        ? validationErrors.map((item) => `• ${item.msg}`).join('\n')
        : '';
      const fallbackMessage = 'No se pudo publicar la propiedad. Intenta nuevamente.';
      Alert.alert('Error', [serverMessage, detailed, fallbackMessage].filter(Boolean).join('\n'));
    } finally {
      setLoading(false);
    }
  };

  const openImageModal = () => {
    setImageUrlInput('');
    setImageUrlError(null);
    setShowImageModal(true);
  };

  const handleImageAdd = () => {
    if (formData.images.length >= 10) {
      setImageUrlError('Puedes cargar hasta 10 imágenes por propiedad.');
      return;
    }

    const url = imageUrlInput.trim();
    if (!url) {
      setImageUrlError('Ingresa la URL de la imagen.');
      return;
    }

    const isValid = /^https?:\/\//i.test(url);
    if (!isValid) {
      setImageUrlError('La URL debe comenzar con http:// o https://');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, url],
    }));
    setShowImageModal(false);
  };

  const addImage = () => {
    if (Platform.OS === 'web') {
      openImageModal();
      return;
    }

    openImageModal();
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {steps.map((step) => (
        <View key={step.number} style={styles.stepContainer}>
          <View style={[
            styles.stepCircle,
            currentStep >= step.number && styles.stepCircleActive
          ]}>
            <Text style={[
              styles.stepNumber,
              currentStep >= step.number && styles.stepNumberActive
            ]}>
              {step.number}
            </Text>
          </View>
          <Text style={[
            styles.stepTitle,
            currentStep >= step.number && styles.stepTitleActive
          ]}>
            {step.title}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderBasicInfo = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepHeader}>Información Básica</Text>
      
      <TextField
        label="Título de la publicación *"
        value={formData.title}
        onChangeText={(value) => handleInputChange('title', value)}
        placeholder="Ej: Hermosa casa de 3 dormitorios con jardín"
      />

      <TextField
        label="Descripción"
        value={formData.description}
        onChangeText={(value) => handleInputChange('description', value)}
        placeholder="Describe las características principales de la propiedad"
        multiline
        numberOfLines={4}
      />

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Tipo de Propiedad</Text>
        <View style={styles.optionsGrid}>
          {PROPERTY_TYPES.map((type) => (
            <TouchableOpacity
              key={type.key}
              style={[
                styles.optionCard,
                formData.propertyType === type.key && styles.optionCardActive
              ]}
              onPress={() => handleInputChange('propertyType', type.key)}
            >
              <Text style={styles.optionIcon}>{type.icon}</Text>
              <Text style={[
                styles.optionLabel,
                formData.propertyType === type.key && styles.optionLabelActive
              ]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Tipo de Publicación</Text>
        <View style={styles.optionsRow}>
          {PUBLICATION_TYPES.map((type) => (
            <TouchableOpacity
              key={type.key}
              style={[
                styles.optionCard,
                formData.publicationType === type.key && styles.optionCardActive
              ]}
              onPress={() => handleInputChange('publicationType', type.key)}
            >
              <Text style={styles.optionIcon}>{type.icon}</Text>
              <Text style={[
                styles.optionLabel,
                formData.publicationType === type.key && styles.optionLabelActive
              ]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderLocation = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepHeader}>Ubicación</Text>
      
      <View style={styles.row}>
        <View style={[styles.inputContainer, { flex: 2 }]}>
          <TextField
            label="Calle *"
            value={formData.street}
            onChangeText={(value) => handleInputChange('street', value)}
            placeholder="Nombre de la calle"
          />
        </View>
        <View style={[styles.inputContainer, { flex: 1, marginLeft: 10 }]}>
          <TextField
            label="Número"
            value={formData.number}
            onChangeText={(value) => handleInputChange('number', value)}
            placeholder="123"
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.inputContainer, { flex: 1 }]}>
          <TextField
            label="Ciudad *"
            value={formData.city}
            onChangeText={(value) => handleInputChange('city', value)}
            placeholder="Buenos Aires"
          />
        </View>
        <View style={[styles.inputContainer, { flex: 1, marginLeft: 10 }]}>
          <TextField
            label="Provincia *"
            value={formData.province}
            onChangeText={(value) => handleInputChange('province', value)}
            placeholder="CABA"
          />
        </View>
      </View>

      <TextField
        label="Código Postal"
        value={formData.postalCode}
        onChangeText={(value) => handleInputChange('postalCode', value)}
        placeholder="1234"
        keyboardType="numeric"
      />

      <View style={styles.row}>
        <View style={[styles.inputContainer, { flex: 1 }]}>
          <TextField
            label="Latitud"
            value={formData.latitude}
            onChangeText={(value) => handleInputChange('latitude', value)}
            placeholder="-34.6037"
            keyboardType="numeric"
          />
        </View>
        <View style={[styles.inputContainer, { flex: 1, marginLeft: 10 }]}>
          <TextField
            label="Longitud"
            value={formData.longitude}
            onChangeText={(value) => handleInputChange('longitude', value)}
            placeholder="-58.3816"
            keyboardType="numeric"
          />
        </View>
      </View>
    </View>
  );

  const renderCharacteristics = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepHeader}>Características</Text>
      
      <View style={styles.row}>
        <View style={[styles.inputContainer, { flex: 1 }]}>
          <TextField
            label="Dormitorios"
            value={formData.rooms}
            onChangeText={(value) => handleInputChange('rooms', value)}
            placeholder="3"
            keyboardType="numeric"
          />
        </View>
        <View style={[styles.inputContainer, { flex: 1, marginLeft: 10 }]}>
          <TextField
            label="Baños"
            value={formData.bathrooms}
            onChangeText={(value) => handleInputChange('bathrooms', value)}
            placeholder="2"
            keyboardType="numeric"
          />
        </View>
      </View>

      <TextField
        label="Superficie (m²)"
        value={formData.area}
        onChangeText={(value) => handleInputChange('area', value)}
        placeholder="120"
        keyboardType="numeric"
      />

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Amenities</Text>
        <View style={styles.amenitiesGrid}>
          {[
            { key: 'parking', label: 'Cochera', icon: '🚗' },
            { key: 'balcony', label: 'Balcón', icon: '🌅' },
            { key: 'garden', label: 'Jardín', icon: '🌱' },
            { key: 'pool', label: 'Pileta', icon: '🏊' },
            { key: 'elevator', label: 'Ascensor', icon: '🛗' },
          ].map((amenity) => (
            <TouchableOpacity
              key={amenity.key}
              style={[
                styles.amenityCard,
                formData[amenity.key] && styles.amenityCardActive
              ]}
              onPress={() => handleInputChange(amenity.key, !formData[amenity.key])}
            >
              <Text style={styles.amenityIcon}>{amenity.icon}</Text>
              <Text style={[
                styles.amenityLabel,
                formData[amenity.key] && styles.amenityLabelActive
              ]}>
                {amenity.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderPrice = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepHeader}>Precio</Text>
      
      <View style={styles.row}>
        <View style={[styles.inputContainer, { flex: 1 }]}>
          <TextField
            label="Precio *"
            value={formData.price}
            onChangeText={(value) => handleInputChange('price', value)}
            placeholder="250000"
            keyboardType="numeric"
          />
        </View>
        <View style={[styles.inputContainer, { flex: 1, marginLeft: 10 }]}>
          <Text style={styles.inputLabel}>Moneda</Text>
          <View style={styles.currencySelector}>
            {CURRENCIES.map((currency) => (
              <TouchableOpacity
                key={currency.key}
                style={[
                  styles.currencyOption,
                  formData.currency === currency.key && styles.currencyOptionActive
                ]}
                onPress={() => handleInputChange('currency', currency.key)}
              >
                <Text style={[
                  styles.currencyText,
                  formData.currency === currency.key && styles.currencyTextActive
                ]}>
                  {currency.symbol}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <TextField
        label="Expensas (opcional)"
        value={formData.expenses}
        onChangeText={(value) => handleInputChange('expenses', value)}
        placeholder="15000"
        keyboardType="numeric"
      />

      <View style={styles.priceInfo}>
        <Text style={styles.priceInfoTitle}>💡 Consejos para el precio</Text>
        <Text style={styles.priceInfoText}>
          • Investiga precios similares en la zona{'\n'}
          • Considera el estado y las amenidades{'\n'}
          • Incluye gastos adicionales si aplican
        </Text>
      </View>
    </View>
  );

  const renderImages = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepHeader}>Imágenes</Text>
      
      <View style={styles.imagesContainer}>
        {formData.images.map((image, index) => (
          <View key={index} style={styles.imageItem}>
            <Image source={{ uri: image }} style={styles.imagePreview} />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => removeImage(index)}
            >
              <Text style={styles.removeImageText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
        
        {formData.images.length < 10 && (
          <TouchableOpacity style={styles.addImageButton} onPress={addImage}>
            <Text style={styles.addImageIcon}>📸</Text>
            <Text style={styles.addImageText}>Agregar Imagen</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.imageInfo}>
        <Text style={styles.imageInfoTitle}>📷 Consejos para las fotos</Text>
        <Text style={styles.imageInfoText}>
          • Toma fotos con buena iluminación{'\n'}
          • Incluye diferentes ángulos de cada habitación{'\n'}
          • Muestra las amenidades (cochera, jardín, etc.){'\n'}
          • Máximo 10 imágenes por propiedad
        </Text>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderBasicInfo();
      case 2: return renderLocation();
      case 3: return renderCharacteristics();
      case 4: return renderPrice();
      case 5: return renderImages();
      default: return renderBasicInfo();
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Atrás</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Publicar Propiedad</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderCurrentStep()}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        {currentStep > 1 && (
          <TouchableOpacity style={styles.previousButton} onPress={handlePrevious}>
            <Text style={styles.previousButtonText}>Anterior</Text>
          </TouchableOpacity>
        )}
        
        {currentStep < steps.length ? (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Siguiente</Text>
          </TouchableOpacity>
        ) : (
          <PrimaryButton
            title="Publicar Propiedad"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
          />
        )}
      </View>

      <Modal
        animationType="slide"
        transparent
        visible={showImageModal}
        onRequestClose={() => setShowImageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Agregar imagen</Text>
            <Text style={styles.modalSubtitle}>
              Ingresa una URL pública de imagen (por ejemplo, de un sitio de fotos o un hosting propio).
            </Text>
            <TextInput
              placeholder="https://..."
              placeholderTextColor={colors.muted}
              value={imageUrlInput}
              onChangeText={(text) => {
                setImageUrlInput(text);
                setImageUrlError(null);
              }}
              autoCapitalize="none"
              keyboardType="url"
              style={styles.modalInput}
            />
            {imageUrlError ? <Text style={styles.modalError}>{imageUrlError}</Text> : null}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalSecondaryButton} onPress={() => setShowImageModal(false)}>
                <Text style={styles.modalSecondaryText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalPrimaryButton} onPress={handleImageAdd}>
                <Text style={styles.modalPrimaryText}>Agregar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    padding: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.card,
  },
  headerSpacer: {
    width: 60,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stepContainer: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.bgSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepCircleActive: {
    backgroundColor: colors.primary,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.muted,
  },
  stepNumberActive: {
    color: colors.card,
  },
  stepTitle: {
    fontSize: 10,
    color: colors.muted,
    textAlign: 'center',
  },
  stepTitleActive: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  stepContent: {
    flex: 1,
  },
  stepHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
  },
  sectionContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  optionCard: {
    width: (width - 80) / 3,
    padding: 15,
    backgroundColor: colors.bgSecondary,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardActive: {
    backgroundColor: colors.primary,
    borderColor: colors.secondary,
  },
  optionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  optionLabelActive: {
    color: colors.card,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  inputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  currencySelector: {
    flexDirection: 'row',
    backgroundColor: colors.bgSecondary,
    borderRadius: 8,
    padding: 4,
  },
  currencyOption: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  currencyOptionActive: {
    backgroundColor: colors.primary,
  },
  currencyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textSecondary,
  },
  currencyTextActive: {
    color: colors.card,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  amenityCard: {
    width: (width - 80) / 2,
    padding: 15,
    backgroundColor: colors.bgSecondary,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  amenityCardActive: {
    backgroundColor: colors.accent,
    borderColor: colors.primary,
  },
  amenityIcon: {
    fontSize: 20,
    marginBottom: 8,
  },
  amenityLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  amenityLabelActive: {
    color: colors.card,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  imageItem: {
    width: (width - 80) / 2,
    height: 120,
    marginBottom: 15,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: 'bold',
  },
  addImageButton: {
    width: (width - 80) / 2,
    height: 120,
    backgroundColor: colors.bgSecondary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  addImageIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  addImageText: {
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
  },
  priceInfo: {
    backgroundColor: colors.bgSecondary,
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  priceInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  priceInfoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  imageInfo: {
    backgroundColor: colors.bgSecondary,
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  imageInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  imageInfoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  previousButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.bgSecondary,
    borderRadius: 8,
  },
  previousButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  nextButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.card,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
    marginBottom: 8,
  },
  modalError: {
    color: colors.danger,
    fontSize: 13,
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  modalSecondaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: colors.bgSecondary,
  },
  modalSecondaryText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  modalPrimaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    marginLeft: 12,
  },
  modalPrimaryText: {
    fontSize: 15,
    color: colors.card,
    fontWeight: '700',
  },
});
