@echo off
REM Script para iniciar PetCare+ - Windows
REM Abre: API (5000), Frontend (8000), MongoDB (27017)

setlocal enabledelayedexpansion
color 0B
cls

echo.
echo ======================================================================
echo.
echo    🐾 PetCare+ - Sistema Completo
echo.
echo ======================================================================
echo.

REM Verificar carpeta correcta
if not exist "package.json" (
    echo ❌ Error: Ejecuta este archivo desde la raiz del proyecto PetCare-
    echo.
    echo Por ejemplo:
    echo   c:\Users\tu_usuario\OneDrive\Escritorio\IDGS\PetCare-
    echo.
    pause
    exit /b 1
)

REM Verificar MongoDB
echo ✓ Verificando MongoDB...
mongosh --eval "db.adminCommand('ping')" >nul 2>&1
if errorlevel 1 (
    echo.
    echo ⚠️  MongoDB no está corriendo
    echo.
    echo Opciones:
    echo   1. Si instalaste MongoDB Community, inicia: net start MongoDB
    echo   2. Si usas Docker: docker run -d -p 27017:27017 --name petcare-mongo mongo:7.0
    echo   3. Usa MongoDB Atlas Cloud (ver MONGODB_SETUP.md)
    echo.
    echo El servidor seguirá funcionando con archivos JSON como fallback.
    echo.
)

REM Instalar dependencias si no existen
if not exist "node_modules" (
    echo ✓ Instalando dependencias (primera vez)...
    call npm install --silent
)

echo.
echo ======================================================================
echo.
echo   🚀 Abriendo servidores...
echo.
echo ======================================================================
echo.

REM Terminal 1: API
echo ✓ Abriendo Terminal 1: API en puerto 5000...
start "PetCare+ API" cmd /k "title PetCare+ API && npm start"

REM Esperar a que API inicie
timeout /t 3 /nobreak

REM Terminal 2: Frontend
echo ✓ Abriendo Terminal 2: Frontend en puerto 8000...
start "PetCare+ Frontend" cmd /k "title PetCare+ Frontend && cd www && npx http-server -p 8000 -c-1"

timeout /t 2 /nobreak

cls
echo.
echo ======================================================================
echo.
echo    ✅ SERVIDORES INICIADOS
echo.
echo ======================================================================
echo.
echo.
echo   🌐 URLS DE ACCESO:
echo.
echo   Local:          http://localhost:8000
echo   Desde movil:    http://TU_IP_LOCAL:8000
echo.
echo   API Local:      http://localhost:5000
echo   API desde movil: http://TU_IP_LOCAL:5000
echo.
echo ======================================================================
echo.
echo.
echo   📋 PASOS PARA PROBAR:
echo.
echo   1. Abre navegador en: http://localhost:8000
echo   2. Haz clic en "Saltar" (onboarding)
echo   3. Ve a REGISTRO
echo   4. Crea una nueva cuenta
echo   5. Agrega tus mascotas
echo   6. Verifica en: data/usuarios.json
echo.
echo ======================================================================
echo.
echo.
echo   ℹ️  Nota: Las 2 terminales se cerraran cuando termines.
echo      Presiona Ctrl+C en cada una para detener.
echo.
echo   📚 Documentación: MONGODB_SETUP.md
echo.
pause
