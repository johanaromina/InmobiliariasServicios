const http = require('http');

function testLogin(email, password) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      email: email,
      password: password
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({ status: res.statusCode, data: response });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('🔐 Probando login...\n');
  
  const testUsers = [
    { email: 'demo@demo.com', password: '123456' },
    { email: 'admin@admin.com', password: 'admin123' },
    { email: 'test@test.com', password: '123456' },
  ];

  for (const user of testUsers) {
    try {
      console.log(`📧 Intentando login con: ${user.email}`);
      const result = await testLogin(user.email, user.password);
      
      if (result.status === 200) {
        console.log(`   ✅ Login exitoso!`);
        console.log(`   - Usuario: ${result.data.user?.nombre || 'N/A'}`);
        console.log(`   - Rol: ${result.data.user?.role || 'N/A'}`);
        console.log(`   - Token: ${result.data.token ? 'Recibido' : 'No recibido'}\n`);
      } else {
        console.log(`   ❌ Error: ${result.data.message || 'Error desconocido'}`);
        console.log(`   - Status: ${result.status}\n`);
      }
    } catch (error) {
      console.log(`   ❌ Error de conexión: ${error.message}\n`);
    }
  }
}

runTests();
