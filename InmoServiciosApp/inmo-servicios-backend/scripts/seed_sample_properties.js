/*
  Script: seed_sample_properties.js
  Uso: node scripts/seed_sample_properties.js

  Inserta hasta 10 inmuebles ficticios (con direcciones, publicaciones e imágenes)
  en la base de datos usando el esquema adaptado (inmuebles / direcciones / publicaciones).
  Se ejecuta de forma idempotente: si una dirección ya existe, la reutiliza, y
  omite inmuebles que ya estén cargados para esa dirección.
*/

const db = require('../src/db');

const OWNER_EMAIL = process.env.SEED_OWNER_EMAIL || 'demo@demo.com';

const SAMPLE_PROPERTIES = [
  {
    address: {
      calle: 'Av. Belgrano',
      numero: '1450',
      ciudad: 'La Rioja',
      provincia: 'La Rioja',
      codigo_postal: '5300',
      lat: -29.4112,
      lng: -66.8559,
    },
    property: {
      tipo: 'departamento',
      ambientes: 3,
      banos: 2,
      superficie_m2: 92,
      descripcion: 'Departamento amplio y luminoso con balcón al frente y cochera cubierta.',
      estado: 'activo',
    },
    publication: {
      tipo: 'alquiler',
      precio: 120000,
      moneda: 'ARS',
      estado: 'publicada',
    },
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511',
    ],
  },
  {
    address: {
      calle: 'Calle Buenos Aires',
      numero: '820',
      ciudad: 'Chilecito',
      provincia: 'La Rioja',
      codigo_postal: '5360',
      lat: -29.1653,
      lng: -67.4974,
    },
    property: {
      tipo: 'casa',
      ambientes: 4,
      banos: 2,
      superficie_m2: 160,
      descripcion: 'Casa familiar con patio arbolado, quincho y parrilla. Barrio residencial.',
      estado: 'activo',
    },
    publication: {
      tipo: 'venta',
      precio: 86000000,
      moneda: 'ARS',
      estado: 'publicada',
    },
    images: [
      'https://images.unsplash.com/photo-1613977256644-1ecc70409f93',
      'https://images.unsplash.com/photo-1600585154340-0ef3c08dcdb6',
    ],
  },
  {
    address: {
      calle: 'Ruta Provincial 5',
      numero: 'Km 12',
      ciudad: 'La Rioja',
      provincia: 'La Rioja',
      codigo_postal: '5300',
      lat: -29.4508,
      lng: -66.8901,
    },
    property: {
      tipo: 'terreno',
      ambientes: 0,
      banos: 0,
      superficie_m2: 850,
      descripcion: 'Terreno en esquina con servicios, ideal para desarrollo residencial.',
      estado: 'activo',
    },
    publication: {
      tipo: 'venta',
      precio: 42000000,
      moneda: 'ARS',
      estado: 'publicada',
    },
    images: [
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
    ],
  },
  {
    address: {
      calle: 'Pje. Joaquín V. González',
      numero: '230',
      ciudad: 'La Rioja',
      provincia: 'La Rioja',
      codigo_postal: '5300',
      lat: -29.4205,
      lng: -66.8631,
    },
    property: {
      tipo: 'departamento',
      ambientes: 1,
      banos: 1,
      superficie_m2: 45,
      descripcion: 'Monoambiente moderno en edificio con amenities y coworking.',
      estado: 'activo',
    },
    publication: {
      tipo: 'alquiler',
      precio: 78000,
      moneda: 'ARS',
      estado: 'publicada',
    },
    images: [
      'https://images.unsplash.com/photo-1554995207-c18c203602cb',
    ],
  },
  {
    address: {
      calle: 'Boulevard Ortiz de Ocampo',
      numero: '2100',
      ciudad: 'La Rioja',
      provincia: 'La Rioja',
      codigo_postal: '5300',
      lat: -29.4047,
      lng: -66.8402,
    },
    property: {
      tipo: 'casa',
      ambientes: 5,
      banos: 3,
      superficie_m2: 210,
      descripcion: 'Casa premium con piscina climatizada, domótica integrada y seguridad 24hs.',
      estado: 'activo',
    },
    publication: {
      tipo: 'alquiler',
      precio: 350000,
      moneda: 'ARS',
      estado: 'publicada',
    },
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914',
      'https://images.unsplash.com/photo-1501183638710-841dd1904471',
    ],
  },
  {
    address: {
      calle: 'Catamarca',
      numero: '455',
      ciudad: 'Aimogasta',
      provincia: 'La Rioja',
      codigo_postal: '5310',
      lat: -28.5625,
      lng: -66.8167,
    },
    property: {
      tipo: 'casa',
      ambientes: 2,
      banos: 1,
      superficie_m2: 70,
      descripcion: 'Casa compacta y eficiente energética, ideal para primer hogar.',
      estado: 'activo',
    },
    publication: {
      tipo: 'venta',
      precio: 32000000,
      moneda: 'ARS',
      estado: 'publicada',
    },
    images: [
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994',
    ],
  },
  {
    address: {
      calle: 'Av. Ortiz de Ocampo',
      numero: '650',
      ciudad: 'La Rioja',
      provincia: 'La Rioja',
      codigo_postal: '5300',
      lat: -29.4251,
      lng: -66.8458,
    },
    property: {
      tipo: 'oficina',
      ambientes: 0,
      banos: 2,
      superficie_m2: 120,
      descripcion: 'Oficina corporativa con sala de reuniones y recepción equipada.',
      estado: 'activo',
    },
    publication: {
      tipo: 'alquiler',
      precio: 210000,
      moneda: 'ARS',
      estado: 'publicada',
    },
    images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab',
    ],
  },
  {
    address: {
      calle: 'Los Cactus',
      numero: '37',
      ciudad: 'Sanagasta',
      provincia: 'La Rioja',
      codigo_postal: '5313',
      lat: -29.2004,
      lng: -67.0571,
    },
    property: {
      tipo: 'casa',
      ambientes: 3,
      banos: 2,
      superficie_m2: 130,
      descripcion: 'Casa de montaña con vista panorámica y construcción sustentable.',
      estado: 'activo',
    },
    publication: {
      tipo: 'alquiler',
      precio: 90000,
      moneda: 'ARS',
      estado: 'publicada',
    },
    images: [
      'https://images.unsplash.com/photo-1523217582562-09d0def993a6',
    ],
  },
  {
    address: {
      calle: 'Los Álamos',
      numero: '12',
      ciudad: 'La Rioja',
      provincia: 'La Rioja',
      codigo_postal: '5300',
      lat: -29.4002,
      lng: -66.8703,
    },
    property: {
      tipo: 'departamento',
      ambientes: 2,
      banos: 1,
      superficie_m2: 58,
      descripcion: 'Departamento en planta baja con patio interno y bajas expensas.',
      estado: 'activo',
    },
    publication: {
      tipo: 'alquiler',
      precio: 68000,
      moneda: 'ARS',
      estado: 'publicada',
    },
    images: [
      'https://images.unsplash.com/photo-1461988625982-7e46a099bf4a',
    ],
  },
  {
    address: {
      calle: 'Libertad',
      numero: '980',
      ciudad: 'Chamical',
      provincia: 'La Rioja',
      codigo_postal: '5380',
      lat: -30.3603,
      lng: -66.3133,
    },
    property: {
      tipo: 'local',
      ambientes: 0,
      banos: 1,
      superficie_m2: 95,
      descripcion: 'Local comercial sobre avenida principal con vidriera y depósito.',
      estado: 'activo',
    },
    publication: {
      tipo: 'alquiler',
      precio: 150000,
      moneda: 'ARS',
      estado: 'publicada',
    },
    images: [
      'https://images.unsplash.com/photo-1529429617124-aee2a93d4437',
    ],
  },
];

async function ensureOwnerId(connection) {
  const [rows] = await connection.execute('SELECT id FROM usuarios WHERE email = ? LIMIT 1', [OWNER_EMAIL]);
  if (!rows.length) {
    throw new Error(`No se encontró un usuario con email ${OWNER_EMAIL}. Ajusta SEED_OWNER_EMAIL o crea el usuario antes de ejecutar el script.`);
  }
  return rows[0].id;
}

async function ensureAddress(connection, address) {
  const lookupQuery = `
    SELECT id FROM direcciones
    WHERE calle = ? AND numero = ? AND ciudad = ? AND provincia = ?
    LIMIT 1
  `;
  const [existing] = await connection.execute(lookupQuery, [address.calle, address.numero, address.ciudad, address.provincia]);
  if (existing.length) {
    return existing[0].id;
  }

  const insertQuery = `
    INSERT INTO direcciones (calle, numero, ciudad, provincia, codigo_postal, lat, lng)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const [result] = await connection.execute(insertQuery, [
    address.calle,
    address.numero,
    address.ciudad,
    address.provincia,
    address.codigo_postal || null,
    address.lat || null,
    address.lng || null,
  ]);
  return result.insertId;
}

async function propertyExists(connection, addressId) {
  const [rows] = await connection.execute('SELECT id FROM inmuebles WHERE direccion_id = ? LIMIT 1', [addressId]);
  return rows.length > 0 ? rows[0].id : null;
}

async function insertProperty(connection, ownerId, addressId, property) {
  const insertQuery = `
    INSERT INTO inmuebles (
      propietario_id, administrador_id, direccion_id,
      tipo, ambientes, banos, superficie_m2, descripcion, estado
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const [result] = await connection.execute(insertQuery, [
    ownerId,
    ownerId,
    addressId,
    property.tipo,
    property.ambientes,
    property.banos,
    property.superficie_m2,
    property.descripcion,
    property.estado || 'activo',
  ]);

  return result.insertId;
}

async function upsertPublication(connection, propertyId, publication) {
  const [existing] = await connection.execute(
    'SELECT id FROM publicaciones WHERE inmueble_id = ? LIMIT 1',
    [propertyId]
  );

  if (existing.length) {
    await connection.execute(
      `UPDATE publicaciones SET tipo = ?, precio = ?, moneda = ?, estado = ?, fecha_publicacion = NOW()
       WHERE id = ?`,
      [publication.tipo, publication.precio, publication.moneda, publication.estado || 'publicada', existing[0].id]
    );
    return existing[0].id;
  }

  const [result] = await connection.execute(
    `INSERT INTO publicaciones (inmueble_id, tipo, precio, moneda, estado, fecha_publicacion)
     VALUES (?, ?, ?, ?, ?, NOW())`,
    [propertyId, publication.tipo, publication.precio, publication.moneda, publication.estado || 'publicada']
  );

  return result.insertId;
}

async function replaceImages(connection, propertyId, images = []) {
  if (!images.length) return;

  await connection.execute('DELETE FROM inmuebles_imagenes WHERE inmueble_id = ?', [propertyId]);

  const insertQuery = `INSERT INTO inmuebles_imagenes (inmueble_id, url, es_portada) VALUES (?, ?, ?)`;
  for (const [index, url] of images.entries()) {
    await connection.execute(insertQuery, [propertyId, url, index === 0]);
  }
}

async function main() {
  console.log('🚀 Iniciando carga de inmuebles ficticios...');
  const connection = await db.getConnection();

  try {
    const ownerId = await ensureOwnerId(connection);
    let createdCount = 0;

    for (const sample of SAMPLE_PROPERTIES) {
      const addressId = await ensureAddress(connection, sample.address);
      const existingPropertyId = await propertyExists(connection, addressId);

      if (existingPropertyId) {
        console.log(`ℹ️  Ya existe un inmueble para ${sample.address.calle} ${sample.address.numero}, se actualizan datos.`);
        await connection.execute(
          `UPDATE inmuebles SET tipo = ?, ambientes = ?, banos = ?, superficie_m2 = ?, descripcion = ?, estado = ?
           WHERE id = ?`,
          [
            sample.property.tipo,
            sample.property.ambientes,
            sample.property.banos,
            sample.property.superficie_m2,
            sample.property.descripcion,
            sample.property.estado || 'activo',
            existingPropertyId,
          ]
        );

        await upsertPublication(connection, existingPropertyId, sample.publication);
        await replaceImages(connection, existingPropertyId, sample.images);
        continue;
      }

      const propertyId = await insertProperty(connection, ownerId, addressId, sample.property);
      await upsertPublication(connection, propertyId, sample.publication);
      await replaceImages(connection, propertyId, sample.images);
      createdCount += 1;
    }

    console.log(`✅ Carga finalizada. Nuevos inmuebles creados: ${createdCount}.`);
  } catch (error) {
    console.error('❌ Error cargando inmuebles ficticios:', error.message);
    console.error(error);
    process.exitCode = 1;
  } finally {
    connection.release();
    process.exit();
  }
}

main();
