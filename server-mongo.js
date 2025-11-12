// =====================================================
// API REST - PetCare+ Backend con MongoDB
// =====================================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const os = require('os');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.JWT_SECRET || 'tu_clave_secreta_super_segura_2024';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/petcare';

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Servir archivos estáticos del frontend
const staticPath = path.join(__dirname, 'www');
if (fs.existsSync(staticPath)) {
  app.use(express.static(staticPath));
}

// =====================================================
// CONEXIÓN A MONGODB
// =====================================================

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ Conectado a MongoDB');
})
.catch(err => {
  console.error('❌ Error conectando a MongoDB:', err.message);
  console.log('⚠️  Usando JSON files como fallback...');
});

// =====================================================
// ESQUEMAS MONGODB
// =====================================================

// Usuario
const usuarioSchema = new mongoose.Schema({
  nombre: String,
  apellido: String,
  email: { type: String, unique: true, sparse: true },
  telefono: String,
  password: String,
  createdAt: { type: Date, default: Date.now }
});

// Mascota
const mascotaSchema = new mongoose.Schema({
  usuarioId: mongoose.Schema.Types.ObjectId,
  nombre: String,
  especie: String, // perro, gato, conejo, etc
  raza: String,
  edad: Number,
  peso: Number,
  color: String,
  foto: String, // URL o base64
  fechaNacimiento: Date,
  sexo: String,
  microchip: String,
  descripcion: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Cita Veterinaria
const citaSchema = new mongoose.Schema({
  usuarioId: mongoose.Schema.Types.ObjectId,
  mascotaId: mongoose.Schema.Types.ObjectId,
  fecha: Date,
  hora: String,
  veterinario: String,
  clinica: String,
  razon: String,
  notas: String,
  estado: { type: String, enum: ['pendiente', 'completada', 'cancelada'], default: 'pendiente' },
  createdAt: { type: Date, default: Date.now }
});

// Vacuna
const vacunaSchema = new mongoose.Schema({
  usuarioId: mongoose.Schema.Types.ObjectId,
  mascotaId: mongoose.Schema.Types.ObjectId,
  nombre: String,
  fecha: Date,
  proximaFecha: Date,
  veterinario: String,
  clinica: String,
  lote: String,
  notas: String,
  createdAt: { type: Date, default: Date.now }
});

// Modelos
const Usuario = mongoose.model('Usuario', usuarioSchema);
const Mascota = mongoose.model('Mascota', mascotaSchema);
const Cita = mongoose.model('Cita', citaSchema);
const Vacuna = mongoose.model('Vacuna', vacunaSchema);

// =====================================================
// FALLBACK: JSON FILES
// =====================================================

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const usersFile = path.join(dataDir, 'usuarios.json');
const petsFile = path.join(dataDir, 'mascotas.json');
const appointmentsFile = path.join(dataDir, 'citas.json');
const vaccinesFile = path.join(dataDir, 'vacunas.json');

const readData = (file) => {
  try {
    if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify([]));
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch { return []; }
};

const writeData = (file, data) => {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error escribiendo ${file}:`, error);
  }
};

// =====================================================
// MIDDLEWARES DE AUTENTICACIÓN
// =====================================================

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.headers.authorization;
  
  if (!token) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.userId = decoded.id;
    req.userEmail = decoded.email;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

// =====================================================
// RUTAS DE AUTENTICACIÓN
// =====================================================

app.post('/api/auth/register', async (req, res) => {
  try {
    const { nombre, apellido, email, telefono, password } = req.body;

    // Validar campos requeridos
    if (!nombre || !apellido || !email || !password) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    // Normalizar email para evitar problemas de mayúsculas/minúsculas
    const emailNormalized = (email || '').toLowerCase().trim();

    // Verificar si usuario ya existe (MongoDB)
    let usuario = await Usuario.findOne({ email: emailNormalized });
    if (usuario) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Hash de contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear usuario
    usuario = new Usuario({
      nombre,
      apellido,
      email: emailNormalized,
      telefono,
      password: hashedPassword
    });

    await usuario.save();

    // JWT
    const token = jwt.sign(
      { id: usuario._id, email: usuario.email },
      SECRET_KEY,
      { expiresIn: '7d' }
    );

    // Guardar en JSON también (fallback)
    const usuarios = readData(usersFile);
    usuarios.push({
      id: usuario._id.toString(),
      nombre,
      apellido,
      email: emailNormalized,
      telefono,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    });
    writeData(usersFile, usuarios);

    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        telefono: usuario.telefono
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: error.message || 'Error en registro' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    // Normalizar email
    const emailNormalized = (email || '').toLowerCase().trim();

    // Buscar usuario (MongoDB primero, luego JSON)
    let usuario = await Usuario.findOne({ email: emailNormalized });
    
    if (!usuario) {
      // Fallback a JSON (comparación insensible a mayúsculas)
      const usuarios = readData(usersFile);
      const usuarioJSON = usuarios.find(u => (u.email || '').toLowerCase() === emailNormalized);
      if (!usuarioJSON) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }
      usuario = usuarioJSON;
    }

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // JWT
    const token = jwt.sign(
      { id: usuario._id || usuario.id, email: usuario.email },
      SECRET_KEY,
      { expiresIn: '7d' }
    );

    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id: usuario._id || usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        telefono: usuario.telefono
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: error.message || 'Error en login' });
  }
});

// =====================================================
// RUTAS DE MASCOTAS
// =====================================================

app.get('/api/mascotas', verifyToken, async (req, res) => {
  try {
    // MongoDB
    let mascotas = await Mascota.find({ usuarioId: req.userId });
    
    if (mascotas.length === 0) {
      // Fallback a JSON
      const todasMascotas = readData(petsFile);
      mascotas = todasMascotas.filter(m => m.usuarioId === req.userId);
    }

    res.json({
      mascotas,
      total: mascotas.length
    });
  } catch (error) {
    console.error('Error obteniendo mascotas:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/mascotas', verifyToken, async (req, res) => {
  try {
    const { nombre, especie, raza, edad, peso, color, sexo, fechaNacimiento, microchip, foto, descripcion } = req.body;

    if (!nombre || !especie) {
      return res.status(400).json({ error: 'Nombre y especie son requeridos' });
    }

    // MongoDB
    let mascota = new Mascota({
      usuarioId: req.userId,
      nombre,
      especie,
      raza,
      edad: parseInt(edad) || 0,
      peso: parseFloat(peso) || 0,
      color,
      sexo,
      fechaNacimiento,
      microchip,
      foto,
      descripcion
    });

    await mascota.save();

    // Guardar en JSON también
    const mascotas = readData(petsFile);
    mascotas.push({
      id: mascota._id.toString(),
      usuarioId: req.userId.toString(),
      nombre,
      especie,
      raza,
      edad: parseInt(edad) || 0,
      peso: parseFloat(peso) || 0,
      color,
      sexo,
      fechaNacimiento,
      microchip,
      foto,
      descripcion,
      createdAt: new Date().toISOString()
    });
    writeData(petsFile, mascotas);

    res.status(201).json({
      mensaje: 'Mascota creada exitosamente',
      mascota: {
        id: mascota._id,
        nombre: mascota.nombre,
        especie: mascota.especie,
        raza: mascota.raza,
        edad: mascota.edad,
        peso: mascota.peso
      }
    });
  } catch (error) {
    console.error('Error creando mascota:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/mascotas/:id', verifyToken, async (req, res) => {
  try {
    // MongoDB
    let mascota = await Mascota.findById(req.params.id);
    
    if (!mascota) {
      // Fallback a JSON
      const mascotas = readData(petsFile);
      mascota = mascotas.find(m => m.id === req.params.id);
    }

    if (!mascota) {
      return res.status(404).json({ error: 'Mascota no encontrada' });
    }

    res.json(mascota);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/mascotas/:id', verifyToken, async (req, res) => {
  try {
    const { nombre, especie, raza, edad, peso, color, sexo, fechaNacimiento, microchip, foto, descripcion } = req.body;

    // MongoDB
    let mascota = await Mascota.findByIdAndUpdate(
      req.params.id,
      {
        nombre,
        especie,
        raza,
        edad: parseInt(edad),
        peso: parseFloat(peso),
        color,
        sexo,
        fechaNacimiento,
        microchip,
        foto,
        descripcion,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!mascota) {
      // Fallback a JSON
      const mascotas = readData(petsFile);
      const index = mascotas.findIndex(m => m.id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ error: 'Mascota no encontrada' });
      }
      mascotas[index] = { ...mascotas[index], ...req.body, updatedAt: new Date().toISOString() };
      writeData(petsFile, mascotas);
      mascota = mascotas[index];
    }

    res.json({
      mensaje: 'Mascota actualizada',
      mascota
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/mascotas/:id', verifyToken, async (req, res) => {
  try {
    // MongoDB
    let mascota = await Mascota.findByIdAndDelete(req.params.id);

    if (!mascota) {
      // Fallback a JSON
      const mascotas = readData(petsFile);
      const index = mascotas.findIndex(m => m.id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ error: 'Mascota no encontrada' });
      }
      mascota = mascotas[index];
      mascotas.splice(index, 1);
      writeData(petsFile, mascotas);
    }

    res.json({
      mensaje: 'Mascota eliminada',
      mascota
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// RUTAS DE CITAS
// =====================================================

app.get('/api/citas', verifyToken, async (req, res) => {
  try {
    let citas = await Cita.find({ usuarioId: req.userId });
    
    if (citas.length === 0) {
      const todasCitas = readData(appointmentsFile);
      citas = todasCitas.filter(c => c.usuarioId === req.userId);
    }

    res.json({ citas, total: citas.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/citas', verifyToken, async (req, res) => {
  try {
    const { mascotaId, fecha, hora, veterinario, clinica, razon, notas } = req.body;

    if (!mascotaId || !fecha) {
      return res.status(400).json({ error: 'Mascota y fecha son requeridas' });
    }

    let cita = new Cita({
      usuarioId: req.userId,
      mascotaId,
      fecha,
      hora,
      veterinario,
      clinica,
      razon,
      notas,
      estado: 'pendiente'
    });

    await cita.save();

    const citas = readData(appointmentsFile);
    citas.push({
      id: cita._id.toString(),
      usuarioId: req.userId.toString(),
      mascotaId: mascotaId.toString(),
      fecha,
      hora,
      veterinario,
      clinica,
      razon,
      notas,
      estado: 'pendiente',
      createdAt: new Date().toISOString()
    });
    writeData(appointmentsFile, citas);

    res.status(201).json({ mensaje: 'Cita creada', cita });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/citas/:id', verifyToken, async (req, res) => {
  try {
    let cita = await Cita.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!cita) {
      const citas = readData(appointmentsFile);
      const index = citas.findIndex(c => c.id === req.params.id);
      if (index === -1) return res.status(404).json({ error: 'Cita no encontrada' });
      citas[index] = { ...citas[index], ...req.body };
      writeData(appointmentsFile, citas);
      cita = citas[index];
    }

    res.json({ mensaje: 'Cita actualizada', cita });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/citas/:id', verifyToken, async (req, res) => {
  try {
    let cita = await Cita.findByIdAndDelete(req.params.id);

    if (!cita) {
      const citas = readData(appointmentsFile);
      const index = citas.findIndex(c => c.id === req.params.id);
      if (index === -1) return res.status(404).json({ error: 'Cita no encontrada' });
      cita = citas[index];
      citas.splice(index, 1);
      writeData(appointmentsFile, citas);
    }

    res.json({ mensaje: 'Cita eliminada', cita });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// RUTAS DE VACUNAS
// =====================================================

app.get('/api/vacunas', verifyToken, async (req, res) => {
  try {
    let vacunas = await Vacuna.find({ usuarioId: req.userId });
    
    if (vacunas.length === 0) {
      const todasVacunas = readData(vaccinesFile);
      vacunas = todasVacunas.filter(v => v.usuarioId === req.userId);
    }

    res.json({ vacunas, total: vacunas.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/vacunas', verifyToken, async (req, res) => {
  try {
    const { mascotaId, nombre, fecha, proximaFecha, veterinario, clinica, lote, notas } = req.body;

    if (!mascotaId || !nombre) {
      return res.status(400).json({ error: 'Mascota y nombre de vacuna son requeridos' });
    }

    let vacuna = new Vacuna({
      usuarioId: req.userId,
      mascotaId,
      nombre,
      fecha,
      proximaFecha,
      veterinario,
      clinica,
      lote,
      notas
    });

    await vacuna.save();

    const vacunas = readData(vaccinesFile);
    vacunas.push({
      id: vacuna._id.toString(),
      usuarioId: req.userId.toString(),
      mascotaId: mascotaId.toString(),
      nombre,
      fecha,
      proximaFecha,
      veterinario,
      clinica,
      lote,
      notas,
      createdAt: new Date().toISOString()
    });
    writeData(vaccinesFile, vacunas);

    res.status(201).json({ mensaje: 'Vacuna registrada', vacuna });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/vacunas/:id', verifyToken, async (req, res) => {
  try {
    let vacuna = await Vacuna.findByIdAndDelete(req.params.id);

    if (!vacuna) {
      const vacunas = readData(vaccinesFile);
      const index = vacunas.findIndex(v => v.id === req.params.id);
      if (index === -1) return res.status(404).json({ error: 'Vacuna no encontrada' });
      vacuna = vacunas[index];
      vacunas.splice(index, 1);
      writeData(vaccinesFile, vacunas);
    }

    res.json({ mensaje: 'Vacuna eliminada', vacuna });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// ESTADÍSTICAS
// =====================================================

app.get('/api/estadisticas', verifyToken, async (req, res) => {
  try {
    const mascotas = await Mascota.countDocuments({ usuarioId: req.userId });
    const citas = await Cita.countDocuments({ usuarioId: req.userId });
    const vacunas = await Vacuna.countDocuments({ usuarioId: req.userId });

    res.json({
      mascotas,
      citas,
      vacunas,
      proximas_citas: (await Cita.find({ usuarioId: req.userId, estado: 'pendiente' }).limit(5)).length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// SALUD DEL SERVIDOR
// =====================================================

app.get('/api/health', (req, res) => {
  const ipAddress = getLocalIP();
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    server: `http://${ipAddress}:${PORT}`,
    mongodb: mongoose.connection.readyState === 1 ? 'conectado' : 'desconectado'
  });
});

// Función para obtener IP local
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// =====================================================
// FALLBACK PARA SPA
// =====================================================

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'www', 'index.html'));
});

// =====================================================
// INICIO DEL SERVIDOR
// =====================================================

const ipAddress = getLocalIP();
app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║         🐾 PetCare+ API REST (MongoDB)                 ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('🖥️  URLs de acceso:');
  console.log(`   📱 Desde celular: http://${ipAddress}:${PORT}`);
  console.log(`   💻 Local: http://localhost:${PORT}`);
  console.log('');
  console.log('📊 Base de datos: MongoDB');
  console.log(`   URI: ${MONGODB_URI}`);
  console.log('');
  console.log('📚 Documentación: http://localhost:' + PORT + '/api-docs');
  console.log('');
  console.log('✨ Presiona Ctrl+C para detener el servidor');
  console.log('');
});

module.exports = app;
