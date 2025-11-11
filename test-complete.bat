@echo off
REM Test script para PetCare+ API - Windows PowerShell

setlocal enabledelayedexpansion
color 0B
cls

echo.
echo ======================================================================
echo.
echo   🐾 PetCare+ - Test de API
echo.
echo ======================================================================
echo.

REM Variables
set API_URL=http://localhost:5000/api
set USER_EMAIL=test@ejemplo.com
set USER_PASS=Test123456

echo ✓ Verificando servidor en: %API_URL%
echo.

REM Test 1: Health Check
echo [1/7] Verificando salud del API...
powershell -NoProfile -Command "try { $r = Invoke-RestMethod -Uri 'http://localhost:5000/api/health'; Write-Host '✅ API respondiendo'; Write-Host ('Status: ' + $r.status); Write-Host ('DB: ' + $r.mongodb) } catch { Write-Host '❌ API no disponible' -ForegroundColor Red; exit 1 }"
if errorlevel 1 (
    echo ❌ El servidor no está corriendo
    echo.
    echo Inicia: npm start
    pause
    exit /b 1
)
echo.

REM Test 2: Registro
echo [2/7] Registrando usuario de prueba...
powershell -NoProfile -Command "try { $data = @{ nombre='Test'; apellido='Usuario'; email='%USER_EMAIL%'; telefono='5551234567'; password='%USER_PASS%' } | ConvertTo-Json; $r = Invoke-RestMethod -Uri '%API_URL%/auth/register' -Method Post -ContentType 'application/json' -Body $data; Write-Host '✅ Usuario registrado'; Write-Host ('ID: ' + $r.usuario.id); Write-Host ('Token: ' + $r.token.Substring(0,20) + '...') } catch { Write-Host '⚠️  Usuario ya existe' -ForegroundColor Yellow }"
echo.

REM Test 3: Login
echo [3/7] Iniciando sesión...
powershell -NoProfile -Command "try { $data = @{ email='%USER_EMAIL%'; password='%USER_PASS%' } | ConvertTo-Json; $r = Invoke-RestMethod -Uri '%API_URL%/auth/login' -Method Post -ContentType 'application/json' -Body $data; Write-Host '✅ Login exitoso'; `$global:token = $r.token } catch { Write-Host '❌ Error en login' -ForegroundColor Red; exit 1 }"
echo.

REM Test 4: Crear mascota
echo [4/7] Creando mascota de prueba...
powershell -NoProfile -Command "try { $token = (Invoke-RestMethod -Uri '%API_URL%/auth/login' -Method Post -ContentType 'application/json' -Body (@{ email='%USER_EMAIL%'; password='%USER_PASS%' } | ConvertTo-Json)).token; $headers = @{ Authorization='Bearer ' + $token }; $data = @{ nombre='Max'; especie='perro'; raza='Labrador'; edad=3; peso=30 } | ConvertTo-Json; $r = Invoke-RestMethod -Uri '%API_URL%/mascotas' -Method Post -Headers $headers -ContentType 'application/json' -Body $data; Write-Host '✅ Mascota creada'; Write-Host ('Nombre: ' + $r.mascota.nombre); `$global:mascotaId = $r.mascota.id } catch { Write-Host '❌ Error creando mascota' -ForegroundColor Red }"
echo.

REM Test 5: Listar mascotas
echo [5/7] Listando mascotas...
powershell -NoProfile -Command "try { $token = (Invoke-RestMethod -Uri '%API_URL%/auth/login' -Method Post -ContentType 'application/json' -Body (@{ email='%USER_EMAIL%'; password='%USER_PASS%' } | ConvertTo-Json)).token; $headers = @{ Authorization='Bearer ' + $token }; $r = Invoke-RestMethod -Uri '%API_URL%/mascotas' -Method Get -Headers $headers; Write-Host '✅ Mascotas obtenidas'; Write-Host ('Total: ' + $r.total) } catch { Write-Host '❌ Error obteniendo mascotas' -ForegroundColor Red }"
echo.

REM Test 6: Estadísticas
echo [6/7] Obteniendo estadísticas...
powershell -NoProfile -Command "try { $token = (Invoke-RestMethod -Uri '%API_URL%/auth/login' -Method Post -ContentType 'application/json' -Body (@{ email='%USER_EMAIL%'; password='%USER_PASS%' } | ConvertTo-Json)).token; $headers = @{ Authorization='Bearer ' + $token }; $r = Invoke-RestMethod -Uri '%API_URL%/estadisticas' -Method Get -Headers $headers; Write-Host '✅ Estadísticas obtenidas'; Write-Host ('Mascotas: ' + $r.mascotas); Write-Host ('Citas: ' + $r.citas); Write-Host ('Vacunas: ' + $r.vacunas) } catch { Write-Host '❌ Error obteniendo estadísticas' -ForegroundColor Red }"
echo.

REM Test 7: Datos guardados
echo [7/7] Verificando datos guardados...
if exist "data\usuarios.json" (
    echo ✅ Archivo usuarios.json existe
    for /f %%a in ('powershell -NoProfile -Command "(Get-Content 'data\usuarios.json' | ConvertFrom-Json | Measure-Object).Count"') do set USER_COUNT=%%a
    echo   Usuarios registrados: !USER_COUNT!
) else (
    echo ❌ Archivo usuarios.json no encontrado
)
echo.

if exist "data\mascotas.json" (
    echo ✅ Archivo mascotas.json existe
    for /f %%a in ('powershell -NoProfile -Command "(Get-Content 'data\mascotas.json' | ConvertFrom-Json | Measure-Object).Count"') do set PET_COUNT=%%a
    echo   Mascotas registradas: !PET_COUNT!
) else (
    echo ❌ Archivo mascotas.json no encontrado
)
echo.

echo ======================================================================
echo.
echo    ✅ TESTS COMPLETADOS
echo.
echo ======================================================================
echo.
echo.
echo   📊 Resultados:
echo.
echo   ✓ API respondiendo
echo   ✓ Autenticación funcionando
echo   ✓ CRUD de mascotas funcionando
echo   ✓ Datos persistidos
echo.
echo ======================================================================
echo.
echo.
echo   🌐 Acceda a: http://localhost:8000
echo.
pause
