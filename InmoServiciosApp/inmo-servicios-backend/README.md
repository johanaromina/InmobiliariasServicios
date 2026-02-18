# InmoServiciosApp Backend

Backend API para la aplicación InmoServiciosApp - Sistema de gestión de inmuebles y servicios de mantenimiento.

## 🚀 Características

- **Autenticación JWT** con roles (admin, property_manager, tenant, provider)
- **CRUD de Inmuebles** con filtros y paginación
- **Sistema de Solicitudes** de mantenimiento con estados
- **Gestión de Proveedores** con búsqueda y filtros
- **Sistema de Calificaciones** y reviews
- **Notificaciones** en tiempo real
- **Base de datos MySQL** con esquema optimizado

## 📋 Requisitos

- Node.js 16+
- MySQL 8.0+
- npm o yarn

## ⚙️ Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd inmo-servicios-backend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp env.example .env
   ```
   
   Editar `.env` con tus credenciales:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASS=tu_password
   DB_NAME=fixar
   PORT=3000
   JWT_SECRET=tu_jwt_secret_super_seguro
   ```

4. **Configurar base de datos**
   ```bash
   # Crear la base de datos
   mysql -u root -p < db/schema.sql
   
   # Poblar con datos de prueba
   npm run seed
   ```

5. **Iniciar el servidor**
   ```bash
   # Desarrollo
   npm run dev
   
   # Producción
   npm start
   ```

## 🔗 Endpoints de la API

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/me` - Perfil del usuario actual
- `PUT /api/auth/profile` - Actualizar perfil
- `PUT /api/auth/change-password` - Cambiar contraseña

### Inmuebles
- `GET /api/properties` - Listar inmuebles (con filtros)
- `GET /api/properties/:id` - Obtener inmueble específico
- `POST /api/properties` - Crear inmueble
- `PUT /api/properties/:id` - Actualizar inmueble
- `DELETE /api/properties/:id` - Eliminar inmueble
- `POST /api/properties/:id/images` - Agregar imagen

### Solicitudes de Mantenimiento
- `GET /api/requests` - Listar solicitudes (con filtros)
- `GET /api/requests/:id` - Obtener solicitud específica
- `POST /api/requests` - Crear solicitud
- `PATCH /api/requests/:id/status` - Actualizar estado
- `PATCH /api/requests/:id/assign` - Asignar proveedor
- `DELETE /api/requests/:id` - Eliminar solicitud

### Proveedores
- `GET /api/providers` - Listar proveedores (con filtros)
- `GET /api/providers/:id` - Obtener proveedor específico
- `GET /api/providers/:id/reviews` - Obtener reviews del proveedor
- `PUT /api/providers/profile` - Actualizar perfil de proveedor
- `GET /api/providers/my/requests` - Solicitudes asignadas al proveedor
- `GET /api/providers/my/stats` - Estadísticas del proveedor

### Utilidades
- `GET /api/health` - Health check

## 🗄️ Estructura de la Base de Datos

### Tablas Principales
- **users** - Usuarios del sistema
- **properties** - Inmuebles
- **property_images** - Imágenes de inmuebles
- **maintenance_requests** - Solicitudes de mantenimiento
- **providers** - Perfiles de proveedores
- **provider_reviews** - Calificaciones de proveedores
- **provider_slots** - Disponibilidad de proveedores
- **notifications** - Notificaciones del sistema

## 🔐 Roles y Permisos

### Admin
- Acceso completo a todos los endpoints
- Gestión de usuarios y propiedades
- Estadísticas globales

### Property Manager
- Gestión de sus propiedades
- Asignación de proveedores
- Visualización de solicitudes

### Tenant
- Creación de solicitudes de mantenimiento
- Visualización de sus solicitudes
- Calificación de proveedores

### Provider
- Gestión de perfil profesional
- Visualización de solicitudes asignadas
- Actualización de estados de trabajo

## 📊 Datos de Prueba

El comando `npm run seed` crea:

### Usuarios Demo
- **Property Manager**: demo@demo.com / 123456
- **Admin**: admin@fixar.com / admin123
- **Provider (Plomero)**: plomero@proveedor.com / 123456
- **Provider (Electricista)**: electricista@proveedor.com / 123456
- **Tenant**: inquilino@demo.com / 123456

### Datos Incluidos
- 3 propiedades de ejemplo
- 2 proveedores con perfiles completos
- 2 solicitudes de mantenimiento
- Notificaciones de ejemplo

## 🔧 Configuración para la App Móvil

En la app Expo, configurar en `.env`:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/api
# Para Android emulador: http://10.0.2.2:3000/api
# Para dispositivo físico: http://TU_IP_LOCAL:3000/api
```

## 🚀 Próximos Pasos

1. **Conectar con la app móvil** - Configurar endpoints en la app Expo
2. **Implementar notificaciones push** - Firebase Cloud Messaging
3. **Agregar subida de archivos** - AWS S3 o almacenamiento local
4. **Implementar pagos** - Stripe o MercadoPago
5. **Agregar tests** - Jest + Supertest
6. **Dockerizar** - Docker + Docker Compose

## 📝 Notas de Desarrollo

- Todas las rutas requieren autenticación excepto `/api/health` y `/api/providers` (GET)
- Los tokens JWT expiran en 7 días por defecto
- La paginación está limitada a 100 elementos por página
- Las validaciones están implementadas con express-validator
- Los errores se manejan de forma consistente con códigos HTTP apropiados

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.
