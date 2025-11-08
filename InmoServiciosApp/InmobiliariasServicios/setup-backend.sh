#!/bin/bash

echo "========================================"
echo "   InmoServiciosApp Backend Setup"
echo "========================================"
echo

echo "[1/5] Creando directorio del backend..."
mkdir -p inmo-servicios-backend
cd inmo-servicios-backend

echo "[2/5] Instalando dependencias..."
npm install

echo "[3/5] Configurando variables de entorno..."
if [ ! -f ".env" ]; then
    cp env.example .env
    echo "Archivo .env creado. Por favor edita las credenciales de la base de datos."
else
    echo "Archivo .env ya existe."
fi

echo "[4/5] Creando base de datos..."
echo "Por favor ejecuta manualmente en MySQL:"
echo "  CREATE DATABASE IF NOT EXISTS fixar;"
echo "  USE fixar;"
echo "  source db/schema.sql;"
echo

echo "[5/5] Poblando base de datos con datos de prueba..."
npm run seed

echo
echo "========================================"
echo "   Setup completado!"
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
