const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'inmobiliaria_mvp',
  multipleStatements: true
};

async function seedDatabase() {
  let connection;
  
  try {
    // Connect to MySQL
    connection = await mysql.createConnection(dbConfig);
    console.log('🔌 Connected to MySQL database');

    // Read and execute adapted schema
    const fs = require('fs');
    const schema = fs.readFileSync('./db/schema_adaptado.sql', 'utf8');
    await connection.execute(schema);
    console.log('📋 Database schema adapted');

    // Hash passwords
    const hashedPassword = await bcrypt.hash('123456', 10);
    const adminPassword = await bcrypt.hash('admin123', 10);

    // Get role IDs
    const [roles] = await connection.execute('SELECT id, nombre FROM roles');
    const roleMap = {};
    roles.forEach(role => {
      roleMap[role.nombre] = role.id;
    });

    // Insert users
    const users = [
      {
        nombre: 'Usuario Demo',
        email: 'demo@demo.com',
        telefono: '+5491234567890',
        hash_password: hashedPassword,
        rol_id: roleMap['propietario']
      },
      {
        nombre: 'Administrador',
        email: 'admin@fixar.com',
        telefono: '+5491234567891',
        hash_password: adminPassword,
        rol_id: roleMap['administrador']
      },
      {
        nombre: 'Juan Plomero',
        email: 'plomero@proveedor.com',
        telefono: '+5491234567892',
        hash_password: hashedPassword,
        rol_id: roleMap['proveedor']
      },
      {
        nombre: 'Carlos Electricista',
        email: 'electricista@proveedor.com',
        telefono: '+5491234567893',
        hash_password: hashedPassword,
        rol_id: roleMap['proveedor']
      },
      {
        nombre: 'María Inquilina',
        email: 'inquilino@demo.com',
        telefono: '+5491234567894',
        hash_password: hashedPassword,
        rol_id: roleMap['inquilino']
      }
    ];

    for (const user of users) {
      await connection.execute(
        'INSERT INTO usuarios (nombre, email, telefono, hash_password, rol_id) VALUES (?, ?, ?, ?, ?)',
        [user.nombre, user.email, user.telefono, user.hash_password, user.rol_id]
      );
    }
    console.log('👥 Users created');

    // Get user IDs
    const [userRows] = await connection.execute('SELECT id, email FROM usuarios');
    const userIds = {};
    userRows.forEach(user => {
      userIds[user.email] = user.id;
    });

    // Insert provider profiles
    const providerProfiles = [
      {
        usuario_id: userIds['plomero@proveedor.com'],
        bio: 'Servicios de plomería 24/7, reparaciones urgentes y mantenimiento preventivo.',
        reputacion: 4.8
      },
      {
        usuario_id: userIds['electricista@proveedor.com'],
        bio: 'Instalaciones eléctricas, reparaciones y mantenimiento. Certificados y garantía.',
        reputacion: 4.6
      }
    ];

    for (const profile of providerProfiles) {
      await connection.execute(
        'INSERT INTO proveedores_perfil (usuario_id, bio, reputacion) VALUES (?, ?, ?)',
        [profile.usuario_id, profile.bio, profile.reputacion]
      );
    }
    console.log('🔧 Provider profiles created');

    // Get category IDs
    const [categories] = await connection.execute('SELECT id, nombre FROM categorias_servicio');
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.nombre] = cat.id;
    });

    // Insert provider categories
    const providerCategories = [
      { proveedor_id: userIds['plomero@proveedor.com'], categoria_id: categoryMap['Plomería'] },
      { proveedor_id: userIds['electricista@proveedor.com'], categoria_id: categoryMap['Electricidad'] }
    ];

    for (const pc of providerCategories) {
      await connection.execute(
        'INSERT INTO proveedores_categorias (proveedor_id, categoria_id) VALUES (?, ?)',
        [pc.proveedor_id, pc.categoria_id]
      );
    }
    console.log('📋 Provider categories assigned');

    // Insert addresses
    const addresses = [
      {
        calle: 'Av. San Martín',
        numero: '1234',
        ciudad: 'La Rioja',
        provincia: 'La Rioja',
        codigo_postal: '5300',
        lat: -29.4131,
        lng: -66.8563
      },
      {
        calle: 'Calle 25 de Mayo',
        numero: '567',
        ciudad: 'La Rioja',
        provincia: 'La Rioja',
        codigo_postal: '5300',
        lat: -29.4200,
        lng: -66.8500
      },
      {
        calle: 'Av. Rivadavia',
        numero: '890',
        ciudad: 'La Rioja',
        provincia: 'La Rioja',
        codigo_postal: '5300',
        lat: -29.4100,
        lng: -66.8600
      }
    ];

    const addressIds = [];
    for (const address of addresses) {
      const [result] = await connection.execute(
        'INSERT INTO direcciones (calle, numero, ciudad, provincia, codigo_postal, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [address.calle, address.numero, address.ciudad, address.provincia, address.codigo_postal, address.lat, address.lng]
      );
      addressIds.push(result.insertId);
    }
    console.log('📍 Addresses created');

    // Insert properties
    const properties = [
      {
        propietario_id: userIds['demo@demo.com'],
        administrador_id: userIds['demo@demo.com'],
        direccion_id: addressIds[0],
        tipo: 'departamento',
        ambientes: 2,
        banos: 1,
        superficie_m2: 65.5,
        descripcion: 'Hermoso departamento de 2 ambientes en el centro de la ciudad, con balcón y vista a la plaza principal.',
        estado: 'activo'
      },
      {
        propietario_id: userIds['demo@demo.com'],
        administrador_id: userIds['demo@demo.com'],
        direccion_id: addressIds[1],
        tipo: 'casa',
        ambientes: 3,
        banos: 2,
        superficie_m2: 120.0,
        descripcion: 'Casa familiar de 3 dormitorios con jardín y cochera, ideal para familias.',
        estado: 'activo'
      },
      {
        propietario_id: userIds['demo@demo.com'],
        administrador_id: userIds['demo@demo.com'],
        direccion_id: addressIds[2],
        tipo: 'oficina',
        ambientes: 0,
        banos: 1,
        superficie_m2: 80.0,
        descripcion: 'Oficina moderna de 80m² en zona céntrica, ideal para profesionales.',
        estado: 'mantenimiento'
      }
    ];

    const propertyIds = [];
    for (const property of properties) {
      const [result] = await connection.execute(
        'INSERT INTO inmuebles (propietario_id, administrador_id, direccion_id, tipo, ambientes, banos, superficie_m2, descripcion, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [property.propietario_id, property.administrador_id, property.direccion_id, property.tipo, property.ambientes, property.banos, property.superficie_m2, property.descripcion, property.estado]
      );
      propertyIds.push(result.insertId);
    }
    console.log('🏠 Properties created');

    // Insert publications
    const publications = [
      {
        inmueble_id: propertyIds[0],
        tipo: 'alquiler',
        precio: 45000.00,
        moneda: 'ARS',
        estado: 'publicada',
        fecha_publicacion: new Date()
      },
      {
        inmueble_id: propertyIds[1],
        tipo: 'alquiler',
        precio: 75000.00,
        moneda: 'ARS',
        estado: 'publicada',
        fecha_publicacion: new Date()
      },
      {
        inmueble_id: propertyIds[2],
        tipo: 'alquiler',
        precio: 35000.00,
        moneda: 'ARS',
        estado: 'no_disponible',
        fecha_publicacion: new Date()
      }
    ];

    for (const pub of publications) {
      await connection.execute(
        'INSERT INTO publicaciones (inmueble_id, tipo, precio, moneda, estado, fecha_publicacion) VALUES (?, ?, ?, ?, ?, ?)',
        [pub.inmueble_id, pub.tipo, pub.precio, pub.moneda, pub.estado, pub.fecha_publicacion]
      );
    }
    console.log('📰 Publications created');

    // Insert maintenance requests
    const requests = [
      {
        inmueble_id: propertyIds[0],
        solicitante_id: userIds['inquilino@demo.com'],
        categoria_id: categoryMap['Plomería'],
        titulo: 'Fuga de agua en baño',
        descripcion: 'Hay una fuga de agua en la canilla del baño principal, gotea constantemente.',
        prioridad: 'media',
        estado: 'pendiente',
        responsabilidad_pago: 'propietario'
      },
      {
        inmueble_id: propertyIds[1],
        solicitante_id: userIds['demo@demo.com'],
        proveedor_asignado_id: userIds['electricista@proveedor.com'],
        categoria_id: categoryMap['Electricidad'],
        titulo: 'Problema eléctrico en cocina',
        descripcion: 'Los tomas de la cocina no funcionan, posible problema en el tablero.',
        prioridad: 'alta',
        estado: 'asignada',
        responsabilidad_pago: 'propietario'
      }
    ];

    for (const request of requests) {
      await connection.execute(
        'INSERT INTO solicitudes_mantenimiento (inmueble_id, solicitante_id, proveedor_asignado_id, categoria_id, titulo, descripcion, prioridad, estado, responsabilidad_pago) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [request.inmueble_id, request.solicitante_id, request.proveedor_asignado_id, request.categoria_id, request.titulo, request.descripcion, request.prioridad, request.estado, request.responsabilidad_pago]
      );
    }
    console.log('🔧 Maintenance requests created');

    // Insert notifications
    const notifications = [
      {
        usuario_id: userIds['demo@demo.com'],
        tipo: 'nueva_solicitud',
        mensaje: 'Se ha creado una nueva solicitud de mantenimiento para tu propiedad.',
        leida: false
      },
      {
        usuario_id: userIds['inquilino@demo.com'],
        tipo: 'solicitud_asignada',
        mensaje: 'Tu solicitud de mantenimiento está siendo procesada por un proveedor.',
        leida: false
      }
    ];

    for (const notification of notifications) {
      await connection.execute(
        'INSERT INTO notificaciones (usuario_id, tipo, mensaje, leida) VALUES (?, ?, ?, ?)',
        [notification.usuario_id, notification.tipo, notification.mensaje, notification.leida]
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
