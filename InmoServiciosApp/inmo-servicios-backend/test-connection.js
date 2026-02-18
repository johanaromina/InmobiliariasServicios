const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  console.log('🔍 Verificando configuración de base de datos...\n');
  
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'fixar',
  };

  console.log('📋 Configuración actual:');
  console.log(`   Host: ${dbConfig.host}`);
  console.log(`   Port: ${dbConfig.port}`);
  console.log(`   User: ${dbConfig.user}`);
  console.log(`   Password: ${dbConfig.password ? '***' : '(vacía)'}`);
  console.log(`   Database: ${dbConfig.database}\n`);

  // Test 1: Conectar sin especificar base de datos
  console.log('1️⃣ Intentando conectar a MySQL (sin base de datos)...');
  try {
    const connection1 = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
    });
    console.log('   ✅ Conexión a MySQL exitosa\n');
    
    // Test 2: Verificar que la base de datos existe
    console.log('2️⃣ Verificando si la base de datos existe...');
    const [databases] = await connection1.execute('SHOW DATABASES');
    const dbExists = databases.some(db => db.Database === dbConfig.database);
    
    if (dbExists) {
      console.log(`   ✅ La base de datos '${dbConfig.database}' existe\n`);
    } else {
      console.log(`   ❌ La base de datos '${dbConfig.database}' NO existe`);
      console.log('   📋 Bases de datos disponibles:');
      databases.forEach(db => {
        console.log(`      - ${db.Database}`);
      });
      console.log('\n   💡 Solución: Crea la base de datos o actualiza DB_NAME en .env\n');
      await connection1.end();
      return;
    }
    
    await connection1.end();
    
    // Test 3: Conectar a la base de datos específica
    console.log(`3️⃣ Conectando a la base de datos '${dbConfig.database}'...`);
    const connection2 = await mysql.createConnection(dbConfig);
    console.log(`   ✅ Conexión a '${dbConfig.database}' exitosa\n`);
    
    // Test 4: Verificar tablas
    console.log('4️⃣ Verificando tablas...');
    const [tables] = await connection2.execute('SHOW TABLES');
    if (tables.length > 0) {
      console.log(`   ✅ Se encontraron ${tables.length} tablas:`);
      tables.forEach((table, index) => {
        const tableName = Object.values(table)[0];
        console.log(`      ${index + 1}. ${tableName}`);
      });
    } else {
      console.log('   ⚠️ No se encontraron tablas en la base de datos');
      console.log('   💡 Puede que necesites ejecutar el esquema SQL\n');
    }
    
    await connection2.end();
    
    console.log('\n✅ Todas las pruebas pasaron. La conexión está funcionando correctamente.\n');
    
  } catch (error) {
    console.error('\n❌ Error de conexión:', error.message);
    console.error('\n🔧 Posibles soluciones:');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('   1. Verifica que MySQL esté corriendo');
      console.error('   2. Verifica que el puerto sea correcto (por defecto 3306)');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('   1. Verifica el usuario y contraseña en el archivo .env');
      console.error('   2. Asegúrate de que el usuario tenga permisos');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('   1. La base de datos no existe');
      console.error('   2. Crea la base de datos o actualiza DB_NAME en .env');
    } else {
      console.error('   Revisa la configuración en el archivo .env');
    }
    
    console.error('\n📝 Configuración actual en .env:');
    console.error(`   DB_HOST=${process.env.DB_HOST || 'localhost'}`);
    console.error(`   DB_PORT=${process.env.DB_PORT || '3306'}`);
    console.error(`   DB_USER=${process.env.DB_USER || 'root'}`);
    console.error(`   DB_PASS=${process.env.DB_PASS || '(vacía)'}`);
    console.error(`   DB_NAME=${process.env.DB_NAME || 'fixar'}\n`);
    
    process.exit(1);
  }
}

testConnection();

