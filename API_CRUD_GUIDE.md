# Guía rápida de la API - PetCare+

Esta guía recoge los endpoints principales, ejemplos listos para Postman y PowerShell, y pasos para CRUD completo (Usuarios, Mascotas, Vacunas, Citas).

Host por defecto
- Local: http://localhost:5000
- Desde celular (misma red): http://<TU_IP_LOCAL>:5000  (el servidor imprime la IP al arrancar)

---

## 1) Autenticación

### POST /api/auth/register  (público)
- Descripción: Registrar un usuario.
- Body JSON requerido:

```json
{
  "nombre": "Prueba",
  "apellido": "User",
  "email": "prueba@example.com",
  "password": "Test12345",
  "telefono": "" // opcional
}
```

- Respuesta: 201 con objeto { mensaje, token, usuario }

### POST /api/auth/login  (público)
- Descripción: Iniciar sesión y recibir token JWT.
- Body JSON:

```json
{
  "email": "prueba@example.com",
  "password": "Test12345"
}
```

- Respuesta: 200 { mensaje: 'Login exitoso', token: '...', usuario: { ... } }

Notas: El endpoint de login NO requiere Authorization. El token que recibes se usa en endpoints protegidos.

---

## 2) Endpoints protegidos (usar Authorization: Bearer <token>)

Todos los endpoints listados abajo requieren que envíes en la cabecera:

Authorization: Bearer <TOKEN>

### Mascotas
- GET /api/mascotas  - listar mascotas del usuario
- POST /api/mascotas - crear mascota. Body ejemplo mínimo:

```json
{
  "nombre": "Firulais",
  "especie": "perro",
  "raza": "Labrador",
  "edad": 3,
  "peso": 20.5
}
```
- GET /api/mascotas/:id - obtener mascota por id
- PUT /api/mascotas/:id - actualizar
- DELETE /api/mascotas/:id - eliminar

### Vacunas
- GET /api/vacunas - listar vacunas del usuario
- POST /api/vacunas - crear vacuna. Body mínimo:

```json
{
  "mascotaId": "<ID_DE_MASCOTA>",
  "nombre": "Parvovirus",
  "fecha": "2025-11-12",
  "proximaFecha": "2026-11-12"
}
```
- GET /api/vacunas/:id
- DELETE /api/vacunas/:id

### Citas
- GET /api/citas - listar
- POST /api/citas - crear. Body mínimo:

```json
{
  "mascotaId": "<ID_DE_MASCOTA>",
  "fecha": "2025-11-20",
  "hora": "10:30",
  "veterinario": "Dra. Maria"
}
```
- GET /api/citas/:id - obtener
- PUT /api/citas/:id - actualizar
- DELETE /api/citas/:id - eliminar

### Estadísticas
- GET /api/estadisticas - obtiene conteo de mascotas, citas, vacunas y próximas citas

---

## 3) Ejemplos prácticos

### PowerShell - flujo completo (registro → login → crear mascota → listar)

1) Registrar usuario:

```powershell
Invoke-RestMethod -Uri http://localhost:5000/api/auth/register -Method Post -ContentType 'application/json' -Body '{"nombre":"Prueba","apellido":"User","email":"prueba@example.com","password":"Test12345"}' | ConvertTo-Json
```

2) Login y guardar token en variable:

```powershell
$login = Invoke-RestMethod -Uri http://localhost:5000/api/auth/login -Method Post -ContentType 'application/json' -Body '{"email":"prueba@example.com","password":"Test12345"}'
$token = $login.token
$token
```

3) Crear mascota (usar $token):

```powershell
$body = @'
{
  "nombre":"Firulais",
  "especie":"perro",
  "raza":"Labrador",
  "edad":3
}
'@

Invoke-RestMethod -Uri http://localhost:5000/api/mascotas -Method Post -Headers @{ Authorization = "Bearer $token" } -ContentType 'application/json' -Body $body | ConvertTo-Json
```

4) Listar mascotas:

```powershell
Invoke-RestMethod -Uri http://localhost:5000/api/mascotas -Method Get -Headers @{ Authorization = "Bearer $token" } | ConvertTo-Json
```

### Postman - consejos rápidos
- Para POST/PUT selecciona Body → raw → JSON
- En el request de login, en Tests puedes añadir este script para guardar token en variable de colección:

```javascript
pm.test("Guardar token", function(){
  var json = pm.response.json();
  if(json.token) pm.collectionVariables.set("token", json.token);
});
```

- En subsequent requests usa Authorization: Bearer {{token}} o selecciona "Bearer Token" y escribe `{{token}}`.

---

## 4) Errores comunes y cómo resolverlos

- "Email y contraseña requeridos": el body no llegó como JSON; asegúrate Body → raw → JSON y header Content-Type: application/json.
- "Credenciales inválidas": email no existe o contraseña incorrecta; ten en cuenta que el sistema ahora normaliza emails (se guardan en minúsculas), pero la contraseña debe coincidir exactamente. Prueba registrarte de nuevo.
- "No autorizado" al llamar endpoints protegidos: faltó o es inválido el token. Añade header Authorization: Bearer <token>.
- Error EADDRINUSE al iniciar el servidor: puerto ocupado; mata procesos node previos o reinicia máquina.

---

## 5) Notas técnicas y recomendaciones

- El backend usa MongoDB con fallback a archivos JSON en `data/` si la conexión falla.
- Las contraseñas se almacenan con bcrypt (hash), por lo tanto no podrás ver contraseñas en texto plano en `data/usuarios.json`.
- Límite de body: 50MB (para permitir subir fotos en base64). Evita enviar imágenes muy grandes en producción.
- En producción considera usar almacenamiento externo (S3) para fotos y no guardar base64 en la BD.

---

Si quieres, genero también un collection de Postman (archivo JSON) listo para importar con estos requests y ejemplos. ¿Lo deseas? 

Archivo generado por el asistente — petcare: guía CRUD rápida.
