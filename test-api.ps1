# Script para probar la API PetCare+ en Windows PowerShell
# Uso: .\test-api.ps1

# Variables
$API_URL = "http://localhost:5000/api"
$TOKEN = ""
$USER_EMAIL = "test$(Get-Date -Format 'yyyyMMddHHmmss')@example.com"

Write-Host "🐾 Test API PetCare+" -ForegroundColor Yellow
Write-Host ""

# 1. Probar salud de la API
Write-Host "1️⃣  Probando estado de la API..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "$API_URL/../health" -Method Get -ErrorAction Stop
    Write-Host "✅ API funcionando" -ForegroundColor Green
    Write-Host ($healthResponse | ConvertTo-Json -Depth 3)
} catch {
    Write-Host "❌ API no está corriendo. Ejecuta: npm start" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 2. Registrar nuevo usuario
Write-Host "2️⃣  Registrando nuevo usuario..." -ForegroundColor Yellow

$registerBody = @{
    nombre = "Test"
    apellido = "Usuario"
    email = $USER_EMAIL
    telefono = "5551234567"
    password = "Test123!"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$API_URL/auth/register" `
        -Method Post `
        -Body $registerBody `
        -ContentType "application/json" `
        -ErrorAction Stop
    
    Write-Host "✅ Usuario registrado" -ForegroundColor Green
    Write-Host ($registerResponse | ConvertTo-Json -Depth 3)
    
    # Extraer token
    $TOKEN = $registerResponse.token
    
    if ([string]::IsNullOrEmpty($TOKEN)) {
        Write-Host "❌ Error: No se obtuvo token" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Token obtenido: $($TOKEN.Substring(0,20))..." -ForegroundColor Green
} catch {
    Write-Host "❌ Error en registro: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 3. Obtener perfil
Write-Host "3️⃣  Obteniendo perfil del usuario..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $TOKEN"
    }
    
    $profileResponse = Invoke-RestMethod -Uri "$API_URL/usuario/perfil" `
        -Method Get `
        -Headers $headers `
        -ErrorAction Stop
    
    Write-Host "✅ Perfil obtenido:" -ForegroundColor Green
    Write-Host ($profileResponse | ConvertTo-Json -Depth 3)
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 4. Crear mascota
Write-Host "4️⃣  Creando mascota..." -ForegroundColor Yellow

$petBody = @{
    nombre = "Max"
    tipo = "Perro"
    raza = "Labrador"
    edad = 3
    genero = "Macho"
    notas = "Test API"
} | ConvertTo-Json

try {
    $headers = @{
        "Authorization" = "Bearer $TOKEN"
    }
    
    $petResponse = Invoke-RestMethod -Uri "$API_URL/mascotas" `
        -Method Post `
        -Body $petBody `
        -ContentType "application/json" `
        -Headers $headers `
        -ErrorAction Stop
    
    Write-Host "✅ Mascota creada:" -ForegroundColor Green
    Write-Host ($petResponse | ConvertTo-Json -Depth 3)
    
    $PET_ID = $petResponse.mascota.id
    
    if (-not [string]::IsNullOrEmpty($PET_ID)) {
        Write-Host ""
        
        # 5. Crear cita
        Write-Host "5️⃣  Creando cita veterinaria..." -ForegroundColor Yellow
        
        $appointmentBody = @{
            mascotaId = $PET_ID
            fecha = "2024-11-20"
            hora = "14:30"
            veterinario = "Dr. García"
            motivo = "Revisión general"
            notas = "Test API"
        } | ConvertTo-Json
        
        try {
            $appointmentResponse = Invoke-RestMethod -Uri "$API_URL/citas" `
                -Method Post `
                -Body $appointmentBody `
                -ContentType "application/json" `
                -Headers $headers `
                -ErrorAction Stop
            
            Write-Host "✅ Cita creada:" -ForegroundColor Green
            Write-Host ($appointmentResponse | ConvertTo-Json -Depth 3)
        } catch {
            Write-Host "⚠️ Error en cita: $($_.Exception.Message)" -ForegroundColor Yellow
        }
        
        Write-Host ""
        
        # 6. Registrar vacuna
        Write-Host "6️⃣  Registrando vacuna..." -ForegroundColor Yellow
        
        $vaccineBody = @{
            mascotaId = $PET_ID
            nombreVacuna = "Antirrábica"
            fecha = "2024-10-15"
            proximaDosis = "2025-10-15"
            veterinario = "Dr. García"
            notas = "Primera dosis"
        } | ConvertTo-Json
        
        try {
            $vaccineResponse = Invoke-RestMethod -Uri "$API_URL/vacunas" `
                -Method Post `
                -Body $vaccineBody `
                -ContentType "application/json" `
                -Headers $headers `
                -ErrorAction Stop
            
            Write-Host "✅ Vacuna registrada:" -ForegroundColor Green
            Write-Host ($vaccineResponse | ConvertTo-Json -Depth 3)
        } catch {
            Write-Host "⚠️ Error en vacuna: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 7. Obtener estadísticas
Write-Host "7️⃣  Obteniendo estadísticas..." -ForegroundColor Yellow
try {
    $statsResponse = Invoke-RestMethod -Uri "$API_URL/estadisticas" `
        -Method Get `
        -Headers $headers `
        -ErrorAction Stop
    
    Write-Host "✅ Estadísticas:" -ForegroundColor Green
    Write-Host ($statsResponse | ConvertTo-Json -Depth 3)
} catch {
    Write-Host "⚠️ Error: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Test completado!" -ForegroundColor Green
