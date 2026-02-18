# 🔧 Solución: Problema de Conexión con la Base de Datos

## ✅ Estado Actual

He verificado y solucionado los siguientes puntos:

### 1. **Archivo .env creado** ✅
- Se creó el archivo `.env` en `inmo-servicios-backend/` con la configuración correcta
- Configuración actual:
  ```
  DB_HOST=localhost
  DB_PORT=3306
  DB_USER=root
  DB_PASS=1234
  DB_NAME=inmobiliaria_mvp
  ```

### 2. **Conexión a la Base de Datos** ✅
- La conexión a MySQL está funcionando correctamente
- La base de datos `inmobiliaria_mvp` existe y tiene 17 tablas
- Todas las tablas necesarias están presentes

### 3. **Usuarios en la Base de Datos** ✅
- Hay 4 usuarios activos en la base de datos:
  - `demo@demo.com` (propietario) - ✅ **Funciona con contraseña: 123456**
  - `admin@admin.com` (administrador) - ⚠️ Contraseña desconocida
  - `test@test.com` (inquilino) - ⚠️ Contraseña desconocida
  - `nuevo@test.com` (inquilino) - ⚠️ Contraseña desconocida

### 4. **Servidor Backend** ✅
- El servidor está corriendo en `http://localhost:3000`
- El endpoint `/api/health` responde correctamente
- El endpoint `/api/auth/login` funciona correctamente

## 🔍 Diagnóstico del Problema

El problema **NO es la conexión a la base de datos**. El backend está funcionando correctamente. El problema puede estar en:

1. **URL del API en el frontend**: La app móvil puede estar intentando conectarse a una IP incorrecta
2. **Credenciales incorrectas**: El usuario puede estar usando credenciales que no existen
3. **CORS o red**: Problemas de conectividad entre la app y el backend

## 🚀 Soluciones

### Solución 1: Verificar que el Backend esté Corriendo

```bash
cd inmo-servicios-backend
npm run dev
```

Deberías ver:
```
✅ Database connected successfully
🚀 Server running on http://0.0.0.0:3000
```

### Solución 2: Usar las Credenciales Correctas

**Usuario que funciona:**
- Email: `demo@demo.com`
- Contraseña: `123456`
- Rol: `propietario`

### Solución 3: Verificar la URL del API en el Frontend

El archivo `InmobiliariasServicios/src/services/api.js` tiene esta configuración:

```javascript
// Para Android emulador
return 'http://192.168.100.9:3000/api';
```

**Verifica:**
1. Que la IP `192.168.100.9` sea la IP correcta de tu computadora
2. Que el backend esté accesible desde esa IP
3. Que no haya firewall bloqueando la conexión

**Para encontrar tu IP:**
- Windows: `ipconfig` (busca "IPv4 Address")
- Mac/Linux: `ifconfig` o `ip addr`

### Solución 4: Probar la Conexión desde la App

1. Abre la consola del navegador o los logs de la app
2. Busca mensajes de error relacionados con:
   - "Network Error"
   - "Connection refused"
   - "ECONNREFUSED"

### Solución 5: Crear un Nuevo Usuario

Si necesitas crear un nuevo usuario, puedes:

1. **Desde la app**: Usa la pantalla de registro
2. **Desde el backend**: Ejecuta el seed adaptado:
   ```bash
   cd inmo-servicios-backend
   node db/seed_adaptado.js
   ```

## 🧪 Scripts de Diagnóstico

He creado scripts útiles para diagnosticar problemas:

### 1. Verificar Conexión a la Base de Datos
```bash
cd inmo-servicios-backend
node test-connection.js
```

### 2. Verificar Usuarios
```bash
cd inmo-servicios-backend
node check-users.js
```

### 3. Probar Login
```bash
cd inmo-servicios-backend
node test-login.js
```

## 📝 Pasos para Resolver el Problema

1. **Verifica que el backend esté corriendo:**
   ```bash
   curl http://localhost:3000/api/health
   ```
   Debería responder: `{"status":"OK",...}`

2. **Verifica que puedas hacer login desde el backend:**
   ```bash
   cd inmo-servicios-backend
   node test-login.js
   ```

3. **Verifica la URL del API en el frontend:**
   - Abre `InmobiliariasServicios/src/services/api.js`
   - Asegúrate de que la IP sea correcta
   - Si estás en web, debería ser `http://localhost:3000/api`

4. **Revisa los logs del backend:**
   - Cuando intentas hacer login desde la app, deberías ver logs en la consola del backend
   - Si no ves logs, el frontend no está llegando al backend

5. **Revisa los logs del frontend:**
   - Abre la consola del navegador (F12) o los logs de Expo
   - Busca errores relacionados con la conexión

## 🎯 Credenciales de Prueba

**Usuario que definitivamente funciona:**
- Email: `demo@demo.com`
- Contraseña: `123456`
- Rol: `propietario`

## ⚠️ Problemas Comunes

### Error: "Network Error"
- **Causa**: El frontend no puede alcanzar el backend
- **Solución**: Verifica la IP y que el backend esté corriendo

### Error: "Invalid credentials"
- **Causa**: Email o contraseña incorrectos
- **Solución**: Usa `demo@demo.com` / `123456`

### Error: "Connection refused"
- **Causa**: El backend no está corriendo o el puerto está bloqueado
- **Solución**: Inicia el backend con `npm run dev`

### Error: "Database connection failed"
- **Causa**: MySQL no está corriendo o las credenciales son incorrectas
- **Solución**: Verifica MySQL y el archivo `.env`

## 📞 Próximos Pasos

1. ✅ Archivo `.env` creado
2. ✅ Conexión a BD verificada
3. ✅ Backend funcionando
4. ⏳ Verificar conectividad desde el frontend
5. ⏳ Ajustar IP del API si es necesario

## 🔗 Enlaces Útiles

- Health Check: http://localhost:3000/api/health
- Backend corriendo en: http://localhost:3000
- Base de datos: `inmobiliaria_mvp` en MySQL

---

**Nota**: Si después de seguir estos pasos aún tienes problemas, comparte:
1. Los logs del backend cuando intentas hacer login
2. Los logs del frontend (consola del navegador o Expo)
3. El mensaje de error exacto que ves

