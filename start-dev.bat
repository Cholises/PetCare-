@echo off
REM Script para iniciar desarrollo local de PetCare+ (Windows)
REM Este script abre dos terminales: una para API, otra para Frontend

color 0B
cls

echo.
echo =========================================================
echo.
echo   🐾 PetCare+ - Iniciando Desarrollo
echo.
echo =========================================================
echo.
echo.

REM Verificar si estamos en la carpeta correcta
if not exist "package.json" (
    echo ❌ Error: Ejecuta este archivo desde la raíz del proyecto PetCare-
    pause
    exit /b 1
)

echo 🚀 Abriendo Terminal 1: API Server (Puerto 5000)...
start "API PetCare+" cmd /k "npm start"

echo.
echo Esperando a que API se inicie...
timeout /t 3 /nobreak

echo.
echo 🚀 Abriendo Terminal 2: Frontend Server (Puerto 8000)...
start "Frontend PetCare+" cmd /k "cd www && npx http-server -p 8000 -c-1"

timeout /t 2 /nobreak

cls
color 0B
echo.
echo =========================================================
echo.
echo   ✅ Servidores iniciados correctamente
echo.
echo =========================================================
echo.
echo.
echo   🌐 Frontend:    http://localhost:8000
echo   🔌 API:         http://localhost:5000
echo   📚 Documentación: http://localhost:5000/docs
echo.
echo =========================================================
echo.
echo   📋 Flujo de prueba:
echo.
echo   1. Abre navegador en: http://localhost:8000
echo   2. Haz clic en "Saltar" en el onboarding
echo   3. Ve a Registro o Login
echo   4. Registra un usuario
echo   5. Verifica datos en: data/usuarios.json
echo.
echo =========================================================
echo.
echo.
pause
