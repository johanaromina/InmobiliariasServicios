-- Esquema adaptado para inmobiliaria_mvp
-- Este archivo NO crea la base de datos, solo agrega las tablas necesarias
-- que no existen en el esquema original

USE inmobiliaria_mvp;

-- Agregar campos necesarios para el backend si no existen
-- (Estos ALTER TABLE son seguros - no afectan datos existentes)

-- Agregar campos a la tabla usuarios si no existen
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP;

-- Agregar campos a la tabla inmuebles si no existen
ALTER TABLE inmuebles 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP;

-- Agregar campos a la tabla solicitudes_mantenimiento si no existen
ALTER TABLE solicitudes_mantenimiento 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP;

-- Agregar campos a la tabla proveedores_perfil si no existen
ALTER TABLE proveedores_perfil 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP;

-- Crear tabla de imágenes de inmuebles si no existe (similar a inmuebles_imagenes)
-- La tabla inmuebles_imagenes ya existe, solo necesitamos verificar que tenga los campos correctos
ALTER TABLE inmuebles_imagenes 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Crear tabla de reviews de proveedores si no existe
CREATE TABLE IF NOT EXISTS provider_reviews (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    proveedor_id BIGINT UNSIGNED NOT NULL,
    usuario_id BIGINT UNSIGNED NOT NULL,
    solicitud_id BIGINT UNSIGNED NOT NULL,
    puntaje TINYINT UNSIGNED NOT NULL CHECK (puntaje BETWEEN 1 AND 5),
    comentario TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proveedor_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (solicitud_id) REFERENCES solicitudes_mantenimiento(id) ON DELETE CASCADE,
    UNIQUE KEY uq_provider_review (solicitud_id, usuario_id)
) ENGINE=InnoDB;

-- Crear tabla de slots de disponibilidad si no existe
CREATE TABLE IF NOT EXISTS provider_slots (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    proveedor_id BIGINT UNSIGNED NOT NULL,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    disponible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proveedor_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_proveedor_fecha (proveedor_id, fecha),
    INDEX idx_disponible (disponible)
) ENGINE=InnoDB;

-- Agregar índices necesarios si no existen
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_estado ON usuarios(estado);

CREATE INDEX IF NOT EXISTS idx_inmuebles_tipo ON inmuebles(tipo);
CREATE INDEX IF NOT EXISTS idx_inmuebles_estado ON inmuebles(estado);

CREATE INDEX IF NOT EXISTS idx_solicitudes_estado ON solicitudes_mantenimiento(estado);
CREATE INDEX IF NOT EXISTS idx_solicitudes_prioridad ON solicitudes_mantenimiento(prioridad);
CREATE INDEX IF NOT EXISTS idx_solicitudes_categoria ON solicitudes_mantenimiento(categoria_id);

CREATE INDEX IF NOT EXISTS idx_publicaciones_estado ON publicaciones(estado);
CREATE INDEX IF NOT EXISTS idx_publicaciones_tipo ON publicaciones(tipo);

-- Crear vista para facilitar consultas de proveedores
CREATE OR REPLACE VIEW vista_proveedores AS
SELECT 
    u.id as user_id,
    u.nombre,
    u.email,
    u.telefono,
    u.estado as usuario_estado,
    pp.bio,
    pp.documento_url,
    pp.reputacion,
    pp.created_at,
    pp.updated_at
FROM usuarios u
LEFT JOIN proveedores_perfil pp ON u.id = pp.usuario_id
WHERE u.rol_id = (SELECT id FROM roles WHERE nombre = 'proveedor')
AND u.estado = 'activo';

-- Crear vista para facilitar consultas de inmuebles con direcciones
CREATE OR REPLACE VIEW vista_inmuebles AS
SELECT 
    i.id,
    i.propietario_id,
    i.administrador_id,
    i.tipo,
    i.ambientes,
    i.banos,
    i.superficie_m2,
    i.descripcion,
    i.estado,
    i.created_at,
    i.updated_at,
    d.calle,
    d.numero,
    d.ciudad,
    d.provincia,
    d.codigo_postal,
    d.lat,
    d.lng,
    CONCAT(d.calle, ' ', d.numero, ', ', d.ciudad, ', ', d.provincia) as direccion_completa
FROM inmuebles i
LEFT JOIN direcciones d ON i.direccion_id = d.id;

-- Crear vista para solicitudes de mantenimiento con información completa
CREATE OR REPLACE VIEW vista_solicitudes AS
SELECT 
    sm.id,
    sm.inmueble_id,
    sm.solicitante_id,
    sm.proveedor_asignado_id,
    sm.categoria_id,
    sm.titulo,
    sm.descripcion,
    sm.prioridad,
    sm.estado,
    sm.fecha_creacion,
    sm.fecha_vencimiento,
    sm.fecha_cierre,
    sm.responsabilidad_pago,
    sm.created_at,
    sm.updated_at,
    cs.nombre as categoria_nombre,
    u_sol.nombre as solicitante_nombre,
    u_sol.email as solicitante_email,
    u_prov.nombre as proveedor_nombre,
    u_prov.email as proveedor_email,
    vi.direccion_completa as inmueble_direccion
FROM solicitudes_mantenimiento sm
LEFT JOIN categorias_servicio cs ON sm.categoria_id = cs.id
LEFT JOIN usuarios u_sol ON sm.solicitante_id = u_sol.id
LEFT JOIN usuarios u_prov ON sm.proveedor_asignado_id = u_prov.id
LEFT JOIN vista_inmuebles vi ON sm.inmueble_id = vi.id;
