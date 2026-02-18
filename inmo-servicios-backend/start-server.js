const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: '*', // Permitir todos los orígenes temporalmente
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    message: 'Servidor Express corriendo correctamente'
  });
});

// Routes
try {
  const db = require('./src/db');
  const authRoutes = require('./src/routes/auth');
  const propertiesRoutes = require('./src/routes/properties');
  const requestsRoutes = require('./src/routes/requests');
  const providersRoutes = require('./src/routes/providers');

  app.use('/api/auth', authRoutes);
  app.use('/api/properties', propertiesRoutes);
  app.use('/api/requests', requestsRoutes);
  app.use('/api/providers', providersRoutes);
  
  console.log('✅ Rutas cargadas correctamente');
} catch (error) {
  console.error('⚠️ Error cargando rutas:', error.message);
  console.log('⚠️ El servidor se iniciará solo con health check');
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor Express corriendo en http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Acceso desde red: http://0.0.0.0:${PORT}/api/health`);
});

