# Script para probar la API PetCare+ con cURL
# Requiere: curl, jq (opcional, para formatear JSON)

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
API_URL="http://localhost:5000/api"
TOKEN=""

echo -e "${YELLOW}🐾 Test API PetCare+${NC}\n"

# 1. Probar salud de la API
echo -e "${YELLOW}1️⃣  Probando estado de la API...${NC}"
curl -s "$API_URL/../health" | jq '.' 2>/dev/null || echo "API no está corriendo. Ejecuta: npm start"

echo -e "\n${YELLOW}2️⃣  Registrando nuevo usuario...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test",
    "apellido": "Usuario",
    "email": "test'$(date +%s)'@example.com",
    "telefono": "5551234567",
    "password": "Test123!"
  }')

echo "$REGISTER_RESPONSE" | jq '.' 2>/dev/null || echo "$REGISTER_RESPONSE"

# Extraer token
TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.token' 2>/dev/null || echo "")

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo -e "${RED}Error: No se obtuvo token${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Token obtenido: ${TOKEN:0:20}...${NC}\n"

# 3. Obtener perfil
echo -e "${YELLOW}3️⃣  Obteniendo perfil del usuario...${NC}"
curl -s -X GET "$API_URL/usuario/perfil" \
  -H "Authorization: Bearer $TOKEN" | jq '.' 2>/dev/null || echo "Error al obtener perfil"

# 4. Crear mascota
echo -e "\n${YELLOW}4️⃣  Creando mascota...${NC}"
PET_RESPONSE=$(curl -s -X POST "$API_URL/mascotas" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "nombre": "Max",
    "tipo": "Perro",
    "raza": "Labrador",
    "edad": 3,
    "genero": "Macho",
    "notas": "Test API"
  }')

echo "$PET_RESPONSE" | jq '.' 2>/dev/null || echo "$PET_RESPONSE"

# Extraer ID de mascota
PET_ID=$(echo "$PET_RESPONSE" | jq -r '.mascota.id' 2>/dev/null || echo "")

if [ ! -z "$PET_ID" ] && [ "$PET_ID" != "null" ]; then
  # 5. Crear cita
  echo -e "\n${YELLOW}5️⃣  Creando cita veterinaria...${NC}"
  curl -s -X POST "$API_URL/citas" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "mascotaId": "'$PET_ID'",
      "fecha": "2024-11-20",
      "hora": "14:30",
      "veterinario": "Dr. García",
      "motivo": "Revisión general",
      "notas": "Test API"
    }' | jq '.' 2>/dev/null

  # 6. Registrar vacuna
  echo -e "\n${YELLOW}6️⃣  Registrando vacuna...${NC}"
  curl -s -X POST "$API_URL/vacunas" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "mascotaId": "'$PET_ID'",
      "nombreVacuna": "Antirrábica",
      "fecha": "2024-10-15",
      "proximaDosis": "2025-10-15",
      "veterinario": "Dr. García",
      "notas": "Primera dosis"
    }' | jq '.' 2>/dev/null
fi

# 7. Obtener estadísticas
echo -e "\n${YELLOW}7️⃣  Obteniendoestadísticas...${NC}"
curl -s -X GET "$API_URL/estadisticas" \
  -H "Authorization: Bearer $TOKEN" | jq '.' 2>/dev/null

echo -e "\n${GREEN}✅ Test completado!${NC}"
