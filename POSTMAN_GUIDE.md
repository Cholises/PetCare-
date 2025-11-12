# 📮 Guía Postman - PetCare+ API

Aprende a probar la API usando Postman sin escribir código.

---

## 🚀 Instalación de Postman

1. Descarga desde: https://www.postman.com/downloads/
2. Instala y abre
3. Crea una cuenta (opcional, pero recomendado)

---

## 📂 Crear una Colección

1. Click en **"Collections"** (lado izquierdo)
2. Click en **"+"** para crear nueva colección
3. Nombre: `PetCare+ API v3.0`
4. Listo ✅

---

## 🔑 1. REGISTRAR UN USUARIO

### Paso 1: Crear nueva request

1. Click en **"+"** en la pestaña de arriba
2. Selecciona **POST**
3. URL: `http://localhost:5000/api/auth/register`
4. Click en **"Body"**
5. Selecciona **"raw"** y **"JSON"**

### Paso 2: Pegar datos

```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan@ejemplo.com",
  "telefono": "5551234567",
  "password": "MiPassword123"
}
```

### Paso 3: Enviar

Click en **"Send"** (botón azul)

### Resultado esperado:

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

**⭐ IMPORTANTE:** Guarda el token (valor largo en `"token"`) - lo necesitarás después

---

## 🔐 2. LOGIN (Obtener token)

### Paso 1: Nueva request

1. Click **"+"**
2. Método: **POST**
3. URL: `http://localhost:5000/api/auth/login`
4. Click **"Body"** → **"raw"** → **"JSON"**

### Paso 2: Credenciales

```json
{
  "email": "juan@ejemplo.com",
  "password": "MiPassword123"
}
```

### Paso 3: Enviar

Click **"Send"**

### Resultado:

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

**⭐ Copia el token nuevamente**

---

## 🔑 Configurar Token en Postman (Método AUTOMÁTICO)

Para no tener que copiar el token cada vez:

### Paso 1: Crear variable en colección

1. Click derecha en tu colección **"PetCare+ API v3.0"**
2. Click en **"Edit"**
3. Tab **"Variables"**
4. Nueva variable:
   - **Variable name:** `token`
   - **Initial value:** (déjalo vacío por ahora)
   - **Current value:** (déjalo vacío)
5. Click **"Save"**

### Paso 2: Guardar token automáticamente

En la request de **LOGIN**:

1. Tab **"Tests"**
2. Pega este código:

```javascript
if (pm.response.code === 200) {
    pm.collectionVariables.set("token", pm.response.json().token);
    console.log("Token guardado: " + pm.response.json().token);
}
```

3. Click **"Save"**

Ahora, cada vez que hagas login, el token se guarda automáticamente.

---

## 🐾 3. CREAR UNA MASCOTA

### Paso 1: Nueva request

1. Click **"+"**
2. Método: **POST**
3. URL: `http://localhost:5000/api/mascotas`

### Paso 2: Configurar Headers

Click en **"Headers"**

Agrega esta fila:
| Key | Value |
|-----|-------|
| Authorization | Bearer {{token}} |

⭐ `{{token}}` = Usa la variable que guardamos

### Paso 3: Body - Datos mascota

Click **"Body"** → **"raw"** → **"JSON"**

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
  "descripcion": "Muy activo y amigable"
}
```

### Paso 4: Enviar

Click **"Send"**

### Resultado:

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

**⭐ Guarda el `_id` de la mascota** (la necesitarás para citas y vacunas)

---

## 📋 4. OBTENER TODAS LAS MASCOTAS

### Paso 1: Nueva request

1. Click **"+"**
2. Método: **GET**
3. URL: `http://localhost:5000/api/mascotas`

### Paso 2: Headers

Click **"Headers"**

| Key | Value |
|-----|-------|
| Authorization | Bearer {{token}} |

### Paso 3: Enviar

Click **"Send"**

### Resultado:

```json
{
  "mascotas": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "nombre": "Max",
      "especie": "perro",
      "raza": "Labrador",
      "edad": 3,
      "peso": 30.5,
      "color": "Negro",
      "sexo": "macho",
      "fechaNacimiento": "2022-01-15T00:00:00.000Z",
      "microchip": "123456789",
      "descripcion": "Muy activo y amigable"
    }
  ],
  "total": 1
}
```

---

## 📅 5. CREAR UNA CITA VETERINARIA

### Paso 1: Nueva request

1. Click **"+"**
2. Método: **POST**
3. URL: `http://localhost:5000/api/citas`

### Paso 2: Headers

| Key | Value |
|-----|-------|
| Authorization | Bearer {{token}} |

### Paso 3: Body

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

⭐ Reemplaza `mascotaId` con el ID de tu mascota

### Paso 4: Enviar

Click **"Send"**

---

## 💉 6. REGISTRAR UNA VACUNA

### Paso 1: Nueva request

1. Click **"+"**
2. Método: **POST**
3. URL: `http://localhost:5000/api/vacunas`

### Paso 2: Headers

| Key | Value |
|-----|-------|
| Authorization | Bearer {{token}} |

### Paso 3: Body

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

⭐ Reemplaza `mascotaId` con el ID de tu mascota

### Paso 4: Enviar

Click **"Send"**

---

## 📊 7. OBTENER ESTADÍSTICAS

### Paso 1: Nueva request

1. Click **"+"**
2. Método: **GET**
3. URL: `http://localhost:5000/api/estadisticas`

### Paso 2: Headers

| Key | Value |
|-----|-------|
| Authorization | Bearer {{token}} |

### Paso 3: Enviar

Click **"Send"**

### Resultado:

```json
{
  "mascotas": 1,
  "citas": 1,
  "vacunas": 1,
  "proximas_citas": 1
}
```

---

## 💚 8. VERIFICAR SALUD DEL SERVIDOR

### Paso 1: Nueva request

1. Click **"+"**
2. Método: **GET**
3. URL: `http://localhost:5000/api/health`

⚠️ **IMPORTANTE:** Esta request NO necesita token

### Paso 2: Enviar

Click **"Send"**

### Resultado:

```json
{
  "status": "OK",
  "timestamp": "2025-11-11T10:30:00.000Z",
  "server": "http://192.168.1.50:5000",
  "mongodb": "conectado"
}
```

---

## 📝 CHEAT SHEET - Resumen de requests

| Operación | Método | URL | Token |
|-----------|--------|-----|-------|
| Registro | POST | `/api/auth/register` | ❌ No |
| Login | POST | `/api/auth/login` | ❌ No |
| Ver mascotas | GET | `/api/mascotas` | ✅ Sí |
| Crear mascota | POST | `/api/mascotas` | ✅ Sí |
| Ver mascota | GET | `/api/mascotas/:id` | ✅ Sí |
| Editar mascota | PUT | `/api/mascotas/:id` | ✅ Sí |
| Eliminar mascota | DELETE | `/api/mascotas/:id` | ✅ Sí |
| Ver citas | GET | `/api/citas` | ✅ Sí |
| Crear cita | POST | `/api/citas` | ✅ Sí |
| Editar cita | PUT | `/api/citas/:id` | ✅ Sí |
| Eliminar cita | DELETE | `/api/citas/:id` | ✅ Sí |
| Ver vacunas | GET | `/api/vacunas` | ✅ Sí |
| Crear vacuna | POST | `/api/vacunas` | ✅ Sí |
| Eliminar vacuna | DELETE | `/api/vacunas/:id` | ✅ Sí |
| Estadísticas | GET | `/api/estadisticas` | ✅ Sí |
| Health check | GET | `/api/health` | ❌ No |

---

## 🛠️ TIPS Y TRUCOS

### 1️⃣ Ver respuesta formateada

Cuando hayas hecho una request, en la pestaña de **"Response"** tienes opciones:
- **Pretty** - JSON formateado bonito
- **Raw** - Texto plano
- **Preview** - Vista en HTML (si aplica)

### 2️⃣ Guardar requests en carpetas

Dentro de tu colección puedes crear carpetas:
1. Click derecha en la colección
2. **"Add Folder"**
3. Nombre: `Autenticación`, `Mascotas`, `Citas`, etc.
4. Arrastra requests a sus carpetas

### 3️⃣ Variables de entorno

Si quieres cambiar entre local y producción:

1. Click en engranaje (⚙️) arriba
2. **"Manage Environments"**
3. **"Create new"**
4. Nombre: `Local`
5. Variables:
   - `base_url` = `http://localhost:5000`
6. Click en dropdown (arriba) y selecciona `Local`

Luego en URLs usa: `{{base_url}}/api/...`

### 4️⃣ Probar automáticamente después de login

Después del login, tus otros requests obtendrán el token automáticamente si:
- Usas `Bearer {{token}}` en Headers
- Hiciste el script en Tests del login (paso anterior)

---

## 🧪 ORDEN RECOMENDADO PARA PROBAR

1. ✅ Health Check (verificar servidor)
2. ✅ Registro (crear usuario)
3. ✅ Login (obtener token)
4. ✅ Crear Mascota
5. ✅ Ver Mascotas
6. ✅ Crear Cita
7. ✅ Ver Citas
8. ✅ Crear Vacuna
9. ✅ Ver Vacunas
10. ✅ Estadísticas

---

## 🚨 ERRORES COMUNES

| Error | Causa | Solución |
|-------|-------|----------|
| `401 Unauthorized` | Token inválido | Haz login de nuevo |
| `404 Not Found` | URL incorrecta | Verifica la URL exacta |
| `400 Bad Request` | Datos faltantes o mal formados | Revisa el JSON |
| `Connection refused` | Servidor no corriendo | Ejecuta `npm start` |

---

## 📸 Ejemplo Paso a Paso con Imágenes

### Registro (POST request)

```
[GET / POST dropdown] POST
[URL] http://localhost:5000/api/auth/register
[Body tab] raw → JSON
[Código]
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan@ejemplo.com",
  "telefono": "5551234567",
  "password": "MiPassword123"
}
[Send button] CLICK
```

### Crear Mascota (POST con token)

```
[GET / POST dropdown] POST
[URL] http://localhost:5000/api/mascotas
[Headers tab]
  Key: Authorization
  Value: Bearer {{token}}
[Body tab] raw → JSON
[Código]
{
  "nombre": "Max",
  "especie": "perro",
  "raza": "Labrador",
  "edad": 3,
  "peso": 30.5
}
[Send button] CLICK
```

---

## 📚 Documentación completa

Ver `API.md` para detalles de todos los endpoints y respuestas.

---

**¡A probar la API! 🐾**

Versión: 3.0  
Última actualización: 11 de noviembre de 2025
