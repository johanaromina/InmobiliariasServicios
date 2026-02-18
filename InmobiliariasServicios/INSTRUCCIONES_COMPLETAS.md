# 🚀 InmoServiciosApp - Guía Completa de Instalación



## 📁 Estructura del Proyecto

```
InmoServiciosApp/
├── 📱 App Expo (ya existente)
│   ├── App.js
│   ├── src/
│   │   ├── screens/
│   │   ├── components/
│   │   ├── services/
│   │   └── navigation/
│   └── package.json
├── 🖥️ Backend Express + MySQL (nuevo)
│   ├── inmo-servicios-backend/
│   │   ├── src/
│   │   ├── db/
│   │   └── package.json
└── 📋 Archivos de configuración
    ├── setup-backend.bat (Windows)
    ├── setup-backend.sh (Linux/Mac)
    └── env.example
```

## 🛠️ Instalación Paso a Paso

### 1. Configurar Base de Datos MySQL

**Opción A: MySQL Local**
```sql
-- Conectar a MySQL como root
mysql -u root -p

-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS fixar;
USE fixar;

-- Ejecutar el esquema (desde la carpeta del backend)
source inmo-servicios-backend/db/schema.sql;
```

**Opción B: XAMPP/WAMP**
1. Iniciar Apache y MySQL
2. Abrir phpMyAdmin (http://localhost/phpmyadmin)
3. Crear base de datos `fixar`
4. Importar el archivo `inmo-servicios-backend/db/schema.sql`

### 2. Configurar Backend

**Windows:**
```cmd
# Ejecutar el script automático
setup-backend.bat
```

**Linux/Mac:**
```bash
# Hacer ejecutable y ejecutar
chmod +x setup-backend.sh
./setup-backend.sh
```

**Manual:**
```bash
cd inmo-servicios-backend
npm install
cp env.example .env
# Editar .env con tus credenciales de MySQL
npm run seed
npm run dev
```

### 3. Configurar App Móvil

```bash
# En la carpeta raíz del proyecto
cp env.example .env

# Editar .env con la URL del backend:
# EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/api

# Instalar dependencias
npm install

# Iniciar Expo
npm start
```

## 🔧 Configuración de URLs

### Para Desarrollo Web
```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

### Para Android Emulador
```env
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:3000/api
```

### Para Dispositivo Físico
```env
# Reemplazar con tu IP local
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:3000/api
```

## 🚀 Ejecutar el Proyecto

### Terminal 1 - Backend
```bash
cd inmo-servicios-backend
npm run dev
```
✅ Backend corriendo en: http://localhost:3000

### Terminal 2 - App Móvil
```bash
npm start
```
✅ Expo corriendo en: http://localhost:19006

## 👥 Usuarios Demo

| Rol | Email | Contraseña | Descripción |
|-----|-------|------------|-------------|
| **Property Manager** | demo@demo.com | 123456 | Gestor de propiedades |
| **Admin** | admin@fixar.com | admin123 | Administrador del sistema |
| **Provider (Plomero)** | plomero@proveedor.com | 123456 | Proveedor de servicios |
| **Provider (Electricista)** | electricista@proveedor.com | 123456 | Proveedor de servicios |
| **Tenant** | inquilino@demo.com | 123456 | Inquilino |

## 🧪 Probar la Aplicación

### 1. Health Check
```bash
curl http://localhost:3000/api/health
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@demo.com","password":"123456"}'
```

### 3. Listar Propiedades
```bash
curl -X GET http://localhost:3000/api/properties \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

## 📱 Funcionalidades de la App

### ✅ Implementadas
- **Autenticación**: Login/Registro con JWT
- **Navegación**: 6 tabs principales
- **Inmuebles**: CRUD completo con filtros
- **Solicitudes**: Crear y gestionar mantenimientos
- **Proveedores**: Búsqueda y filtros
- **Mapa**: Placeholder para ubicaciones
- **Perfil**: Gestión de usuario

### 🔄 Flujo de Trabajo
1. **Login** con usuario demo
2. **Ver inmuebles** en la pestaña "Inmuebles"
3. **Crear solicitud** desde "Mantenimientos"
4. **Buscar proveedores** en "Proveedores"
5. **Asignar proveedor** a la solicitud
6. **Seguir estado** del mantenimiento

## 🐛 Solución de Problemas

### Error de Conexión a MySQL
```bash
# Verificar que MySQL esté corriendo
mysql -u root -p

# Verificar credenciales en .env
DB_HOST=localhost
DB_USER=root
DB_PASS=tu_password
```

### Error de Puerto en Uso
```bash
# Cambiar puerto en .env
PORT=3001

# O matar proceso en puerto 3000
npx kill-port 3000
```

### Error de CORS en la App
```bash
# Verificar URL en .env de la app
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/api

# Para Android emulador usar:
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:3000/api
```

## 📊 Endpoints Principales

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrarse
- `GET /api/auth/me` - Perfil actual

### Inmuebles
- `GET /api/properties` - Listar (con filtros)
- `POST /api/properties` - Crear
- `PUT /api/properties/:id` - Actualizar
- `DELETE /api/properties/:id` - Eliminar

### Solicitudes
- `GET /api/requests` - Listar
- `POST /api/requests` - Crear
- `PATCH /api/requests/:id/status` - Cambiar estado
- `PATCH /api/requests/:id/assign` - Asignar proveedor

### Proveedores
- `GET /api/providers` - Listar (con filtros)
- `GET /api/providers/:id` - Detalle
- `PUT /api/providers/profile` - Actualizar perfil

## 🚀 Próximos Pasos

### Sprint 1 - Integración Completa
- [ ] Conectar login/registro real
- [ ] Implementar CRUD de inmuebles
- [ ] Activar mapa con ubicaciones reales

### Sprint 2 - Funcionalidades Avanzadas
- [ ] Sistema de notificaciones push
- [ ] Subida de imágenes
- [ ] Calendario de disponibilidad

### Sprint 3 - Optimizaciones
- [ ] Tests automatizados
- [ ] Docker para deployment
- [ ] Monitoreo y logs

## 📞 Soporte

Si tienes problemas:

1. **Verificar logs** del backend en la consola
2. **Revisar configuración** de .env
3. **Probar endpoints** con Postman/curl
4. **Revisar documentación** en README.md del backend

## 🎉 ¡Listo para Desarrollar!

Tu proyecto está completamente configurado y listo para usar. Puedes empezar a desarrollar nuevas funcionalidades o conectar con tu backend personalizado.

**¡Feliz coding! 🚀**
