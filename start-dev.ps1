# Script para iniciar desarrollo local de PetCare+
# Este script inicia API (puerto 5000) + Frontend (puerto 8000)

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "🐾 PetCare+ - Inicializando Desarrollo" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Requisitos:" -ForegroundColor Yellow
Write-Host "  • Node.js v14+ instalado"
Write-Host "  • npm instalado"
Write-Host ""

Write-Host "🚀 Iniciando servidores..." -ForegroundColor Yellow
Write-Host ""

# Terminal 1: API (Node.js + Express)
Write-Host "Terminal 1️⃣  - API Server (Puerto 5000)" -ForegroundColor Cyan
Write-Host "Comando: npm start" -ForegroundColor Gray
Write-Host ""

# Terminal 2: Frontend (http-server)
Write-Host "Terminal 2️⃣  - Frontend Server (Puerto 8000)" -ForegroundColor Cyan
Write-Host "Comando: npx http-server -p 8000 -c-1" -ForegroundColor Gray
Write-Host ""

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "📌 URLs de acceso:" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "  🌐 Frontend:    http://localhost:8000" -ForegroundColor Magenta
Write-Host "  🔌 API:         http://localhost:5000" -ForegroundColor Magenta
Write-Host "  📚 Documentación: http://localhost:5000/docs (o API_DOCUMENTATION.md)" -ForegroundColor Magenta
Write-Host ""

Write-Host "🔄 Flujo de prueba:" -ForegroundColor Yellow
Write-Host "  1. Abre navegador en: http://localhost:8000" -ForegroundColor Gray
Write-Host "  2. Haz clic en 'Saltar' en el onboarding" -ForegroundColor Gray
Write-Host "  3. Ve a Registro o Login" -ForegroundColor Gray
Write-Host "  4. Completa el formulario y registra un usuario" -ForegroundColor Gray
Write-Host "  5. Verifica datos en carpeta 'data/usuarios.json'" -ForegroundColor Gray
Write-Host ""

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "⚡ Iniciando..." -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Iniciar API en Terminal 1
Write-Host "► Iniciando API..." -ForegroundColor Cyan
npm start &
$API_PID = $?

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "► Iniciando Frontend..." -ForegroundColor Cyan
cd "$PSScriptRoot\www"
npx http-server -p 8000 -c-1 &
$FRONTEND_PID = $?

Write-Host ""
Write-Host "=================================================" -ForegroundColor Green
Write-Host "✅ Servidores en ejecución" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Abre en tu navegador: http://localhost:8000" -ForegroundColor Magenta
Write-Host ""
Write-Host "Presiona CTRL+C para detener..." -ForegroundColor Yellow
Write-Host ""

# Mantener script abierto
while ($true) {
  Start-Sleep -Seconds 1
}
