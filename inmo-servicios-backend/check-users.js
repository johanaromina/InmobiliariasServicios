const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkUsers() {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'inmobiliaria_mvp',
  };

  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('🔍 Verificando usuarios en la base de datos...\n');

    // Verificar estructura de la tabla usuarios
    console.log('1️⃣ Estructura de la tabla usuarios:');
    const [columns] = await connection.execute('DESCRIBE usuarios');
    console.log('   Columnas:');
    columns.forEach(col => {
      console.log(`      - ${col.Field} (${col.Type})`);
    });
    console.log('');

    // Verificar roles
    console.log('2️⃣ Roles disponibles:');
    const [roles] = await connection.execute('SELECT * FROM roles');
    roles.forEach(role => {
      console.log(`      - ${role.id}: ${role.nombre}`);
    });
    console.log('');

    // Verificar usuarios
    console.log('3️⃣ Usuarios en la base de datos:');
    const [users] = await connection.execute(
      'SELECT u.id, u.email, u.nombre, u.telefono, u.estado, r.nombre as rol, u.hash_password IS NOT NULL as tiene_password FROM usuarios u LEFT JOIN roles r ON u.rol_id = r.id'
    );
    
    if (users.length === 0) {
      console.log('   ⚠️ No hay usuarios en la base de datos');
      console.log('   💡 Necesitas ejecutar el seed para crear usuarios de prueba\n');
    } else {
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.nombre} (${user.email})`);
        console.log(`      - Rol: ${user.rol || 'sin rol'}`);
        console.log(`      - Estado: ${user.estado || 'sin estado'}`);
        console.log(`      - Tiene password: ${user.tiene_password ? 'Sí' : 'No'}`);
        console.log('');
      });
    }

    // Verificar usuarios activos
    console.log('4️⃣ Usuarios activos (pueden hacer login):');
    const [activeUsers] = await connection.execute(
      'SELECT u.id, u.email, u.nombre, r.nombre as rol FROM usuarios u LEFT JOIN roles r ON u.rol_id = r.id WHERE u.estado = "activo" AND u.hash_password IS NOT NULL'
    );
    
    if (activeUsers.length === 0) {
      console.log('   ❌ No hay usuarios activos con contraseña');
      console.log('   💡 Necesitas:');
      console.log('      1. Ejecutar el seed para crear usuarios');
      console.log('      2. O actualizar el estado de los usuarios a "activo"');
      console.log('      3. O asegurarte de que tengan hash_password\n');
    } else {
      console.log(`   ✅ Hay ${activeUsers.length} usuario(s) activo(s):`);
      activeUsers.forEach((user, index) => {
        console.log(`      ${index + 1}. ${user.email} (${user.rol})`);
      });
      console.log('');
    }

    await connection.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkUsers();

