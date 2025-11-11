# 🐾 PetCare+ v2.0

Una aplicación moderna y completa para gestionar la salud y bienestar de tus mascotas. Incluye registro de vacunas, citas veterinarias, historial médico y mucho más.

## ✨ Características

### 🎯 Principales
- ✅ **Autenticación segura** con JWT y contraseñas encriptadas
- ✅ **Gestión de mascotas** - Registra todas tus mascotas con detalles
- ✅ **Citas veterinarias** - Programa y controla las citas
- ✅ **Vacunas** - Lleva registro completo de vacunaciones
- ✅ **Recordatorios** - Nunca olvides una cita importante
- ✅ **Historial médico** - Documentación completa de salud
- ✅ **Dashboard intuitivo** - Vista rápida de estadísticas
- ✅ **Responsive design** - Funciona en móviles y desktops

### 🛠️ Técnicas
- **Frontend:** HTML5, CSS3, JavaScript Vanilla
- **Backend:** Node.js + Express.js
- **API REST:** Completa y documentada
- **Seguridad:** JWT, bcrypt, validación de datos
- **Almacenamiento:** JSON (escalable a BD)

---

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js v14 o superior
- npm o yarn
- Un navegador moderno

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/Cholises/PetCare-.git
cd PetCare-

# 2. Instalar dependencias del servidor
npm install

# 3. Crear archivo de configuración
copy .env.example .env
# En Windows PowerShell:
# Copy-Item .env.example -Destination .env

# 4. Iniciar el servidor
npm start

# El servidor estará en http://localhost:5000
# El frontend en http://localhost:8000 (si usas Live Server)
```

### Configuración del Frontend

Para desarrollar el frontend con Live Server en VS Code:

1. Instala la extensión "Live Server" de Ritwick Dey
2. Click derecho en `www/index.html` → "Open with Live Server"
3. El servidor servirá en `http://localhost:5500`

---

## 📱 Uso de la Aplicación

### Flujo Típico

1. **Página de Inicio (Onboarding)**
   - Presenta las características principales
   - 3 slides informativos
   - Botón para saltar o continuar

2. **Registro/Login**
   - Crear nueva cuenta o iniciar sesión
   - Validación de datos en tiempo real
   - Almacenamiento seguro de contraseña

3. **Dashboard Principal**
   - Vista rápida de estadísticas
   - Mis mascotas registradas
   - Próximos eventos y recordatorios
   - Acciones rápidas

4. **Gestión de Mascotas**
   - Agregar nuevas mascotas
   - Ver detalles completos
   - Actualizar información
   - Eliminar si es necesario

5. **Citas y Vacunas**
   - Programar citas veterinarias
   - Registrar vacunas aplicadas
   - Recordatorios automáticos
   - Historial completo

---

## 🔌 API REST

### Endpoints Principales

#### Autenticación
```
POST   /api/auth/register      Crear nueva cuenta
POST   /api/auth/login         Iniciar sesión
```

#### Usuario
```
GET    /api/usuario/perfil     Obtener perfil
PUT    /api/usuario/perfil     Actualizar perfil
```

#### Mascotas
```
GET    /api/mascotas           Listar mascotas
POST   /api/mascotas           Crear mascota
PUT    /api/mascotas/:id       Actualizar mascota
DELETE /api/mascotas/:id       Eliminar mascota
```

#### Citas
```
GET    /api/citas              Listar citas
POST   /api/citas              Crear cita
PUT    /api/citas/:id          Actualizar cita
DELETE /api/citas/:id          Eliminar cita
```

#### Vacunas
```
GET    /api/vacunas            Listar vacunas
POST   /api/vacunas            Registrar vacuna
DELETE /api/vacunas/:id        Eliminar vacuna
```

#### Estadísticas
```
GET    /api/estadisticas       Obtener estadísticas
```

### Autenticación

Todos los endpoints (excepto `/auth`) requieren un token JWT en el header:

```
Authorization: Bearer {token}
```

---

## 📊 Ejemplo de Uso de API

### Registro
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan@example.com",
    "telefono": "5551234567",
    "password": "MiPassword123!"
  }'
```

### Crear Mascota
```bash
curl -X POST http://localhost:5000/api/mascotas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "nombre": "Max",
    "tipo": "Perro",
    "raza": "Labrador",
    "edad": 3,
    "genero": "Macho",
    "notas": "Muy energético"
  }'
```

---

## 📁 Estructura del Proyecto

```
PetCare-/
├── www/                          # Frontend
│   ├── index.html               # Página de inicio (onboarding)
│   ├── login.html               # Login
│   ├── registro.html            # Registro
│   ├── menu.html                # Dashboard principal
│   ├── citas.html               # Gestión de citas
│   ├── vacunas.html             # Gestión de vacunas
│   ├── historial_medico.html    # Historial médico
│   ├── calendario.html          # Calendario de eventos
│   ├── recordatorios.html       # Recordatorios
│   ├── css/                     # Estilos
│   │   ├── style.css            # Estilos globales
│   │   ├── login.css            # Estilos de autenticación
│   │   ├── menu.css             # Estilos del dashboard
│   │   └── ...otros estilos
│   └── js/                      # Scripts
│       ├── api-client.js        # Cliente para consumir API
│       ├── login.js             # Lógica de login
│       ├── registro.js          # Lógica de registro
│       ├── menu.js              # Lógica del dashboard
│       └── ...otros scripts
│
├── server.js                     # Servidor API principal
├── package.json                  # Dependencias del proyecto
├── .env                         # Variables de entorno
├── .env.example                 # Ejemplo de .env
├── API_DOCUMENTATION.md         # Documentación completa de API
└── README.md                    # Este archivo

data/                            # Almacenamiento de datos (creado automáticamente)
├── usuarios.json
├── mascotas.json
├── citas.json
└── vacunas.json
```

---

## 🔐 Seguridad

### Implementado
- ✅ Contraseñas encriptadas con bcrypt
- ✅ Tokens JWT con expiración (7 días)
- ✅ Validación de datos en backend
- ✅ CORS configurado
- ✅ Separación de datos por usuario

### Recomendaciones para Producción
- [ ] Usar base de datos segura (PostgreSQL/MongoDB)
- [ ] HTTPS obligatorio
- [ ] Rate limiting en API
- [ ] Validación adicional de entrada
- [ ] Logs de actividad
- [ ] Backup automático de datos

---

## 🧪 Pruebas

### Probar con Postman

1. Importa la colección de Postman (si existe)
2. O crea requests manualmente

**Ejemplo de flujo completo:**

1. **Registrarse**
   - POST `/api/auth/register`
   - Copia el `token` de la respuesta

2. **Crear mascota**
   - POST `/api/mascotas`
   - Header: `Authorization: Bearer {token}`
   - Guarda el `id` de la mascota

3. **Crear cita**
   - POST `/api/citas`
   - Header: `Authorization: Bearer {token}`
   - Usa el `mascotaId` del paso anterior

---

## 🐛 Solución de Problemas

### "Cannot POST /api/auth/register"
- ✓ Verifica que el servidor esté corriendo: `npm start`
- ✓ Comprueba que la API URL es correcta en `api-client.js`

### "Token inválido"
- ✓ El token expiró, inicia sesión de nuevo
- ✓ Verifica que el token se envía en el header correcto

### Puerto 5000 ya en uso
```bash
# En Windows
netstat -ano | findstr :5000
taskkill /PID {PID} /F

# En Mac/Linux
lsof -i :5000
kill -9 {PID}
```

### El frontend no conecta con la API
- ✓ Verifica que ambos servidores están corriendo
- ✓ Comprueba la consola del navegador (F12) para errores CORS
- ✓ Asegúrate que las URLs coinciden en `api-client.js`

---

## 📈 Mejoras Futuras

### v2.1
- [ ] Integración con base de datos real
- [ ] Autenticación con Google/Facebook
- [ ] Sistema de notificaciones por email
- [ ] Backup automático en la nube

### v3.0
- [ ] Aplicación móvil nativa
- [ ] Panel administrativo
- [ ] Búsqueda de veterinarios cercanos
- [ ] Integración de telemedicina
- [ ] Reportes PDF

---

## 👥 Contribuir

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver `LICENSE` para más detalles.

---

## 📞 Contacto

- **GitHub:** [@Cholises](https://github.com/Cholises)
- **Email:** contacto@petcareplus.com
- **Reportar bugs:** [Issues](https://github.com/Cholises/PetCare-/issues)

---

## 📚 Recursos Útiles

- [Documentación API](./API_DOCUMENTATION.md)
- [Guía de Desarrollo](./DEVELOPMENT.md)
- [Express.js Documentation](https://expressjs.com/)
- [JWT.io](https://jwt.io/)
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js)

---

<div align="center">

### 🐾 Hecho con ❤️ para los amantes de las mascotas

**¡Cuida de tus mascotas con PetCare+!**

⭐ Si te gusta el proyecto, déjanos una estrella en GitHub

</div>

---

**Última actualización:** 10 de Noviembre, 2024  
**Versión:** 2.0.0  
**Estado:** En desarrollo activo 🚀
