# 🗄️ InmoServiciosApp - Integración con Base de Datos Existente

## 📋 Resumen

He adaptado el backend para que funcione con tu base de datos existente `inmobiliaria_mvp` en lugar de crear una nueva. Esto significa que puedes usar tu esquema actual sin modificaciones importantes.

## 🔄 Cambios Realizados

### 1. **Adaptación del Backend**
- ✅ Actualizado para usar `inmobiliaria_mvp` como base de datos
- ✅ Modificado para usar las tablas existentes (`usuarios`, `inmuebles`, `solicitudes_mantenimiento`, etc.)
- ✅ Creado esquema adaptado que agrega solo campos necesarios
- ✅ Actualizado seed para poblar tu base de datos existente

### 2. **Mapeo de Tablas**
| Función | Tabla Original | Tabla Adaptada |
|---------|----------------|----------------|
| Usuarios | `users` | `usuarios` |
| Inmuebles | `properties` | `inmuebles` + `direcciones` |
| Solicitudes | `maintenance_requests` | `solicitudes_mantenimiento` |
| Proveedores | `providers` | `proveedores_perfil` |
| Imágenes | `property_images` | `inmuebles_imagenes` |

### 3. **Vistas Creadas**
- `vista_proveedores` - Facilita consultas de proveedores
- `vista_inmuebles` - Inmuebles con información de direcciones
- `vista_solicitudes` - Solicitudes con información completa

## 🚀 Instalación Paso a Paso

### 1. **Preparar tu Base de Datos**
```sql
-- Tu base de datos ya existe, solo necesitas ejecutar el esquema adaptado
USE inmobiliaria_mvp;
source inmo-servicios-backend/db/schema_adaptado.sql;
```

### 2. **Configurar Backend**
```bash
cd inmo-servicios-backend
cp env.example .env
# Editar .env con tus credenciales de MySQL
```

### 3. **Instalar Dependencias**
```bash
npm install
```

### 4. **Poblar con Datos de Prueba**
```bash
npm run seed
```

### 5. **Iniciar Backend**
```bash
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

## 🔗 Endpoints Adaptados

### Autenticación
- `POST /api/auth/login` - Usa tabla `usuarios`
- `POST /api/auth/register` - Crea en `usuarios` + `proveedores_perfil` si es proveedor
- `GET /api/auth/me` - Consulta `usuarios` con `roles`

### Inmuebles
- `GET /api/properties` - Usa vista `vista_inmuebles`
- `POST /api/properties` - Crea en `inmuebles` + `direcciones`
- `PUT /api/properties/:id` - Actualiza `inmuebles`
- `DELETE /api/properties/:id` - Elimina de `inmuebles`

### Solicitudes
- `GET /api/requests` - Usa vista `vista_solicitudes`
- `POST /api/requests` - Crea en `solicitudes_mantenimiento`
- `PATCH /api/requests/:id/status` - Actualiza estado
- `PATCH /api/requests/:id/assign` - Asigna proveedor

### Proveedores
- `GET /api/providers` - Usa vista `vista_proveedores`
- `GET /api/providers/:id` - Consulta `proveedores_perfil`
- `PUT /api/providers/profile` - Actualiza `proveedores_perfil`

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

## 🚀 Próximos Pasos

### 1. **Ejecutar el Proyecto**
```bash
# Terminal 1 - Backend
cd inmo-servicios-backend
npm run dev

# Terminal 2 - App
npm start
```

### 2. **Probar Funcionalidades**
- Login con usuarios demo
- Ver inmuebles en la app
- Crear solicitudes de mantenimiento
- Buscar proveedores

### 3. **Desarrollar Nuevas Features**
- Conectar con tu backend personalizado
- Agregar nuevas funcionalidades
- Personalizar según tus necesidades

## 🐛 Solución de Problemas

### Error de Conexión
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

1. **Verificar logs** del backend
2. **Revisar configuración** de .env
3. **Probar endpoints** con Postman/curl
4. **Verificar base de datos** con MySQL

## 🎉 ¡Listo para Usar!

Tu backend está adaptado para funcionar con tu base de datos existente. Puedes:

- ✅ Usar tu esquema actual sin modificaciones importantes
- ✅ Mantener todos tus datos existentes
- ✅ Agregar nuevas funcionalidades
- ✅ Conectar con la app móvil

**¡Tu proyecto está listo para funcionar con tu base de datos existente!** 🚀
