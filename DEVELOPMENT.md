# 🛠️ Guía de Desarrollo - PetCare+

Guía completa para desarrolladores que quieran contribuir o entender mejor el proyecto.

---

## 📋 Tabla de Contenidos

1. [Configuración del Ambiente](#configuración-del-ambiente)
2. [Estructura del Código](#estructura-del-código)
3. [API Client (Frontend)](#api-client-frontend)
4. [Backend (Node.js)](#backend-nodejs)
5. [Agregar Nuevas Funcionalidades](#agregar-nuevas-funcionalidades)
6. [Testing](#testing)
7. [Deploy](#deploy)

---

## Configuración del Ambiente

### Windows (PowerShell)

```powershell
# 1. Verificar Node.js
node --version
npm --version

# 2. Clonar repositorio
git clone https://github.com/Cholises/PetCare-.git
cd PetCare-

# 3. Instalar dependencias
npm install

# 4. Crear archivo .env
Copy-Item .env.example -Destination .env

# 5. Iniciar servidor (Terminal 1)
npm start

# 6. Iniciar frontend (Terminal 2)
# Usar Live Server en VS Code
```

### macOS/Linux

```bash
# 1. Verificar Node.js
node --version
npm --version

# 2. Clonar repositorio
git clone https://github.com/Cholises/PetCare-.git
cd PetCare-

# 3. Instalar dependencias
npm install

# 4. Crear archivo .env
cp .env.example .env

# 5. Iniciar servidor
npm start

# 6. Iniciar frontend con Live Server
```

---

## Estructura del Código

### Frontend (`www/`)

```
www/
├── index.html              # Onboarding - Pantalla de bienvenida
├── login.html              # Login existente
├── registro.html           # Registro mejorado con API
├── menu.html               # Dashboard principal
├── citas.html              # Gestión de citas
├── vacunas.html            # Gestión de vacunas
├── historial_medico.html   # Historial médico
├── calendario.html         # Calendario de eventos
├── recordatorios.html      # Sistema de recordatorios
├── creado.html             # Pantalla de confirmación
│
├── css/
│   ├── style.css           # Estilos globales y variables
│   ├── login.css           # Estilos de autenticación
│   ├── menu.css            # Estilos del dashboard
│   ├── citas.css           # Estilos de citas
│   ├── vacunas.css         # Estilos de vacunas
│   ├── registro.css        # Estilos de registro
│   └── index.css           # Estilos de onboarding
│
├── js/
│   ├── api-client.js       # ⭐ Cliente API (NUEVO)
│   ├── login.js            # Lógica mejorada de login
│   ├── registro.js         # Lógica mejorada de registro
│   ├── menu.js             # Lógica del dashboard
│   ├── mascotas.js         # Gestión de mascotas
│   ├── citas.js            # Gestión de citas
│   ├── vacunas.js          # Gestión de vacunas
│   ├── onboarding.js       # Lógica del onboarding
│   └── creado.js           # Confirmación
│
└── img/                    # Imágenes y assets
```

### Backend (`server.js`)

```javascript
// Estructura del servidor
├── Configuración
│   ├── Express app
│   ├── Middleware CORS
│   ├── Body parser
│   └── Autenticación JWT
│
├── Funciones Helper
│   ├── readData()          // Leer JSON
│   ├── writeData()         // Escribir JSON
│   └── verifyToken()       // Validar JWT
│
├── Rutas de Autenticación
│   ├── POST /auth/register
│   └── POST /auth/login
│
├── Rutas de Usuario
│   ├── GET /usuario/perfil
│   └── PUT /usuario/perfil
│
├── Rutas de Mascotas
│   ├── GET /mascotas
│   ├── POST /mascotas
│   ├── PUT /mascotas/:id
│   └── DELETE /mascotas/:id
│
├── Rutas de Citas
│   ├── GET /citas
│   ├── POST /citas
│   ├── PUT /citas/:id
│   └── DELETE /citas/:id
│
├── Rutas de Vacunas
│   ├── GET /vacunas
│   ├── POST /vacunas
│   └── DELETE /vacunas/:id
│
└── Rutas de Estadísticas
    └── GET /estadisticas
```

---

## API Client (Frontend)

### Uso Básico

```javascript
// 1. El script se carga automáticamente
<script src="js/api-client.js"></script>

// 2. La instancia global está disponible
const api = new APIClient();

// 3. Usar cualquier método
await api.register('Juan', 'Pérez', 'juan@example.com', '5551234567', 'password');
```

### Métodos Disponibles

#### Autenticación
```javascript
// Registrar usuario
await api.register(nombre, apellido, email, telefono, password);

// Iniciar sesión
await api.login(email, password);

// Cerrar sesión
api.logout();
```

#### Mascotas
```javascript
// Obtener todas las mascotas
const mascotas = await api.getPets();

// Crear mascota
await api.createPet(nombre, tipo, raza, edad, genero, notas);

// Actualizar mascota
await api.updatePet(id, nombre, tipo, raza, edad, genero, notas);

// Eliminar mascota
await api.deletePet(id);
```

#### Citas
```javascript
// Obtener citas
const citas = await api.getAppointments();

// Crear cita
await api.createAppointment(mascotaId, fecha, hora, veterinario, motivo, notas);

// Actualizar cita
await api.updateAppointment(id, fecha, hora, veterinario, motivo, notas, estado);

// Eliminar cita
await api.deleteAppointment(id);
```

#### Vacunas
```javascript
// Obtener vacunas
const vacunas = await api.getVaccines();

// Crear vacuna
await api.createVaccine(mascotaId, nombreVacuna, fecha, proximaDosis, veterinario, notas);

// Eliminar vacuna
await api.deleteVaccine(id);
```

#### Usuario
```javascript
// Obtener perfil
const perfil = await api.getProfile();

// Actualizar perfil
await api.updateProfile(nombre, apellido, telefono);
```

#### Estadísticas
```javascript
// Obtener estadísticas
const stats = await api.getStatistics();
```

---

## Backend (Node.js)

### Estructura de Datos

#### Usuarios
```json
{
  "id": "user_1699561234567",
  "nombre": "Juan",
  "apellido": "Pérez",
  "nombreCompleto": "Juan Pérez",
  "email": "juan@example.com",
  "telefono": "5551234567",
  "password": "hash_bcrypt_aqui",
  "creado": "2024-11-10T10:30:00Z",
  "activo": true
}
```

#### Mascotas
```json
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
```

#### Citas
```json
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
```

#### Vacunas
```json
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
```

### Agregar Nuevo Endpoint

```javascript
// Patrón a seguir

// 1. Definir ruta
app.post('/api/nueva-ruta', verifyToken, async (req, res) => {
  try {
    // 2. Validar datos
    const { campo1, campo2 } = req.body;
    if (!campo1 || !campo2) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    // 3. Leer datos
    const datos = readData(miArchivo);

    // 4. Procesar
    const nuevoItem = {
      id: 'tipo_' + Date.now(),
      usuarioId: req.user.id,
      campo1,
      campo2,
      creado: new Date().toISOString()
    };

    // 5. Guardar
    datos.push(nuevoItem);
    writeData(miArchivo, datos);

    // 6. Responder
    res.status(201).json({
      mensaje: 'Creado exitosamente',
      item: nuevoItem
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al procesar' });
  }
});
```

---

## Agregar Nuevas Funcionalidades

### Ejemplo: Agregar "Notas Médicas"

#### 1. Backend (server.js)

```javascript
// Agregar ruta para notas
app.post('/api/notas', verifyToken, (req, res) => {
  try {
    const { mascotaId, titulo, contenido } = req.body;
    // ... resto del código
  }
});
```

#### 2. API Client (api-client.js)

```javascript
async createNote(mascotaId, titulo, contenido) {
  return this.request('/notas', {
    method: 'POST',
    body: JSON.stringify({ mascotaId, titulo, contenido })
  });
}
```

#### 3. Frontend (notas.js)

```javascript
document.getElementById('crearNotaBtn').addEventListener('click', async () => {
  const titulo = document.getElementById('titulo').value;
  const contenido = document.getElementById('contenido').value;
  
  try {
    const respuesta = await api.createNote(mascotaId, titulo, contenido);
    alert('Nota creada');
    cargarNotas();
  } catch (error) {
    alert('Error: ' + error.message);
  }
});
```

---

## Testing

### Con Postman

1. **Crear colección de Postman**
   - Agregar carpeta: Autenticación
   - Agregar carpeta: Mascotas
   - Agregar carpeta: Citas
   - Agregar carpeta: Vacunas

2. **Variables de entorno**
```json
{
  "base_url": "http://localhost:5000",
  "token": ""
}
```

3. **Test de Registro**
```
POST {{base_url}}/api/auth/register
Body (raw JSON):
{
  "nombre": "Test",
  "apellido": "User",
  "email": "test@example.com",
  "telefono": "5551234567",
  "password": "Test123!"
}
```

### Con cURL

```bash
# Registrar
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Juan","apellido":"Pérez","email":"juan@test.com","telefono":"5551234567","password":"Test123!"}'

# Copiar el token de la respuesta y guardar en variable
$token = "tu_token_aqui"

# Crear mascota
curl -X POST http://localhost:5000/api/mascotas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $token" \
  -d '{"nombre":"Max","tipo":"Perro","raza":"Labrador"}'
```

---

## Deploy

### Preparar para Producción

#### 1. Variables de Entorno (.env)
```
PORT=5000
JWT_SECRET=una_clave_super_secreta_y_segura_para_produccion
API_URL=https://api.petcareplus.com
NODE_ENV=production
```

#### 2. Actualizar api-client.js
```javascript
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.petcareplus.com/api'
  : 'http://localhost:5000/api';
```

#### 3. Usar Base de Datos Real
```bash
# Instalar MongoDB driver
npm install mongoose
```

```javascript
// Reemplazar JSON con MongoDB
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nombre: String,
  apellido: String,
  email: { type: String, unique: true },
  // ...
});

const User = mongoose.model('User', userSchema);
```

### Deploy en Heroku

```bash
# 1. Crear app
heroku create petcare-plus

# 2. Agregar variables de entorno
heroku config:set JWT_SECRET="tu_clave_secreta"
heroku config:set NODE_ENV="production"

# 3. Deploy
git push heroku master

# 4. Ver logs
heroku logs --tail
```

### Deploy en Vercel (Frontend)

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Deployar
cd www
vercel

# 3. Configurar dominio personalizado
# En dashboard de Vercel
```

---

## 🔍 Debugging

### Chrome DevTools

```javascript
// En la consola del navegador
console.log(api.getToken());
localStorage.getItem('currentUser');

// Simular petición
await api.getPets();
```

### VS Code Debugger

`.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Program",
      "program": "${workspaceFolder}/server.js",
      "restart": true,
      "runtimeArgs": ["--experimental-modules"]
    }
  ]
}
```

---

## 📝 Mejores Prácticas

### Código Limpio
```javascript
// ❌ Mal
function x(a, b) {
  return a + b;
}

// ✅ Bien
function sumarEdades(edad1, edad2) {
  return edad1 + edad2;
}
```

### Manejo de Errores
```javascript
// ❌ Mal
try {
  const datos = await api.getDatos();
} catch(e) {
  console.log('Error');
}

// ✅ Bien
try {
  const datos = await api.getDatos();
} catch(error) {
  console.error('Error al obtener datos:', error);
  alert('No fue posible cargar los datos. Intenta de nuevo.');
}
```

### Validación
```javascript
// ✅ Bien
const validarEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
```

---

## 📚 Recursos Adicionales

- [Express.js Guide](https://expressjs.com/)
- [JWT Documentation](https://jwt.io/)
- [bcryptjs NPM](https://www.npmjs.com/package/bcryptjs)
- [Fetch API MDN](https://developer.mozilla.org/es/docs/Web/API/fetch)

---

<div align="center">

**¡Happy Coding! 🚀**

Made with ❤️ by the PetCare+ Team

</div>
