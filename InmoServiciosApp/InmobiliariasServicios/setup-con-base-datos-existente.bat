@echo off
echo ========================================
echo  InmoServiciosApp - Setup con BD Existente
echo ========================================
echo.

echo [1/6] Verificando base de datos inmobiliaria_mvp...
mysql -u root -p -e "USE inmobiliaria_mvp; SHOW TABLES;" 2>nul
if %errorlevel% neq 0 (
    echo ❌ Error: La base de datos inmobiliaria_mvp no existe o no es accesible
    echo Por favor crea la base de datos primero con tu script SQL
    pause
    exit /b 1
)
echo ✅ Base de datos encontrada

echo [2/6] Creando directorio del backend...
if not exist "inmo-servicios-backend" mkdir inmo-servicios-backend
cd inmo-servicios-backend

echo [3/6] Instalando dependencias...
call npm install

echo [4/6] Configurando variables de entorno...
if not exist ".env" (
    copy env.example .env
    echo Archivo .env creado. Por favor edita las credenciales de la base de datos.
) else (
    echo Archivo .env ya existe.
)

echo [5/6] Aplicando esquema adaptado...
mysql -u root -p inmobiliaria_mvp < db/schema_adaptado.sql
if %errorlevel% neq 0 (
    echo ❌ Error aplicando esquema adaptado
    pause
    exit /b 1
)
echo ✅ Esquema adaptado aplicado

echo [6/6] Poblando base de datos con datos de prueba...
call npm run seed
if %errorlevel% neq 0 (
    echo ❌ Error poblando base de datos
    pause
    exit /b 1
)

echo.
echo ========================================
echo    Setup completado exitosamente!
echo ========================================
echo.
echo Para iniciar el servidor:
echo   cd inmo-servicios-backend
echo   npm run dev
echo.
echo El servidor estara disponible en: http://localhost:3000
echo Health check: http://localhost:3000/api/health
echo.
echo Usuarios demo:
echo   Property Manager: demo@demo.com / 123456
echo   Admin: admin@fixar.com / admin123
echo   Provider: plomero@proveedor.com / 123456
echo.
echo Para la app movil:
echo   cp env.example .env
echo   npm install
echo   npm start
echo.
pause
