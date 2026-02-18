#!/bin/bash

echo "========================================"
echo " InmoServiciosApp - Setup con BD Existente"
echo "========================================"
echo

echo "[1/6] Verificando base de datos inmobiliaria_mvp..."
mysql -u root -p -e "USE inmobiliaria_mvp; SHOW TABLES;" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "❌ Error: La base de datos inmobiliaria_mvp no existe o no es accesible"
    echo "Por favor crea la base de datos primero con tu script SQL"
    exit 1
fi
echo "✅ Base de datos encontrada"

echo "[2/6] Creando directorio del backend..."
mkdir -p inmo-servicios-backend
cd inmo-servicios-backend

echo "[3/6] Instalando dependencias..."
npm install

echo "[4/6] Configurando variables de entorno..."
if [ ! -f ".env" ]; then
    cp env.example .env
    echo "Archivo .env creado. Por favor edita las credenciales de la base de datos."
else
    echo "Archivo .env ya existe."
fi

echo "[5/6] Aplicando esquema adaptado..."
mysql -u root -p inmobiliaria_mvp < db/schema_adaptado.sql
if [ $? -ne 0 ]; then
    echo "❌ Error aplicando esquema adaptado"
    exit 1
fi
echo "✅ Esquema adaptado aplicado"

echo "[6/6] Poblando base de datos con datos de prueba..."
npm run seed
if [ $? -ne 0 ]; then
    echo "❌ Error poblando base de datos"
    exit 1
fi

echo
echo "========================================"
echo "   Setup completado exitosamente!"
echo "========================================"
echo
echo "Para iniciar el servidor:"
echo "  cd inmo-servicios-backend"
echo "  npm run dev"
echo
echo "El servidor estará disponible en: http://localhost:3000"
echo "Health check: http://localhost:3000/api/health"
echo
echo "Usuarios demo:"
echo "  Property Manager: demo@demo.com / 123456"
echo "  Admin: admin@fixar.com / admin123"
echo "  Provider: plomero@proveedor.com / 123456"
echo
echo "Para la app móvil:"
echo "  cp env.example .env"
echo "  npm install"
echo "  npm start"
echo
