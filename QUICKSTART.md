# ⚡ Quick Start - PetCare+ v2.0

**Tiempo estimado:** 5 minutos  
**Requisitos:** Node.js v14+

---

## 🚀 Instalación Rápida

### Windows (PowerShell)

```powershell
# 1. Clonar y entrar
git clone https://github.com/Cholises/PetCare-.git
cd PetCare-

# 2. Instalar
npm install

# 3. Ejecutar servidor (Terminal 1)
npm start

# 4. Ejecutar frontend (Terminal 2)
# VS Code: Click derecho en www/index.html → Open with Live Server
# O: npm install -g http-server && cd www && http-server -p 8000
```

### macOS/Linux

```bash
git clone https://github.com/Cholises/PetCare-.git
cd PetCare-
npm install
npm start
# En otra terminal:
cd www && python3 -m http.server 8000
```

---

## 🧪 Probar API

### Windows PowerShell
```powershell
.\test-api.ps1
```

### macOS/Linux Bash
```bash
bash test-api.sh
```

---

## 📱 Flujo de Prueba

### 1. Ir a http://localhost:5500 (o tu puerto)

### 2. En Registro
```
Nombre:     Juan
Apellido:   Pérez  
Email:      juan@example.com
Teléfono:   5551234567
Password:   Prueba123!
```

### 3. Ver datos creados
```bash
# En la carpeta data/
cat data/usuarios.json
```

### 4. Agregar mascotas
- Click en "Agregar mascota"
- Completar formulario
- Ver datos en `data/mascotas.json`

---

## 📚 Documentación

- **API Completa:** `API_DOCUMENTATION.md`
- **Desarrollo:** `DEVELOPMENT.md`
- **Instalación Detallada:** `INSTALLATION.md`
- **Cambios:** `CHANGELOG.md`

---

## 🔧 Comandos Útiles

```bash
# Iniciar servidor
npm start

# Desarrollo (con auto-reload)
npm run dev

# Ver datos
cat data/usuarios.json
cat data/mascotas.json
cat data/citas.json
cat data/vacunas.json

# Probar API (PowerShell)
.\test-api.ps1

# Probar API (Bash)
bash test-api.sh
```

---

## ❌ Solución Rápida de Problemas

| Problema | Solución |
|----------|----------|
| "Port 5000 in use" | `netstat -ano \| findstr :5000` (Windows) |
| "Cannot find module" | `npm install` |
| "Token inválido" | Recarga la página y prueba login |
| "API no conecta" | Verifica que el servidor está corriendo |

---

## 🎯 API Endpoints Principales

```
POST   /api/auth/register        Crear cuenta
POST   /api/auth/login           Iniciar sesión
GET    /api/mascotas             Ver mascotas
POST   /api/mascotas             Crear mascota
GET    /api/citas                Ver citas
POST   /api/citas                Crear cita
GET    /api/vacunas              Ver vacunas
POST   /api/vacunas              Crear vacuna
```

Todos requieren: `Authorization: Bearer {token}`

---

## 💡 Ejemplo de Uso en Frontend

```javascript
// El cliente API está disponible globalmente
const api = new APIClient();

// Registrarse
await api.register('Juan', 'Pérez', 'email@test.com', '5551234567', 'password');

// Login
const response = await api.login('email@test.com', 'password');
console.log('Token:', response.token);

// Crear mascota
await api.createPet('Max', 'Perro', 'Labrador', 3, 'Macho', 'Activo');

// Obtener mascotas
const mascotas = await api.getPets();
console.log(mascotas);
```

---

## 📊 Estructura Importante

```
PetCare-/
├── server.js                    ← API
├── www/
│   ├── js/api-client.js        ← Cliente API (USAR ESTO)
│   ├── js/login.js             ← Mejorado
│   ├── js/registro.js          ← Mejorado
│   └── ...
├── data/                        ← Datos (auto-creado)
├── package.json                 ← Dependencias
└── .env                        ← Configuración
```

---

## ✅ Verificar que Funciona

```bash
# 1. Servidor corriendo
curl http://localhost:5000/api/health

# 2. Datos creados
ls data/

# 3. Usuario registrado
cat data/usuarios.json
```

---

## 🎉 ¡Listo!

Ya puedes:
- ✅ Registrar usuarios con API
- ✅ Iniciar sesión seguro
- ✅ Crear mascotas
- ✅ Agendar citas
- ✅ Registrar vacunas

---

**Para más información, lee `README.md`**

```
🐾 PetCare+ v2.0 - ¡A cuidar mascotas!
```
