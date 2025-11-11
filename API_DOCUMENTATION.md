# 🐾 PetCare+ - API Documentation

## Descripción General
API REST completa para gestionar mascotas, citas veterinarias, vacunas y perfiles de usuario.

## Configuración

### Requisitos
- Node.js v14+
- npm o yarn

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/Cholises/PetCare-.git
cd PetCare-

# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env

# Iniciar el servidor
npm start
# O en modo desarrollo
npm run dev
```

El servidor se ejecutará en `http://localhost:5000`

---

## Autenticación

### POST `/api/auth/register`
Crear una nueva cuenta de usuario.

**Body:**
```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan@example.com",
  "telefono": "5551234567",
  "password": "MiPassword123!"
}
```

**Response (201):**
```json
{
  "mensaje": "Usuario registrado exitosamente",
  "usuario": {
    "id": "user_1699561234567",
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan@example.com",
    "nombreCompleto": "Juan Pérez"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### POST `/api/auth/login`
Iniciar sesión en una cuenta existente.

**Body:**
```json
{
  "email": "juan@example.com",
  "password": "MiPassword123!"
}
```

**Response (200):**
```json
{
  "mensaje": "Sesión iniciada",
  "usuario": {
    "id": "user_1699561234567",
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan@example.com",
    "nombreCompleto": "Juan Pérez",
    "telefono": "5551234567"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Usuario

### GET `/api/usuario/perfil`
Obtener el perfil del usuario autenticado.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "id": "user_1699561234567",
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan@example.com",
  "telefono": "5551234567",
  "nombreCompleto": "Juan Pérez",
  "creado": "2024-11-10T10:30:00Z"
}
```

---

### PUT `/api/usuario/perfil`
Actualizar el perfil del usuario.

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "nombre": "Juan Carlos",
  "apellido": "García",
  "telefono": "5559876543"
}
```

**Response (200):**
```json
{
  "mensaje": "Perfil actualizado",
  "usuario": { ... }
}
```

---

## Mascotas

### GET `/api/mascotas`
Obtener todas las mascotas del usuario.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
[
  {
    "id": "pet_1699561234567",
    "usuarioId": "user_1699561234567",
    "nombre": "Max",
    "tipo": "Perro",
    "raza": "Labrador",
    "edad": 3,
    "genero": "Macho",
    "notas": "Muy energético",
    "creada": "2024-11-10T10:30:00Z"
  }
]
```

---

### POST `/api/mascotas`
Crear una nueva mascota.

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "nombre": "Max",
  "tipo": "Perro",
  "raza": "Labrador",
  "edad": 3,
  "genero": "Macho",
  "notas": "Muy energético"
}
```

**Response (201):**
```json
{
  "mensaje": "Mascota creada exitosamente",
  "mascota": { ... }
}
```

---

### PUT `/api/mascotas/{id}`
Actualizar una mascota existente.

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "nombre": "Max",
  "edad": 4,
  "notas": "Ahora más tranquilo"
}
```

---

### DELETE `/api/mascotas/{id}`
Eliminar una mascota.

**Headers:**
```
Authorization: Bearer {token}
```

---

## Citas Veterinarias

### GET `/api/citas`
Obtener todas las citas del usuario.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
[
  {
    "id": "apt_1699561234567",
    "usuarioId": "user_1699561234567",
    "mascotaId": "pet_1699561234567",
    "fecha": "2024-11-20",
    "hora": "14:30",
    "veterinario": "Dr. García",
    "motivo": "Revisión general",
    "notas": "Llevar cartilla",
    "estado": "programada",
    "creada": "2024-11-10T10:30:00Z"
  }
]
```

---

### POST `/api/citas`
Crear una nueva cita.

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "mascotaId": "pet_1699561234567",
  "fecha": "2024-11-20",
  "hora": "14:30",
  "veterinario": "Dr. García",
  "motivo": "Revisión general",
  "notas": "Llevar cartilla"
}
```

---

### PUT `/api/citas/{id}`
Actualizar una cita.

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "fecha": "2024-11-21",
  "hora": "15:00",
  "estado": "completada"
}
```

---

### DELETE `/api/citas/{id}`
Eliminar una cita.

**Headers:**
```
Authorization: Bearer {token}
```

---

## Vacunas

### GET `/api/vacunas`
Obtener todas las vacunas del usuario.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
[
  {
    "id": "vac_1699561234567",
    "usuarioId": "user_1699561234567",
    "mascotaId": "pet_1699561234567",
    "nombreVacuna": "Antirrábica",
    "fecha": "2024-10-15",
    "proximaDosis": "2025-10-15",
    "veterinario": "Dr. García",
    "notas": "Primera dosis",
    "creada": "2024-11-10T10:30:00Z"
  }
]
```

---

### POST `/api/vacunas`
Registrar una nueva vacuna.

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "mascotaId": "pet_1699561234567",
  "nombreVacuna": "Antirrábica",
  "fecha": "2024-10-15",
  "proximaDosis": "2025-10-15",
  "veterinario": "Dr. García",
  "notas": "Primera dosis"
}
```

---

### DELETE `/api/vacunas/{id}`
Eliminar un registro de vacuna.

**Headers:**
```
Authorization: Bearer {token}
```

---

## Estadísticas

### GET `/api/estadisticas`
Obtener estadísticas del usuario.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "totalMascotas": 2,
  "totalCitas": 5,
  "totalVacunas": 3,
  "proximasCitas": 1,
  "mascotas": [
    { "id": "pet_1", "nombre": "Max", "tipo": "Perro" },
    { "id": "pet_2", "nombre": "Luna", "tipo": "Gato" }
  ]
}
```

---

## Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| 200 | Éxito |
| 201 | Creado |
| 400 | Solicitud inválida |
| 401 | No autorizado |
| 404 | No encontrado |
| 500 | Error del servidor |

---

## Estructura de Almacenamiento

Los datos se almacenan localmente en archivos JSON en la carpeta `data/`:

- `usuarios.json` - Información de usuarios
- `mascotas.json` - Datos de mascotas
- `citas.json` - Citas veterinarias
- `vacunas.json` - Registros de vacunas

---

## Uso desde Frontend

```javascript
// Crear instancia del cliente API
const api = new APIClient();

// Registrarse
await api.register('Juan', 'Pérez', 'juan@example.com', '5551234567', 'password123');

// Iniciar sesión
await api.login('juan@example.com', 'password123');

// Obtener mascotas
const mascotas = await api.getPets();

// Crear mascota
await api.createPet('Max', 'Perro', 'Labrador', 3, 'Macho', 'Muy activo');

// Crear cita
await api.createAppointment('pet_id', '2024-11-20', '14:30', 'Dr. García', 'Revisión', 'Llevar cartilla');
```

---

## Seguridad

- Las contraseñas se almacenan con hash bcrypt
- Los tokens JWT expiran en 7 días
- Se valida el token en cada petición protegida

---

## Mejoras Futuras

- [ ] Base de datos MongoDB/PostgreSQL
- [ ] Autenticación con Google/Facebook
- [ ] Sistema de notificaciones
- [ ] Historial clínico detallado
- [ ] Subida de fotos
- [ ] Panel administrativo
- [ ] Integración con veterinarios

---

## Soporte

Para reportar problemas, abre un issue en el repositorio.

---

**© 2024 PetCare+. Todos los derechos reservados.**
