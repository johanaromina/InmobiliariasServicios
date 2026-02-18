// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Guardar el resolver original
const defaultResolver = config.resolver.resolveRequest;

// Configuración para excluir react-native-maps en web
config.resolver.resolveRequest = (context, realModuleName, platform, moduleName) => {
  // Si estamos en web y se intenta importar react-native-maps, usar el stub
  if (platform === 'web' && realModuleName === 'react-native-maps') {
    return {
      filePath: path.resolve(__dirname, 'src/stubs/react-native-maps.js'),
      type: 'sourceFile',
    };
  }
  
  // Usar la resolución por defecto para todo lo demás
  if (defaultResolver) {
    return defaultResolver(context, realModuleName, platform, moduleName);
  }
  
  return context.resolveRequest(context, realModuleName, platform);
};

module.exports = config;

