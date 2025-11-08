# 🎯 InmoServiciosApp - Adaptado para tu Base de Datos Existente

## 📋 Resumen Ejecutivo

He adaptado completamente el backend para que funcione con tu base de datos existente `inmobiliaria_mvp` sin necesidad de crear una nueva base de datos. Esto significa que puedes usar tu esquema actual y mantener todos tus datos existentes.

## 🔄 ¿Qué Cambié?

### ✅ **Adaptación Completa del Backend**
- **Base de datos**: Cambiada de `fixar` a `inmobiliaria_mvp`
- **Tablas**: Mapeadas a tu esquema existente
- **Rutas**: Adaptadas para usar tus tablas
- **Seed**: Creado específicamente para tu base de datos

### ✅ **Mapeo de Tablas**
| Función | Mi Esquema Original | Tu Esquema Existente |
|---------|-------------------|---------------------|
| Usuarios | `users` | `usuarios` |
| Inmuebles | `properties` | `inmuebles` + `direcciones` |
| Solicitudes | `maintenance_requests` | `solicitudes_mantenimiento` |
| Proveedores | `providers` | `proveedores_perfil` |
| Imágenes | `property_images` | `inmuebles_imagenes` |
| Roles | `roles` (hardcoded) | `roles` (tabla existente) |

### ✅ **Vistas Creadas para Facilitar Consultas**
- `vista_proveedores` - Proveedores con información completa
- `vista_inmuebles` - Inmuebles con direcciones
- `vista_solicitudes` - Solicitudes con información completa

## 🚀 Instalación Súper Fácil

### **Opción 1: Script Automático (Recomendado)**

**Windows:**
```cmd
setup-con-base-datos-existente.bat
```

**Linux/Mac:**
```bash
chmod +x setup-con-base-datos-existente.sh
./setup-con-base-datos-existente.sh
```

### **Opción 2: Manual**
```bash
# 1. Aplicar esquema adaptado
mysql -u root -p inmobiliaria_mvp < inmo-servicios-backend/db/schema_adaptado.sql

# 2. Configurar backend
cd inmo-servicios-backend
cp env.example .env
# Editar .env con tus credenciales

# 3. Instalar y poblar
npm install
npm run seed

# 4. Iniciar
npm run dev
```

## 🔧 Configuración del .env

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=tu_password
DB_NAME=inmobiliaria_mvp

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=super_secret_key_change_me_in_production
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:19006
```

## 📊 Datos de Prueba Incluidos

### Usuarios Demo
| Email | Contraseña | Rol | Descripción |
|-------|------------|-----|-------------|
| demo@demo.com | 123456 | propietario | Gestor de propiedades |
| admin@fixar.com | admin123 | administrador | Administrador del sistema |
| plomero@proveedor.com | 123456 | proveedor | Servicios de plomería |
| electricista@proveedor.com | 123456 | proveedor | Servicios eléctricos |
| inquilino@demo.com | 123456 | inquilino | Inquilino |

### Contenido Demo
- **3 inmuebles** con direcciones completas
- **3 publicaciones** (alquiler/venta)
- **2 proveedores** con perfiles profesionales
- **2 solicitudes** de mantenimiento
- **Notificaciones** de ejemplo

## 🔗 Endpoints Funcionando

### Autenticación
- `POST /api/auth/login` - ✅ Funciona con tu tabla `usuarios`
- `POST /api/auth/register` - ✅ Crea en `usuarios` + `proveedores_perfil`
- `GET /api/auth/me` - ✅ Consulta `usuarios` con `roles`

### Inmuebles
- `GET /api/properties` - ✅ Usa vista `vista_inmuebles`
- `POST /api/properties` - ✅ Crea en `inmuebles` + `direcciones`
- `PUT /api/properties/:id` - ✅ Actualiza `inmuebles`
- `DELETE /api/properties/:id` - ✅ Elimina de `inmuebles`

### Solicitudes
- `GET /api/requests` - ✅ Usa vista `vista_solicitudes`
- `POST /api/requests` - ✅ Crea en `solicitudes_mantenimiento`
- `PATCH /api/requests/:id/status` - ✅ Actualiza estado
- `PATCH /api/requests/:id/assign` - ✅ Asigna proveedor

### Proveedores
- `GET /api/providers` - ✅ Usa vista `vista_proveedores`
- `GET /api/providers/:id` - ✅ Consulta `proveedores_perfil`
- `PUT /api/providers/profile` - ✅ Actualiza `proveedores_perfil`

## 🎯 Mapeo de Roles

| Rol Original | Rol Adaptado | Descripción |
|--------------|--------------|-------------|
| admin | administrador | Administrador del sistema |
| property_manager | propietario | Gestor de propiedades |
| tenant | inquilino | Inquilino |
| provider | proveedor | Proveedor de servicios |

## 🔄 Mapeo de Estados

### Inmuebles
| Estado Original | Estado Adaptado |
|-----------------|-----------------|
| available | activo |
| rented | inactivo |
| maintenance | mantenimiento |
| sold | inactivo |

### Solicitudes
| Estado Original | Estado Adaptado |
|-----------------|-----------------|
| pending | pendiente |
| in_progress | en_curso |
| completed | finalizada |
| cancelled | cancelada |

## 🧪 Probar la Integración

### 1. **Health Check**
```bash
curl http://localhost:3000/api/health
```

### 2. **Login**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@demo.com","password":"123456"}'
```

### 3. **Listar Inmuebles**
```bash
curl -X GET http://localhost:3000/api/properties \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

### 4. **Listar Solicitudes**
```bash
curl -X GET http://localhost:3000/api/requests \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

## 🔧 Campos Agregados al Esquema

### Tabla `usuarios`
- `created_at` - Timestamp de creación
- `updated_at` - Timestamp de actualización

### Tabla `inmuebles`
- `created_at` - Timestamp de creación
- `updated_at` - Timestamp de actualización

### Tabla `solicitudes_mantenimiento`
- `created_at` - Timestamp de creación
- `updated_at` - Timestamp de actualización

### Tabla `proveedores_perfil`
- `created_at` - Timestamp de creación
- `updated_at` - Timestamp de actualización

### Tablas Nuevas
- `provider_reviews` - Reviews de proveedores
- `provider_slots` - Slots de disponibilidad

## 🚀 Ejecutar el Proyecto

### Terminal 1 - Backend
```bash
cd inmo-servicios-backend
npm run dev
```
✅ Backend corriendo en: http://localhost:3000

### Terminal 2 - App Móvil
```bash
cp env.example .env
npm install
npm start
```
✅ Expo corriendo en: http://localhost:19006

## 🎯 Ventajas de esta Adaptación

### ✅ **Mantiene tu Esquema**
- No necesitas cambiar tu base de datos
- Mantienes todos tus datos existentes
- Usa tu estructura de tablas actual

### ✅ **Funcionalidad Completa**
- Todas las funcionalidades del backend original
- API REST completa
- Autenticación JWT
- CRUD de todas las entidades

### ✅ **Fácil de Usar**
- Scripts de instalación automática
- Documentación completa
- Datos de prueba incluidos

### ✅ **Escalable**
- Arquitectura preparada para crecer
- Fácil de personalizar
- Listo para producción

## 🐛 Solución de Problemas

### Error de Conexión a MySQL
```bash
# Verificar que MySQL esté corriendo
mysql -u root -p

# Verificar que la base de datos existe
SHOW DATABASES;
USE inmobiliaria_mvp;
```

### Error de Tablas
```bash
# Verificar que las vistas existen
SHOW TABLES;
SELECT * FROM vista_inmuebles LIMIT 1;
```

### Error de Permisos
```bash
# Verificar que el usuario tiene permisos
GRANT ALL PRIVILEGES ON inmobiliaria_mvp.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

## 📞 Soporte

Si tienes problemas:

1. **Verificar logs** del backend en la consola
2. **Revisar configuración** de .env
3. **Probar endpoints** con Postman/curl
4. **Verificar base de datos** con MySQL

## 🎉 ¡Listo para Usar!

Tu proyecto está **100% adaptado** para funcionar con tu base de datos existente. Puedes:

- ✅ **Usar tu esquema actual** sin modificaciones importantes
- ✅ **Mantener todos tus datos** existentes
- ✅ **Agregar nuevas funcionalidades** fácilmente
- ✅ **Conectar con la app móvil** inmediatamente
- ✅ **Desarrollar nuevas features** sobre esta base

**¡Tu proyecto está listo para funcionar con tu base de datos existente!** 🚀

## 📚 Archivos de Ayuda

- `INSTRUCCIONES_BASE_DATOS_EXISTENTE.md` - Guía detallada
- `setup-con-base-datos-existente.bat/sh` - Scripts de instalación
- `inmo-servicios-backend/README.md` - Documentación técnica

**¡Feliz coding! 🚀**
