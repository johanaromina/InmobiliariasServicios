const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'fixar',
  multipleStatements: true
};

async function seedDatabase() {
  let connection;
  
  try {
    // Connect to MySQL
    connection = await mysql.createConnection(dbConfig);
    console.log('🔌 Connected to MySQL database');

    // Read and execute schema
    const fs = require('fs');
    const schema = fs.readFileSync('./db/schema.sql', 'utf8');
    await connection.execute(schema);
    console.log('📋 Database schema created');

    // Hash passwords
    const hashedPassword = await bcrypt.hash('123456', 10);
    const adminPassword = await bcrypt.hash('admin123', 10);

    // Insert users
    const users = [
      {
        email: 'demo@demo.com',
        password: hashedPassword,
        name: 'Usuario Demo',
        phone: '+5491234567890',
        role: 'property_manager'
      },
      {
        email: 'admin@fixar.com',
        password: adminPassword,
        name: 'Administrador',
        phone: '+5491234567891',
        role: 'admin'
      },
      {
        email: 'plomero@proveedor.com',
        password: hashedPassword,
        name: 'Juan Plomero',
        phone: '+5491234567892',
        role: 'provider'
      },
      {
        email: 'electricista@proveedor.com',
        password: hashedPassword,
        name: 'Carlos Electricista',
        phone: '+5491234567893',
        role: 'provider'
      },
      {
        email: 'inquilino@demo.com',
        password: hashedPassword,
        name: 'María Inquilina',
        phone: '+5491234567894',
        role: 'tenant'
      }
    ];

    for (const user of users) {
      await connection.execute(
        'INSERT INTO users (email, password, name, phone, role) VALUES (?, ?, ?, ?, ?)',
        [user.email, user.password, user.name, user.phone, user.role]
      );
    }
    console.log('👥 Users created');

    // Get user IDs
    const [userRows] = await connection.execute('SELECT id, email FROM users');
    const userIds = {};
    userRows.forEach(user => {
      userIds[user.email] = user.id;
    });

    // Insert properties
    const properties = [
      {
        user_id: userIds['demo@demo.com'],
        title: 'Departamento 2 ambientes - Centro',
        description: 'Hermoso departamento de 2 ambientes en el centro de la ciudad, con balcón y vista a la plaza principal.',
        address: 'Av. San Martín 1234, Centro',
        city: 'La Rioja',
        state: 'La Rioja',
        zip_code: '5300',
        latitude: -29.4131,
        longitude: -66.8563,
        property_type: 'apartment',
        bedrooms: 2,
        bathrooms: 1,
        area_sqm: 65.5,
        price: 45000,
        status: 'available',
        published: true
      },
      {
        user_id: userIds['demo@demo.com'],
        title: 'Casa 3 dormitorios - Barrio Norte',
        description: 'Casa familiar de 3 dormitorios con jardín y cochera, ideal para familias.',
        address: 'Calle 25 de Mayo 567, Barrio Norte',
        city: 'La Rioja',
        state: 'La Rioja',
        zip_code: '5300',
        latitude: -29.4200,
        longitude: -66.8500,
        property_type: 'house',
        bedrooms: 3,
        bathrooms: 2,
        area_sqm: 120.0,
        price: 75000,
        status: 'available',
        published: true
      },
      {
        user_id: userIds['demo@demo.com'],
        title: 'Oficina comercial - Zona céntrica',
        description: 'Oficina moderna de 80m² en zona céntrica, ideal para profesionales.',
        address: 'Av. Rivadavia 890, Centro',
        city: 'La Rioja',
        state: 'La Rioja',
        zip_code: '5300',
        latitude: -29.4100,
        longitude: -66.8600,
        property_type: 'office',
        bedrooms: 0,
        bathrooms: 1,
        area_sqm: 80.0,
        price: 35000,
        status: 'rented',
        published: false
      }
    ];

    for (const property of properties) {
      const [result] = await connection.execute(
        `INSERT INTO properties (user_id, title, description, address, city, state, zip_code, 
         latitude, longitude, property_type, bedrooms, bathrooms, area_sqm, price, status, published) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          property.user_id, property.title, property.description, property.address,
          property.city, property.state, property.zip_code, property.latitude,
          property.longitude, property.property_type, property.bedrooms,
          property.bathrooms, property.area_sqm, property.price, property.status, property.published
        ]
      );
    }
    console.log('🏠 Properties created');

    // Insert providers
    const providers = [
      {
        user_id: userIds['plomero@proveedor.com'],
        business_name: 'Plomería Express',
        description: 'Servicios de plomería 24/7, reparaciones urgentes y mantenimiento preventivo.',
        categories: JSON.stringify(['plumbing', 'maintenance']),
        service_areas: JSON.stringify(['La Rioja', 'Chilecito', 'Aimogasta']),
        hourly_rate: 2500.00,
        rating: 4.8,
        total_reviews: 15,
        is_verified: true,
        is_available: true
      },
      {
        user_id: userIds['electricista@proveedor.com'],
        business_name: 'Electricidad Segura',
        description: 'Instalaciones eléctricas, reparaciones y mantenimiento. Certificados y garantía.',
        categories: JSON.stringify(['electrical', 'maintenance']),
        service_areas: JSON.stringify(['La Rioja', 'Chamical', 'Villa Unión']),
        hourly_rate: 3000.00,
        rating: 4.6,
        total_reviews: 22,
        is_verified: true,
        is_available: true
      }
    ];

    for (const provider of providers) {
      await connection.execute(
        `INSERT INTO providers (user_id, business_name, description, categories, service_areas, 
         hourly_rate, rating, total_reviews, is_verified, is_available) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          provider.user_id, provider.business_name, provider.description,
          provider.categories, provider.service_areas, provider.hourly_rate,
          provider.rating, provider.total_reviews, provider.is_verified, provider.is_available
        ]
      );
    }
    console.log('🔧 Providers created');

    // Get property and provider IDs
    const [propertyRows] = await connection.execute('SELECT id FROM properties LIMIT 2');
    const [providerRows] = await connection.execute('SELECT id FROM providers');

    // Insert maintenance requests
    const requests = [
      {
        property_id: propertyRows[0].id,
        user_id: userIds['inquilino@demo.com'],
        title: 'Fuga de agua en baño',
        description: 'Hay una fuga de agua en la canilla del baño principal, gotea constantemente.',
        category: 'plumbing',
        priority: 'medium',
        status: 'pending',
        estimated_cost: 5000.00
      },
      {
        property_id: propertyRows[1].id,
        user_id: userIds['demo@demo.com'],
        title: 'Problema eléctrico en cocina',
        description: 'Los tomas de la cocina no funcionan, posible problema en el tablero.',
        category: 'electrical',
        priority: 'high',
        status: 'in_progress',
        provider_id: providerRows[1].id,
        estimated_cost: 8000.00,
        scheduled_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
      }
    ];

    for (const request of requests) {
      await connection.execute(
        `INSERT INTO maintenance_requests (property_id, user_id, title, description, category, 
         priority, status, estimated_cost, provider_id, scheduled_date) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          request.property_id, request.user_id, request.title, request.description,
          request.category, request.priority, request.status, request.estimated_cost,
          request.provider_id, request.scheduled_date
        ]
      );
    }
    console.log('🔧 Maintenance requests created');

    // Insert notifications
    const notifications = [
      {
        user_id: userIds['demo@demo.com'],
        title: 'Nueva solicitud de mantenimiento',
        message: 'Se ha creado una nueva solicitud de mantenimiento para tu propiedad.',
        type: 'info',
        related_entity_type: 'request',
        related_entity_id: 1
      },
      {
        user_id: userIds['inquilino@demo.com'],
        title: 'Solicitud en proceso',
        message: 'Tu solicitud de mantenimiento está siendo procesada por un proveedor.',
        type: 'info',
        related_entity_type: 'request',
        related_entity_id: 2
      }
    ];

    for (const notification of notifications) {
      await connection.execute(
        `INSERT INTO notifications (user_id, title, message, type, related_entity_type, related_entity_id) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          notification.user_id, notification.title, notification.message,
          notification.type, notification.related_entity_type, notification.related_entity_id
        ]
      );
    }
    console.log('🔔 Notifications created');

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Demo accounts:');
    console.log('👤 Property Manager: demo@demo.com / 123456');
    console.log('👤 Admin: admin@fixar.com / admin123');
    console.log('👤 Provider (Plumber): plomero@proveedor.com / 123456');
    console.log('👤 Provider (Electrician): electricista@proveedor.com / 123456');
    console.log('👤 Tenant: inquilino@demo.com / 123456');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run seed if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
