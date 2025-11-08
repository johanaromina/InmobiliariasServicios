// Wrapper para cargar react-native-maps de forma condicional
import { Platform } from 'react-native';

// Importar siempre el stub como fallback
import MapsStub from '../stubs/react-native-maps';

let MapView, Marker, Callout;

// En web, siempre usar el stub
if (Platform.OS === 'web') {
  MapView = MapsStub.default || MapsStub.MapView;
  Marker = MapsStub.Marker;
  Callout = MapsStub.Callout;
} else {
  // En móvil, intentar cargar react-native-maps real
  // Metro.config.js debería manejar la resolución en web
  try {
    // eslint-disable-next-line import/no-extraneous-dependencies
    const Maps = require('react-native-maps');
    if (Maps && (Maps.MapView || Maps.default)) {
      MapView = Maps.default || Maps.MapView;
      Marker = Maps.Marker;
      Callout = Maps.Callout;
    } else {
      // Fallback al stub si no está disponible
      MapView = MapsStub.default || MapsStub.MapView;
      Marker = MapsStub.Marker;
      Callout = MapsStub.Callout;
    }
  } catch (error) {
    // Si falla, usar el stub
    console.log('react-native-maps no disponible, usando stub');
    MapView = MapsStub.default || MapsStub.MapView;
    Marker = MapsStub.Marker;
    Callout = MapsStub.Callout;
  }
}

export { MapView, Marker, Callout };

