# 📦 Guía de Instalación - PetCare+

## ✅ Requisitos Previos

Antes de empezar, asegúrate de tener instalado:

- **Node.js** v14 o superior ([Descargar](https://nodejs.org/))
- **npm** v6 o superior (viene con Node.js)
- **Git** ([Descargar](https://git-scm.com/))
- Un navegador moderno (Chrome, Firefox, Safari, Edge)

### Verificar Instalación

```bash
node --version
npm --version
git --version
```

---

## 🚀 Instalación Paso a Paso

### Paso 1: Clonar el Repositorio

```bash
# Opción A: Con Git
git clone https://github.com/Cholises/PetCare-.git
cd PetCare-

# Opción B: Descargar ZIP y extraer
# Luego abrir la carpeta en terminal
```

### Paso 2: Instalar Dependencias

```bash
# Instalar todos los paquetes necesarios
npm install
```

Esto instalará:
- `express` - Framework web
- `cors` - Manejo de CORS
- `body-parser` - Parseo de JSON
- `jsonwebtoken` - Autenticación JWT
- `bcryptjs` - Encriptación de contraseñas
- `dotenv` - Variables de entorno
- `nodemon` - Auto-reload en desarrollo

### Paso 3: Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
# En Windows (PowerShell):
Copy-Item .env.example -Destination .env

# En macOS/Linux (Terminal):
cp .env.example .env
```

El archivo `.env` debe verse así:
```
PORT=5000
JWT_SECRET=tu_clave_secreta_super_segura_2024
API_URL=http://localhost:5000
NODE_ENV=development
```

---

## ▶️ Ejecutar la Aplicación

### Opción 1: Servidor + Frontend (Recomendado)

#### Terminal 1 - Servidor API

```bash
npm start
```

Deberías ver:
```
🐾 API PetCare+ ejecutándose en http://localhost:5000
📚 Documentación disponible en http://localhost:5000/docs
```

#### Terminal 2 - Frontend

**Opción A: Con Live Server (VS Code)**
1. Instala la extensión "Live Server" de Ritwick Dey
2. Click derecho en `www/index.html`
3. Selecciona "Open with Live Server"
4. Se abrirá en `http://localhost:5500`

**Opción B: Con Python**
```bash
# Python 3
python -m http.server 8000 --directory www

# Python 2
python -m SimpleHTTPServer 8000 --directory www
```
Luego abre `http://localhost:8000`

**Opción C: Con Node.js (http-server)**
```bash
# Instalar globalmente
npm install -g http-server

# Ejecutar en la carpeta www
cd www
http-server -p 8000
```

### Opción 2: Desarrollo con Nodemon

Para recargar automáticamente el servidor al hacer cambios:

```bash
npm run dev
```

---

## 🧪 Probar la Aplicación

### Flujo Básico

1. **Abre el navegador:** `http://localhost:5500` (o el puerto que uses)
2. **Haz clic en "Saltar"** en el onboarding
3. **Ve a Registro** y crea una cuenta:
   - Nombre: Juan
   - Apellido: Pérez
   - Email: juan@example.com
   - Teléfono: 5551234567
   - Contraseña: Prueba123!

4. **Verifica la creación:**
   - Revisa la carpeta `data/usuarios.json`
   - Deberías ver tu usuario

5. **Vuelve a Login** e inicia sesión con tus credenciales

---

## 🔍 Verificar que Todo Funcione

### Prueba de API

Abre otra terminal y corre:

```bash
# Prueba simple de la API
curl http://localhost:5000/api/health

# Respuesta esperada:
# {"status":"API PetCare+ funcionando correctamente ✅"}
```

### Revisar Datos Almacenados

```bash
# En Windows (PowerShell)
Get-Content data\usuarios.json

# En macOS/Linux
cat data/usuarios.json
```

---

## 🐛 Solucionar Problemas

### Error: "Port 5000 is already in use"

```bash
# Encontrar qué proceso usa el puerto
# Windows (PowerShell)
netstat -ano | findstr :5000

# macOS/Linux
lsof -i :5000

# Matar el proceso
# Windows
taskkill /PID {PID} /F

# macOS/Linux
kill -9 {PID}

# O usa otro puerto
PORT=3000 npm start
```

### Error: "Cannot find module 'express'"

```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### El frontend no conecta con la API

1. Verifica que ambos servidores están corriendo
2. Abre la consola del navegador (F12)
3. Busca errores de CORS
4. Verifica que la URL en `www/js/api-client.js` es correcta:
   ```javascript
   const API_URL = 'http://localhost:5000/api';
   ```

### "Token inválido" después de registrar

1. Recarga la página (F5)
2. Intenta iniciar sesión manualmente
3. Si persiste, revisa la consola (F12) para más detalles

---

## 📁 Estructura Creada

Después de instalar, tendrás esta estructura:

```
PetCare-/
├── www/                      # Frontend
│   ├── index.html
│   ├── login.html
│   ├── registro.html
│   ├── menu.html
│   ├── css/
│   ├── js/
│   │   ├── api-client.js    # ⭐ NUEVO
│   │   ├── login.js         # Mejorado
│   │   ├── registro.js      # Mejorado
│   │   └── ...
│   └── img/
│
├── data/                     # Datos (creado automáticamente)
│   ├── usuarios.json
│   ├── mascotas.json
│   ├── citas.json
│   └── vacunas.json
│
├── node_modules/            # Dependencias (no versionar)
├── server.js               # ⭐ NUEVO - API principal
├── package.json            # Actualizado
├── package-lock.json
├── .env                    # Variables de entorno (creado)
├── .env.example            # Ejemplo de .env
├── .gitignore              # Archivos a ignorar
├── README.md               # Documentación principal
├── API_DOCUMENTATION.md    # ⭐ NUEVO - Docs de API
└── DEVELOPMENT.md          # ⭐ NUEVO - Guía de desarrollo
```

---

## 🎯 Próximos Pasos

1. ✅ **Instala todo** siguiendo esta guía
2. ✅ **Prueba el registro y login**
3. ✅ **Agrega mascotas** desde el dashboard
4. ✅ **Lee la documentación** de API (`API_DOCUMENTATION.md`)
5. ✅ **Empieza a desarrollar** nuevas features

---

## 📚 Documentación Útil

- **API completa:** [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Desarrollo:** [DEVELOPMENT.md](./DEVELOPMENT.md)
- **Información general:** [README.md](./README.md)

---

## 💡 Consejos

### En Desarrollo
- Usa `npm run dev` para desarrollo (auto-reload)
- Abre la consola del navegador (F12) para ver errores
- Usa Postman para probar endpoints

### Antes de Deployar
- Crea un `.env` seguro con claves reales
- Prueba en navegadores diferentes
- Revisa la sección de seguridad en README.md

---

## ✨ ¡Listo!

Ahora tienes:
- ✅ API REST funcional
- ✅ Frontend moderno y responsivo
- ✅ Autenticación segura
- ✅ Sistema de gestión de mascotas completo

**¿Necesitas ayuda?**
- Revisa la consola de errores (F12)
- Abre un issue en GitHub
- Lee los archivos de documentación

---

<div align="center">

### 🐾 ¡A disfrutar PetCare+!

</div>
