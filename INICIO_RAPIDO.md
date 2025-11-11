# 🐾 PetCare+ v3.0 - INICIO RÁPIDO

## ⚡ La forma más fácil - WINDOWS

### OPCIÓN 1: Un clic (Recomendado)
```
1. Doble clic en: start.bat
```

Eso es todo. Se abre todo automáticamente:
- API en http://localhost:5000
- Frontend en http://localhost:8000

---

### OPCIÓN 2: Manual (3 pasos)

**Terminal 1:**
```powershell
npm start
```

**Terminal 2:**
```powershell
cd www
npx http-server -p 8000 -c-1
```

**Navegador:**
```
http://localhost:8000
```

---

## 📱 ACCESO DESDE MÓVIL

1. Abre PowerShell y ejecuta:
```powershell
ipconfig
```

2. Busca "IPv4 Address" (ej: 192.168.1.50)

3. En móvil abre:
```
http://192.168.1.50:8000
```

---

## 🗄️ BASE DE DATOS - MongoDB (Opcional)

### Opción A: Instalación Local
```powershell
# Descargar desde: https://www.mongodb.com/try/download/community
# Instalar normalmente

# Iniciar MongoDB:
net start MongoDB

# Verificar:
mongosh
```

### Opción B: Docker (Si tienes Docker)
```bash
docker run -d -p 27017:27017 --name petcare-mongo mongo:7.0
```

### Opción C: MongoDB Atlas Cloud (Sin instalar)
- Ve a https://www.mongodb.com/cloud/atlas
- Crea cuenta gratuita
- Copia connection string
- Actualiza `.env`

**Nota:** Si MongoDB no está disponible, el servidor usa JSON files como fallback. ¡Sigue funcionando!

---

## ✨ FLUJO DE PRUEBA

1. Abre http://localhost:8000
2. Click "Saltar" (skip onboarding)
3. Ve a "Registro"
4. Crea una cuenta
5. Agrega tus mascotas
6. Verifica en: `data/usuarios.json`

---

## 🔧 ARCHIVOS IMPORTANTES

| Archivo | Qué hace |
|---------|----------|
| `start.bat` | Inicia todo (ÚSALO) |
| `server-mongo.js` | API con MongoDB |
| `.env` | Configuración |
| `www/mascotas.html` | Página de mascotas mejorada |
| `MONGODB_SETUP.md` | Guía completa MongoDB |

---

## 🚨 PROBLEMAS COMUNES

**"Puerto 5000 ya está en uso"**
```powershell
netstat -ano | findstr :5000
taskkill /PID <número> /F
```

**"MongoDB no conecta"**
- ✅ Está bien, sigue funcionando con JSON files
- Instala MongoDB cuando quieras

**"No puedo conectar desde móvil"**
- Usa tu IP local, no `localhost`
- Asegúrate que estás en la misma red WiFi

---

## 🎯 COMANDOS ÚTILES

```powershell
# Ver usuarios creados
type data\usuarios.json

# Ver mascotas
type data\mascotas.json

# Detener API: Ctrl+C en Terminal 1
# Detener Frontend: Ctrl+C en Terminal 2
```

---

## 📚 DOCUMENTACIÓN COMPLETA

- `MONGODB_SETUP.md` - Instalar MongoDB paso a paso
- `API_DOCUMENTATION.md` - Todos los endpoints
- `README.md` - Información general

---

## ✅ ¡LISTO!

Ya puedes:
- ✅ Registrar usuarios
- ✅ Crear mascotas con fotos
- ✅ Agendar citas
- ✅ Registrar vacunas
- ✅ Acceder desde móvil
- ✅ Usar MongoDB o JSON files

---

**Duda? Ver `MONGODB_SETUP.md`**

🐾 **¡A cuidar mascotas!**
