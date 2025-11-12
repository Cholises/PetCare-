# 📚 Documentación API - PetCare+ v3.0

## 🌐 Base URL

```
http://localhost:5000/api
```

O desde móvil:
```
http://TU_IP_LOCAL:5000/api
```

---

## 🔐 Autenticación

Todos los endpoints (excepto registro y login) requieren un token JWT en el header:

```
Authorization: Bearer <tu_token_aqui>
```

**Ejemplo con fetch:**
```javascript
const token = localStorage.getItem('authToken');
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};

const response = await fetch('http://localhost:5000/api/mascotas', {
  method: 'GET',
  headers
});
```

---

## 📋 Endpoints

### 🔑 AUTENTICACIÓN

#### `POST /auth/register`
Crear una nueva cuenta de usuario.

**Body:**
```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan@ejemplo.com",
  "telefono": "5551234567",
  "password": "MiPassword123"
}
```

**Response (201):**
```json
{
  "mensaje": "Usuario registrado exitosamente",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": "507f1f77bcf86cd799439011",
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan@ejemplo.com",
    "telefono": "5551234567"
  }
}
```

**Errores:**
- `400` - Faltan campos requeridos
- `400` - El email ya está registrado

---

#### `POST /auth/login`
Iniciar sesión con credenciales.

**Body:**
```json
{
  "email": "juan@ejemplo.com",
  "password": "MiPassword123"
}
```

**Response (200):**
```json
{
  "mensaje": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": "507f1f77bcf86cd799439011",
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan@ejemplo.com",
    "telefono": "5551234567"
  }
}
```

**Errores:**
- `401` - Credenciales inválidas

---

### 🐾 MASCOTAS

#### `GET /mascotas`
Obtener todas las mascotas del usuario autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "mascotas": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "usuarioId": "507f1f77bcf86cd799439011",
      "nombre": "Max",
      "especie": "perro",
      "raza": "Labrador",
      "edad": 3,
      "peso": 30.5,
      "color": "Negro",
      "sexo": "macho",
      "fechaNacimiento": "2022-01-15T00:00:00.000Z",
      "microchip": "123456789",
      "foto": "data:image/jpeg;base64,...",
      "descripcion": "Muy activo y amigable",
      "createdAt": "2025-11-10T12:00:00.000Z",
      "updatedAt": "2025-11-10T12:00:00.000Z"
    }
  ],
  "total": 1
}
```

---

#### `POST /mascotas`
Crear una nueva mascota.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "nombre": "Max",
  "especie": "perro",
  "raza": "Labrador",
  "edad": 3,
  "peso": 30.5,
  "color": "Negro",
  "sexo": "macho",
  "fechaNacimiento": "2022-01-15",
  "microchip": "123456789",
  "foto": "data:image/jpeg;base64,...",
  "descripcion": "Muy activo y amigable"
}
```

**Response (201):**
```json
{
  "mensaje": "Mascota creada exitosamente",
  "mascota": {
    "_id": "507f1f77bcf86cd799439012",
    "nombre": "Max",
    "especie": "perro",
    "raza": "Labrador",
    "edad": 3,
    "peso": 30.5
  }
}
```

**Errores:**
- `400` - Nombre y especie son requeridos

---

#### `GET /mascotas/:id`
Obtener detalles de una mascota específica.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "usuarioId": "507f1f77bcf86cd799439011",
  "nombre": "Max",
  "especie": "perro",
  "raza": "Labrador",
  "edad": 3,
  "peso": 30.5,
  "color": "Negro",
  "sexo": "macho",
  "fechaNacimiento": "2022-01-15T00:00:00.000Z",
  "microchip": "123456789",
  "foto": "data:image/jpeg;base64,...",
  "descripcion": "Muy activo y amigable",
  "createdAt": "2025-11-10T12:00:00.000Z",
  "updatedAt": "2025-11-10T12:00:00.000Z"
}
```

---

#### `PUT /mascotas/:id`
Actualizar información de una mascota.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:** (todos los campos son opcionales)
```json
{
  "nombre": "Max",
  "especie": "perro",
  "raza": "Labrador Retriever",
  "edad": 4,
  "peso": 31.5,
  "color": "Negro y Marrón",
  "sexo": "macho",
  "fechaNacimiento": "2022-01-15",
  "microchip": "123456789",
  "foto": "data:image/jpeg;base64,...",
  "descripcion": "Muy activo, le encanta nadar"
}
```

**Response (200):**
```json
{
  "mensaje": "Mascota actualizada",
  "mascota": {
    "_id": "507f1f77bcf86cd799439012",
    "nombre": "Max",
    "especie": "perro",
    "raza": "Labrador Retriever",
    "edad": 4,
    "peso": 31.5,
    "updatedAt": "2025-11-11T10:30:00.000Z"
  }
}
```

---

#### `DELETE /mascotas/:id`
Eliminar una mascota.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "mensaje": "Mascota eliminada",
  "mascota": {
    "_id": "507f1f77bcf86cd799439012",
    "nombre": "Max"
  }
}
```

---

### 📅 CITAS VETERINARIAS

#### `GET /citas`
Obtener todas las citas del usuario.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "citas": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "usuarioId": "507f1f77bcf86cd799439011",
      "mascotaId": "507f1f77bcf86cd799439012",
      "fecha": "2025-11-20T14:00:00.000Z",
      "hora": "14:00",
      "veterinario": "Dr. García",
      "clinica": "Clínica Veterinaria Central",
      "razon": "Revisión general",
      "notas": "Traer cartilla de vacunas",
      "estado": "pendiente",
      "createdAt": "2025-11-10T12:00:00.000Z"
    }
  ],
  "total": 1
}
```

---

#### `POST /citas`
Crear una nueva cita veterinaria.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "mascotaId": "507f1f77bcf86cd799439012",
  "fecha": "2025-11-20T14:00:00Z",
  "hora": "14:00",
  "veterinario": "Dr. García",
  "clinica": "Clínica Veterinaria Central",
  "razon": "Revisión general",
  "notas": "Traer cartilla de vacunas"
}
```

**Response (201):**
```json
{
  "mensaje": "Cita creada",
  "cita": {
    "_id": "507f1f77bcf86cd799439013",
    "mascotaId": "507f1f77bcf86cd799439012",
    "fecha": "2025-11-20T14:00:00.000Z",
    "estado": "pendiente"
  }
}
```

---

#### `PUT /citas/:id`
Actualizar una cita (cambiar estado, etc).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "estado": "completada",
  "notas": "Cita completada, mascota en buen estado"
}
```

**Response (200):**
```json
{
  "mensaje": "Cita actualizada",
  "cita": {
    "_id": "507f1f77bcf86cd799439013",
    "estado": "completada"
  }
}
```

---

#### `DELETE /citas/:id`
Eliminar una cita.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "mensaje": "Cita eliminada",
  "cita": {
    "_id": "507f1f77bcf86cd799439013"
  }
}
```

---

### 💉 VACUNAS

#### `GET /vacunas`
Obtener todas las vacunas del usuario.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "vacunas": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "usuarioId": "507f1f77bcf86cd799439011",
      "mascotaId": "507f1f77bcf86cd799439012",
      "nombre": "Pentavalente",
      "fecha": "2025-10-15T00:00:00.000Z",
      "proximaFecha": "2025-12-15T00:00:00.000Z",
      "veterinario": "Dra. López",
      "clinica": "Clínica Veterinaria Central",
      "lote": "LOT123456",
      "notas": "Sin reacciones adversas",
      "createdAt": "2025-11-10T12:00:00.000Z"
    }
  ],
  "total": 1
}
```

---

#### `POST /vacunas`
Registrar una nueva vacuna.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "mascotaId": "507f1f77bcf86cd799439012",
  "nombre": "Pentavalente",
  "fecha": "2025-10-15",
  "proximaFecha": "2025-12-15",
  "veterinario": "Dra. López",
  "clinica": "Clínica Veterinaria Central",
  "lote": "LOT123456",
  "notas": "Sin reacciones adversas"
}
```

**Response (201):**
```json
{
  "mensaje": "Vacuna registrada",
  "vacuna": {
    "_id": "507f1f77bcf86cd799439014",
    "nombre": "Pentavalente",
    "fecha": "2025-10-15T00:00:00.000Z"
  }
}
```

---

#### `DELETE /vacunas/:id`
Eliminar un registro de vacuna.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "mensaje": "Vacuna eliminada",
  "vacuna": {
    "_id": "507f1f77bcf86cd799439014",
    "nombre": "Pentavalente"
  }
}
```

---

### 📊 ESTADÍSTICAS

#### `GET /estadisticas`
Obtener estadísticas del usuario (resumen).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "mascotas": 3,
  "citas": 2,
  "vacunas": 5,
  "proximas_citas": 1
}
```

---

### 💚 SALUD

#### `GET /health`
Verificar estado del servidor y conexión a MongoDB.

**Response (200):**
```json
{
  "status": "OK",
  "timestamp": "2025-11-11T10:30:00.000Z",
  "server": "http://192.168.1.50:5000",
  "mongodb": "conectado"
}
```

---

## 🧪 Ejemplos Completos

### Ejemplo 1: Registro y crear mascota

```javascript
// 1. Registrarse
const regResponse = await fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'juan@ejemplo.com',
    telefono: '5551234567',
    password: 'MiPassword123'
  })
});

const regData = await regResponse.json();
const token = regData.token;
localStorage.setItem('authToken', token);

// 2. Crear mascota
const petResponse = await fetch('http://localhost:5000/api/mascotas', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    nombre: 'Max',
    especie: 'perro',
    raza: 'Labrador',
    edad: 3,
    peso: 30.5
  })
});

const petData = await petResponse.json();
console.log('Mascota creada:', petData.mascota);
```

---

### Ejemplo 2: Obtener estadísticas

```javascript
const token = localStorage.getItem('authToken');

const response = await fetch('http://localhost:5000/api/estadisticas', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const stats = await response.json();
console.log('Total de mascotas:', stats.mascotas);
console.log('Próximas citas:', stats.proximas_citas);
console.log('Total vacunas:', stats.vacunas);
```

---

## 🔄 Códigos de Estado HTTP

| Código | Significado |
|--------|------------|
| `200` | OK - Solicitud exitosa |
| `201` | Created - Recurso creado |
| `400` | Bad Request - Datos inválidos |
| `401` | Unauthorized - Token inválido o expirado |
| `404` | Not Found - Recurso no encontrado |
| `500` | Server Error - Error del servidor |

---

## 🛡️ Notas de Seguridad

- Los tokens JWT expiran en **7 días**
- Las contraseñas se hashean con **bcrypt** (10 rounds)
- Todos los endpoints protegidos requieren token válido
- El servidor valida que la mascota/cita pertenece al usuario autenticado
- Las fotos se guardan en base64 (máximo 50MB)

---

## 🗄️ Datos Persistidos

Los datos se guardan en:
- **MongoDB** (si está disponible) - `petcare` database
- **JSON files** (fallback) - carpeta `data/`

---

## 📝 Consideraciones

- Todas las fechas están en formato ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`)
- Los IDs de MongoDB son ObjectId (24 caracteres hexadecimales)
- Las fotos en base64 pueden ser grandes - considera optimizar antes de enviar
- El token debe incluir `Bearer ` antes del valor

---

## 🔗 Relacionados

- Ver: `LEEME.txt` - Guía rápida
- Ver: `INICIO_RAPIDO.md` - Instrucciones de inicio
- Ver: `MONGODB_SETUP.md` - Configuración de base de datos

---

**Versión:** 3.0  
**Última actualización:** 11 de noviembre de 2025
