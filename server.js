// =====================================================
// API REST - PetCare+ Backend
// =====================================================

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.JWT_SECRET || 'tu_clave_secreta_super_segura_2024';

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend (carpeta www)
const staticPath = path.join(__dirname, 'www');
if (fs.existsSync(staticPath)) {
  app.use(express.static(staticPath));
}

// Archivos de datos (simulando base de datos)
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

const usersFile = path.join(dataDir, 'usuarios.json');
const petsFile = path.join(dataDir, 'mascotas.json');
const appointmentsFile = path.join(dataDir, 'citas.json');
const vaccinesFile = path.join(dataDir, 'vacunas.json');

// Helpers para lectura/escritura de archivos
const readData = (file) => {
  try {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify([]));
    }
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    console.error(`Error leyendo ${file}:`, error);
    return [];
  }
};

const writeData = (file, data) => {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error escribiendo ${file}:`, error);
  }
};

// Middleware de autenticación
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    req.user = jwt.verify(token, SECRET_KEY);
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

// =====================================================
// AUTENTICACIÓN
// =====================================================

// Registro de usuario
app.post('/api/auth/register', async (req, res) => {
  try {
    const { nombre, apellido, email, telefono, password } = req.body;

    // Validaciones
    if (!nombre || !apellido || !email || !telefono || !password) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const usuarios = readData(usersFile);

    // Verificar si el email ya existe
    if (usuarios.some(u => u.email === email.toLowerCase())) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const nuevoUsuario = {
      id: 'user_' + Date.now(),
      nombre,
      apellido,
      nombreCompleto: `${nombre} ${apellido}`,
      email: email.toLowerCase(),
      telefono,
      password: hashedPassword,
      creado: new Date().toISOString(),
      activo: true
    };

    usuarios.push(nuevoUsuario);
    writeData(usersFile, usuarios);

    // Generar token
    const token = jwt.sign(
      { id: nuevoUsuario.id, email: nuevoUsuario.email },
      SECRET_KEY,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      usuario: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        apellido: nuevoUsuario.apellido,
        email: nuevoUsuario.email,
        nombreCompleto: nuevoUsuario.nombreCompleto
      },
      token
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    const usuarios = readData(usersFile);
    const usuario = usuarios.find(u => u.email === email.toLowerCase());

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      SECRET_KEY,
      { expiresIn: '7d' }
    );

    res.json({
      mensaje: 'Sesión iniciada',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        nombreCompleto: usuario.nombreCompleto,
        telefono: usuario.telefono
      },
      token
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// =====================================================
// MASCOTAS
// =====================================================

// Obtener todas las mascotas del usuario
app.get('/api/mascotas', verifyToken, (req, res) => {
  try {
    const mascotas = readData(petsFile);
    const mascotasUsuario = mascotas.filter(m => m.usuarioId === req.user.id);
    res.json(mascotasUsuario);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener mascotas' });
  }
});

// Crear mascota
app.post('/api/mascotas', verifyToken, (req, res) => {
  try {
    const { nombre, tipo, raza, edad, genero, notas } = req.body;

    if (!nombre || !tipo) {
      return res.status(400).json({ error: 'Nombre y tipo son requeridos' });
    }

    const mascotas = readData(petsFile);

    const nuevaMascota = {
      id: 'pet_' + Date.now(),
      usuarioId: req.user.id,
      nombre,
      tipo,
      raza: raza || '',
      edad: edad || 0,
      genero: genero || '',
      notas: notas || '',
      creada: new Date().toISOString()
    };

    mascotas.push(nuevaMascota);
    writeData(petsFile, mascotas);

    res.status(201).json({
      mensaje: 'Mascota creada exitosamente',
      mascota: nuevaMascota
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear mascota' });
  }
});

// Actualizar mascota
app.put('/api/mascotas/:id', verifyToken, (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, tipo, raza, edad, genero, notas } = req.body;

    const mascotas = readData(petsFile);
    const index = mascotas.findIndex(m => m.id === id && m.usuarioId === req.user.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Mascota no encontrada' });
    }

    mascotas[index] = {
      ...mascotas[index],
      nombre: nombre || mascotas[index].nombre,
      tipo: tipo || mascotas[index].tipo,
      raza: raza !== undefined ? raza : mascotas[index].raza,
      edad: edad !== undefined ? edad : mascotas[index].edad,
      genero: genero !== undefined ? genero : mascotas[index].genero,
      notas: notas !== undefined ? notas : mascotas[index].notas,
      actualizado: new Date().toISOString()
    };

    writeData(petsFile, mascotas);

    res.json({
      mensaje: 'Mascota actualizada',
      mascota: mascotas[index]
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar mascota' });
  }
});

// Eliminar mascota
app.delete('/api/mascotas/:id', verifyToken, (req, res) => {
  try {
    const { id } = req.params;
    const mascotas = readData(petsFile);
    const index = mascotas.findIndex(m => m.id === id && m.usuarioId === req.user.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Mascota no encontrada' });
    }

    mascotas.splice(index, 1);
    writeData(petsFile, mascotas);

    res.json({ mensaje: 'Mascota eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar mascota' });
  }
});

// =====================================================
// CITAS VETERINARIAS
// =====================================================

// Obtener citas del usuario
app.get('/api/citas', verifyToken, (req, res) => {
  try {
    const citas = readData(appointmentsFile);
    const citasUsuario = citas.filter(c => c.usuarioId === req.user.id);
    res.json(citasUsuario);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener citas' });
  }
});

// Crear cita
app.post('/api/citas', verifyToken, (req, res) => {
  try {
    const { mascotaId, fecha, hora, veterinario, motivo, notas } = req.body;

    if (!mascotaId || !fecha || !hora) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const citas = readData(appointmentsFile);

    const nuevaCita = {
      id: 'apt_' + Date.now(),
      usuarioId: req.user.id,
      mascotaId,
      fecha,
      hora,
      veterinario: veterinario || '',
      motivo: motivo || '',
      notas: notas || '',
      estado: 'programada',
      creada: new Date().toISOString()
    };

    citas.push(nuevaCita);
    writeData(appointmentsFile, citas);

    res.status(201).json({
      mensaje: 'Cita creada exitosamente',
      cita: nuevaCita
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear cita' });
  }
});

// Actualizar cita
app.put('/api/citas/:id', verifyToken, (req, res) => {
  try {
    const { id } = req.params;
    const { fecha, hora, veterinario, motivo, notas, estado } = req.body;

    const citas = readData(appointmentsFile);
    const index = citas.findIndex(c => c.id === id && c.usuarioId === req.user.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    citas[index] = {
      ...citas[index],
      fecha: fecha || citas[index].fecha,
      hora: hora || citas[index].hora,
      veterinario: veterinario !== undefined ? veterinario : citas[index].veterinario,
      motivo: motivo !== undefined ? motivo : citas[index].motivo,
      notas: notas !== undefined ? notas : citas[index].notas,
      estado: estado || citas[index].estado,
      actualizado: new Date().toISOString()
    };

    writeData(appointmentsFile, citas);

    res.json({
      mensaje: 'Cita actualizada',
      cita: citas[index]
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar cita' });
  }
});

// Eliminar cita
app.delete('/api/citas/:id', verifyToken, (req, res) => {
  try {
    const { id } = req.params;
    const citas = readData(appointmentsFile);
    const index = citas.findIndex(c => c.id === id && c.usuarioId === req.user.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    citas.splice(index, 1);
    writeData(appointmentsFile, citas);

    res.json({ mensaje: 'Cita eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar cita' });
  }
});

// =====================================================
// VACUNAS
// =====================================================

// Obtener vacunas del usuario
app.get('/api/vacunas', verifyToken, (req, res) => {
  try {
    const vacunas = readData(vaccinesFile);
    const vacunasUsuario = vacunas.filter(v => v.usuarioId === req.user.id);
    res.json(vacunasUsuario);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener vacunas' });
  }
});

// Crear vacuna
app.post('/api/vacunas', verifyToken, (req, res) => {
  try {
    const { mascotaId, nombreVacuna, fecha, proximaDosis, veterinario, notas } = req.body;

    if (!mascotaId || !nombreVacuna || !fecha) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const vacunas = readData(vaccinesFile);

    const nuevaVacuna = {
      id: 'vac_' + Date.now(),
      usuarioId: req.user.id,
      mascotaId,
      nombreVacuna,
      fecha,
      proximaDosis: proximaDosis || null,
      veterinario: veterinario || '',
      notas: notas || '',
      creada: new Date().toISOString()
    };

    vacunas.push(nuevaVacuna);
    writeData(vaccinesFile, vacunas);

    res.status(201).json({
      mensaje: 'Vacuna registrada exitosamente',
      vacuna: nuevaVacuna
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar vacuna' });
  }
});

// Eliminar vacuna
app.delete('/api/vacunas/:id', verifyToken, (req, res) => {
  try {
    const { id } = req.params;
    const vacunas = readData(vaccinesFile);
    const index = vacunas.findIndex(v => v.id === id && v.usuarioId === req.user.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Vacuna no encontrada' });
    }

    vacunas.splice(index, 1);
    writeData(vaccinesFile, vacunas);

    res.json({ mensaje: 'Vacuna eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar vacuna' });
  }
});

// =====================================================
// PERFIL DE USUARIO
// =====================================================

// Obtener perfil del usuario
app.get('/api/usuario/perfil', verifyToken, (req, res) => {
  try {
    const usuarios = readData(usersFile);
    const usuario = usuarios.find(u => u.id === req.user.id);

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const { password, ...usuarioSinPassword } = usuario;
    res.json(usuarioSinPassword);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
});

// Actualizar perfil del usuario
app.put('/api/usuario/perfil', verifyToken, (req, res) => {
  try {
    const { nombre, apellido, telefono } = req.body;
    const usuarios = readData(usersFile);
    const index = usuarios.findIndex(u => u.id === req.user.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    usuarios[index] = {
      ...usuarios[index],
      nombre: nombre || usuarios[index].nombre,
      apellido: apellido || usuarios[index].apellido,
      telefono: telefono || usuarios[index].telefono,
      nombreCompleto: `${nombre || usuarios[index].nombre} ${apellido || usuarios[index].apellido}`,
      actualizado: new Date().toISOString()
    };

    writeData(usersFile, usuarios);

    const { password, ...usuarioSinPassword } = usuarios[index];
    res.json({
      mensaje: 'Perfil actualizado',
      usuario: usuarioSinPassword
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
});

// =====================================================
// ESTADÍSTICAS
// =====================================================

// Obtener estadísticas del usuario
app.get('/api/estadisticas', verifyToken, (req, res) => {
  try {
    const mascotas = readData(petsFile).filter(m => m.usuarioId === req.user.id);
    const citas = readData(appointmentsFile).filter(c => c.usuarioId === req.user.id);
    const vacunas = readData(vaccinesFile).filter(v => v.usuarioId === req.user.id);

    const proximasCitas = citas.filter(c => {
      const citaDate = new Date(c.fecha);
      return citaDate >= new Date() && c.estado === 'programada';
    });

    res.json({
      totalMascotas: mascotas.length,
      totalCitas: citas.length,
      totalVacunas: vacunas.length,
      proximasCitas: proximasCitas.length,
      mascotas: mascotas.map(m => ({ id: m.id, nombre: m.nombre, tipo: m.tipo }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// =====================================================
// SALUD
// =====================================================

app.get('/api/health', (req, res) => {
  res.json({ status: 'API PetCare+ funcionando correctamente ✅' });
});

// RUTA: Documentación simple (dev) - sirve el markdown de la API
app.get('/docs', (req, res) => {
  const docFile = path.join(__dirname, 'API_DOCUMENTATION.md');
  if (fs.existsSync(docFile)) {
    return res.sendFile(docFile);
  }
  res.status(404).send('Documentación no disponible');
});

// Fallback: para rutas del frontend (SPA) - servir index.html salvo que sea ruta /api
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  const indexFile = path.join(staticPath, 'index.html');
  if (fs.existsSync(indexFile)) return res.sendFile(indexFile);
  return res.status(404).send('Página no encontrada');
});

// =====================================================
// INICIAR SERVIDOR
// =====================================================

app.listen(PORT, () => {
  console.log(`🐾 API PetCare+ ejecutándose en http://localhost:${PORT}`);
  console.log(`📚 Documentación disponible en http://localhost:${PORT}/docs`);
});
