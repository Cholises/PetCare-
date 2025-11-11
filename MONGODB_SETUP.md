# 🐾 PetCare+ - Guía de Instalación de MongoDB

## Opción 1: MongoDB Community (LOCAL)

### Windows

1. **Descargar instalador:**
   - Ve a https://www.mongodb.com/try/download/community
   - Descarga la versión más reciente para Windows

2. **Instalar:**
   - Ejecuta el instalador (.msi)
   - Marca "Run MongoDB as a Windows Service"
   - Continúa con la instalación por defecto

3. **Verificar instalación:**
   ```powershell
   mongosh --version
   ```

4. **Iniciar MongoDB:**
   ```powershell
   # Automático (si se instaló como servicio)
   net start MongoDB
   
   # O manual
   mongod
   ```

5. **Conectar:**
   ```powershell
   mongosh
   ```

---

### macOS

1. **Con Homebrew:**
   ```bash
   brew tap mongodb/brew
   brew install mongodb-community
   brew services start mongodb-community
   ```

2. **Conectar:**
   ```bash
   mongosh
   ```

---

### Linux (Ubuntu)

1. **Instalar:**
   ```bash
   sudo apt-get install -y mongodb-org
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

2. **Conectar:**
   ```bash
   mongosh
   ```

---

## Opción 2: MongoDB Atlas (CLOUD - Recomendado para Producción)

1. **Crear cuenta:**
   - Ve a https://www.mongodb.com/cloud/atlas
   - Crea una cuenta gratuita

2. **Crear cluster:**
   - Clic en "Build a Database"
   - Selecciona plan "Free"
   - Crea usuario y contraseña
   - Permite acceso desde tu IP

3. **Obtener connection string:**
   - En "Connect", selecciona "Connect Your Application"
   - Copia el string de conexión

4. **Actualizar .env:**
   ```
   MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/petcare?retryWrites=true&w=majority
   ```

---

## Opción 3: Docker (Recomendado para Desarrollo)

### Requisito: Tener Docker instalado

1. **Iniciar MongoDB en Docker:**
   ```bash
   docker run -d \
     --name petcare-mongodb \
     -p 27017:27017 \
     -e MONGO_INITDB_ROOT_USERNAME=admin \
     -e MONGO_INITDB_ROOT_PASSWORD=petcare123 \
     mongo:7.0
   ```

2. **Conectar (desde otra terminal):**
   ```bash
   mongosh mongodb://admin:petcare123@localhost:27017/petcare?authSource=admin
   ```

3. **O usar Docker Compose (más fácil):**
   ```bash
   docker-compose up -d
   ```

---

## Verificar Conexión

Desde la carpeta del proyecto:

```bash
npm start
```

Deberías ver:
```
✅ Conectado a MongoDB
```

Si no conecta a MongoDB, el servidor seguirá funcionando con JSON files como fallback.

---

## Crear Base de Datos Manualmente (Opcional)

```bash
mongosh mongodb://localhost:27017
```

```javascript
// Dentro de mongosh
use petcare

// Crear colecciones
db.createCollection("usuarios")
db.createCollection("mascotas")
db.createCollection("citas")
db.createCollection("vacunas")

// Ver colecciones
show collections
```

---

## Troubleshooting

### "Connection refused"
- Asegúrate que MongoDB está corriendo: `mongosh`
- O cambia `MONGODB_URI` a tu URL de MongoDB Atlas

### "Authentication failed"
- Verifica usuario/contraseña en MONGODB_URI
- En MongoDB Atlas, asegúrate de que tu IP está whitelisted

### "Port 27017 already in use"
- Otro proceso está usando el puerto
- Cambia el puerto en docker-compose.yml o para MongoDB local

---

## Próximos Pasos

1. Instala MongoDB usando tu método preferido
2. Actualiza `.env` con tu MONGODB_URI
3. Ejecuta `npm start`
4. Abre http://localhost:8000 en navegador
5. ¡Prueba registrarte!

