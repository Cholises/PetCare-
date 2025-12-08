
// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function () {
    

    // ===== VARIABLES GLOBALES =====
    let currentUser = null;
    let userMascotas = [];
    let userHistorial = [];

    // ===== FUNCIONES DE CARGA DE DATOS EXISTENTES =====
    function loadCurrentUser() {
        try {
            const userData = localStorage.getItem('currentUser');
            if (!userData) {
                console.warn('⚠️ No hay usuario logueado, redirigiendo...');
                window.location.href = 'login.html';
                return null;
            }

            const user = JSON.parse(userData);
            
            return user;
        } catch (error) {
            console.error('❌ Error al cargar usuario:', error);
            return null;
        }
    }

    function loadUserMascotas(currentUser) {
        try {
            const todasMascotas = JSON.parse(localStorage.getItem('mascotas') || '[]');
            

            // Filtrar mascotas del usuario actual
            const correoUsuario = currentUser.correo || currentUser.email;
            if (!correoUsuario) {
                console.warn('⚠️ Usuario no tiene correo identificado');
                return [];
            }

            const mascotasUsuario = todasMascotas.filter(m =>
                m.dueño === correoUsuario || m.owner === correoUsuario || m.userId === currentUser.id
            );

            
            return mascotasUsuario;
        } catch (error) {
            console.error('❌ Error al cargar mascotas:', error);
            return [];
        }
    }

    function loadUserHistorial(mascotas) {
        try {
            const todoHistorial = JSON.parse(localStorage.getItem('historialMedico') || '[]');
            

            if (mascotas.length === 0) return [];

            const mascotasIds = mascotas.map(m => m.id);
            const historialUsuario = todoHistorial.filter(r => mascotasIds.includes(r.mascotaId));

            
            return historialUsuario;
        } catch (error) {
            console.error('❌ Error al cargar historial:', error);
            return [];
        }
    }

    function loadAllUsers() {
        try {
            return JSON.parse(localStorage.getItem('users') || '[]');
        } catch (error) {
            console.error('❌ Error al cargar usuarios:', error);
            return [];
        }
    }

    // ===== MOSTRAR DATOS EN LA INTERFAZ =====
    function displayUserData(user) {
        if (!user) return;

        // Usar campos existentes del usuario
        const nombre = user.nombre || user.name || 'Usuario';
        const correo = user.correo || user.email || 'No especificado';
        const telefono = user.telefono || user.phone || 'No especificado';

        // Actualizar elementos del DOM
        document.getElementById('user-name').textContent = nombre;
        document.getElementById('user-email').textContent = correo;
        document.getElementById('user-phone').textContent = telefono;

        // Obtener iniciales para mostrar en el avatar placeholder
        const iniciales = obtenerIniciales(nombre);
        const avatarPlaceholder = document.querySelector('.user-avatar-placeholder i');
        if (avatarPlaceholder) {
            avatarPlaceholder.textContent = iniciales;
        }

        // Llenar formulario de edición
        document.getElementById('edit-name').value = nombre;
        document.getElementById('edit-email').value = correo;
        document.getElementById('edit-phone').value = telefono;

        
    }

    function obtenerIniciales(nombre) {
        if (!nombre) return 'U';

        const partes = nombre.split(' ');
        if (partes.length >= 2) {
            return (partes[0][0] + partes[1][0]).toUpperCase();
        } else if (partes.length === 1 && partes[0].length > 0) {
            return partes[0][0].toUpperCase();
        }
        return 'U';
    }

    // Devuelve una imagen por defecto (data URI SVG) según el tipo de mascota
    function getPetDefaultImage(tipo) {
        const icons = {
            perro: '🐕',
            gato: '🐱',
            ave: '🦜',
            conejo: '🐰',
            hamster: '🐹',
            pez: '🐠',
            reptil: '🦎',
            otro: '🐾'
        };
        const key = (tipo || '').toString().toLowerCase();
        const emoji = icons[key] || '🐾';
        const svg = `<?xml version="1.0" encoding="UTF-8"?><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500'><rect width='100%' height='100%' fill='%23f3f4f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='220' font-family='Segoe UI, Roboto, Noto Color Emoji'>${emoji}</text></svg>`;
        return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
    }

    function displayMascotas(mascotas, historial) {
        const petsContainer = document.getElementById('pets-container');
        if (!petsContainer) return;

        if (mascotas.length === 0) {
            petsContainer.innerHTML = `
                        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666;">
                            <i class="fas fa-paw" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.3;"></i>
                            <p>No tienes mascotas registradas aún</p>
                        </div>
                    `;
            return;
        }

        petsContainer.innerHTML = mascotas.map(mascota => {
            // Determinar estado basado en historial
            const historialMascota = historial.filter(h => h.mascotaId === mascota.id);
            let estado = 'healthy';
            let estadoTexto = 'Saludable';

            if (historialMascota.length > 0) {
                const ultimoRegistro = [...historialMascota].sort((a, b) =>
                    new Date(b.fecha) - new Date(a.fecha)
                )[0];

                if (ultimoRegistro.tipoConsulta === 'emergencia' ||
                    ultimoRegistro.tipoConsulta === 'cirugia' ||
                    (ultimoRegistro.diagnostico &&
                        ultimoRegistro.diagnostico.toLowerCase().includes('enfermo'))) {
                    estado = 'treatment';
                    estadoTexto = 'Necesita atención';
                }
            }

            // Última visita
            let ultimaVisita = 'Sin visitas';
            if (historialMascota.length > 0) {
                const ultima = [...historialMascota].sort((a, b) =>
                    new Date(b.fecha) - new Date(a.fecha)
                )[0];
                ultimaVisita = formatDate(ultima.fecha);
            }

            // Foto de la mascota - Se mantiene pero no se puede editar
            const fotoMascota = mascota.foto || mascota.image ||
                'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';

            return `
                        <div class="pet-card" data-id="${mascota.id}">
                               <img src="${fotoMascota}" 
                                   alt="${mascota.nombre}" 
                                   class="pet-image"
                                   onerror="this.src='https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'">
                            <div class="pet-info">
                                <h3 class="pet-name">${mascota.nombre || 'Sin nombre'}</h3>
                                <span class="pet-type">${mascota.tipo || mascota.especie || 'Mascota'}</span>
                                <div class="pet-status">
                                    <i class="fas fa-heartbeat ${estado === 'healthy' ? 'status-healthy' : 'status-treatment'}"></i>
                                    <span>${estadoTexto}</span>
                                </div>
                                <p><strong>Edad:</strong> ${mascota.edad || mascota.age || 'No especificada'}</p>
                                <p><strong>Raza:</strong> ${mascota.raza || mascota.breed || 'No especificada'}</p>
                                <div style="display: flex; gap: 10px; margin-top: 15px;">
                                    <button class="btn" style="padding: 5px 10px; font-size: 0.9rem;" 
                                            onclick="editMascota('${mascota.id}')">
                                        <i class="fas fa-edit"></i> Editar
                                    </button>
                                    <button class="btn-delete" onclick="deleteMascota('${mascota.id}')">
                                        <i class="fas fa-trash"></i> Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
        }).join('');

        
    }

    function displayRecentHistory(historial, mascotas) {
        const historyContainer = document.getElementById('recent-history');
        if (!historyContainer) return;

        if (historial.length === 0) {
            historyContainer.innerHTML = `
                        <div style="text-align: center; padding: 30px; color: #666;">
                            <i class="fas fa-clipboard-list" style="font-size: 2rem; margin-bottom: 15px; opacity: 0.3;"></i>
                            <p>No hay historial médico registrado</p>
                        </div>
                    `;
            return;
        }

        // Ordenar por fecha (más recientes primero) y tomar últimos 5
        const historialReciente = [...historial]
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
            .slice(0, 5);

        historyContainer.innerHTML = historialReciente.map(registro => {
            const mascota = mascotas.find(m => m.id === registro.mascotaId);
            const nombreMascota = mascota ? mascota.nombre : 'Mascota desconocida';

            const tipoNombres = {
                consulta: 'Consulta',
                emergencia: 'Emergencia',
                cirugia: 'Cirugía',
                control: 'Control',
                vacunacion: 'Vacunación',
                examenes: 'Exámenes',
                dental: 'Dental',
                otro: 'Otro'
            };

            const tipoConsulta = tipoNombres[registro.tipoConsulta] || registro.tipoConsulta;

            return `
                        <div class="appointment-item" style="display: flex; justify-content: space-between; 
                             align-items: center; padding: 15px; margin-bottom: 10px; 
                             background-color: #f8f9fa; border-radius: 8px; border-left: 4px solid var(--primary);">
                            <div>
                                <div style="font-weight: 600; color: var(--secondary);">
                                    ${formatDate(registro.fecha)} - ${registro.hora}
                                </div>
                                <div style="color: var(--primary); font-weight: 500;">
                                    ${nombreMascota} - ${tipoConsulta}
                                </div>
                                <div>${registro.veterinario || 'Dr.'} - ${registro.veterinaria || 'Clínica'}</div>
                                <div style="margin-top: 5px; color: #666;">
                                    <strong>Diagnóstico:</strong> 
                                    ${(registro.diagnostico || '').substring(0, 80)}${(registro.diagnostico || '').length > 80 ? '...' : ''}
                                </div>
                            </div>
                            <div>
                                <i class="fas fa-chevron-right" style="color: var(--primary);"></i>
                            </div>
                        </div>
                    `;
        }).join('');

        // Enlace para ver todo el historial
        if (historial.length > 5) {
            historyContainer.innerHTML += `
                        <div style="text-align: center; margin-top: 20px;">
                            <a href="historial.html" style="color: var(--primary); text-decoration: none; font-weight: 600;">
                                <i class="fas fa-history"></i> Ver todo el historial (${historial.length})
                            </a>
                        </div>
                    `;
        }

        
    }

    // ===== FUNCIONES UTILITARIAS =====
    function formatDate(dateStr) {
        if (!dateStr) return 'Fecha no especificada';
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            return date.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        } catch (error) {
            return dateStr;
        }
    }

    function showNotification(message, isError = false) {
        const notification = document.getElementById('notification');
        const notificationText = document.getElementById('notification-text');

        if (!notification || !notificationText) return;

        notificationText.textContent = message;
        notification.className = `notification ${isError ? 'error' : ''}`;
        notification.style.display = 'flex';

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                notification.style.display = 'none';
                notification.style.animation = '';
            }, 300);
        }, 3000);

        
    }

    // ===== FUNCIONES DE GESTIÓN DE MASCOTAS =====
    window.editMascota = function (mascotaId) {
        const mascota = userMascotas.find(m => m.id === mascotaId);
        if (!mascota) {
            showNotification('Mascota no encontrada', true);
            return;
        }

        document.getElementById('pet-modal-title').innerHTML = '<i class="fas fa-edit"></i> Editar Mascota';
        document.getElementById('pet-id').value = mascota.id;
        document.getElementById('pet-name').value = mascota.nombre || '';
        document.getElementById('pet-type').value = mascota.tipo || mascota.especie || '';
        document.getElementById('pet-breed').value = mascota.raza || mascota.breed || '';
        document.getElementById('pet-age').value = mascota.edad || mascota.age || '';
        // NOTA: Se eliminó el campo de foto del formulario

        document.getElementById('pet-modal').style.display = 'flex';
    };

    window.deleteMascota = function (mascotaId) {
        if (!confirm('¿Estás seguro de que quieres eliminar esta mascota? También se eliminará su historial médico.')) {
            return;
        }

        try {
            // Eliminar mascota del localStorage
            let todasMascotas = JSON.parse(localStorage.getItem('mascotas') || '[]');
            todasMascotas = todasMascotas.filter(m => m.id !== mascotaId);
            localStorage.setItem('mascotas', JSON.stringify(todasMascotas));

            // Eliminar historial médico asociado
            let todoHistorial = JSON.parse(localStorage.getItem('historialMedico') || '[]');
            todoHistorial = todoHistorial.filter(r => r.mascotaId !== mascotaId);
            localStorage.setItem('historialMedico', JSON.stringify(todoHistorial));

            // Actualizar datos locales
            userMascotas = loadUserMascotas(currentUser);
            userHistorial = loadUserHistorial(userMascotas);

            // Actualizar interfaz
            displayMascotas(userMascotas, userHistorial);
            displayRecentHistory(userHistorial, userMascotas);
            document.getElementById('user-pets-count').textContent = userMascotas.length;

            showNotification('Mascota eliminada correctamente');
        } catch (error) {
            console.error('❌ Error al eliminar mascota:', error);
            showNotification('Error al eliminar mascota', true);
        }
    };

    // ===== CONFIGURACIÓN DE EVENTOS =====
    function setupEventListeners() {
        // Menú hamburguesa
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('nav-menu');

        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });

            // Cerrar menú al hacer clic en un enlace (en móviles)
            const navLinks = document.querySelectorAll('#nav-menu a');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                });
            });
        }

        // Cerrar sesión
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('currentUser');
                window.location.href = 'login.html';
            });
        }

        // Editar perfil
        const editProfileBtn = document.getElementById('edit-profile-btn');
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => {
                document.getElementById('edit-profile-modal').style.display = 'flex';
            });
        }

        // Formulario editar perfil - CORREGIDO
        const editProfileForm = document.getElementById('edit-profile-form');
        if (editProfileForm) {
            editProfileForm.addEventListener('submit', (e) => {
                e.preventDefault();

                const newName = document.getElementById('edit-name').value;
                const newEmail = document.getElementById('edit-email').value;
                const newPhone = document.getElementById('edit-phone').value;
                // const newPassword = document.getElementById('edit-password').value;

                // Guardar email anterior para actualizar mascotas
                const oldEmail = currentUser.correo || currentUser.email;

                // Actualizar currentUser
                currentUser.nombre = newName;
                currentUser.correo = newEmail;
                currentUser.email = newEmail;
                currentUser.telefono = newPhone;

              

                localStorage.setItem('currentUser', JSON.stringify(currentUser));

                // Actualizar en la lista de usuarios
                const allUsers = loadAllUsers();
                const userIndex = allUsers.findIndex(u =>
                    u.email === oldEmail || u.correo === oldEmail
                );

                if (userIndex !== -1) {
                    allUsers[userIndex].nombre = newName;
                    allUsers[userIndex].email = newEmail;
                    allUsers[userIndex].correo = newEmail;
                    allUsers[userIndex].telefono = newPhone;

                  

                    localStorage.setItem('users', JSON.stringify(allUsers));
                }

                // Actualizar el dueño en las mascotas si cambió el email
                if (oldEmail && oldEmail !== newEmail) {
                    const todasMascotas = JSON.parse(localStorage.getItem('mascotas') || '[]');
                    todasMascotas.forEach(mascota => {
                        if (mascota.dueño === oldEmail || mascota.owner === oldEmail) {
                            mascota.dueño = newEmail;
                            mascota.owner = newEmail;
                        }
                    });
                    localStorage.setItem('mascotas', JSON.stringify(todasMascotas));
                }

                // Recargar datos
                userMascotas = loadUserMascotas(currentUser);
                userHistorial = loadUserHistorial(userMascotas);

                // Actualizar interfaz
                displayUserData(currentUser);
                displayMascotas(userMascotas, userHistorial);
                displayRecentHistory(userHistorial, userMascotas);
                document.getElementById('user-pets-count').textContent = userMascotas.length;

                document.getElementById('edit-profile-modal').style.display = 'none';
               showNotification('Perfil actualizado correctamente');
            });
        }

        // Cerrar modal editar perfil
        const closeEditModal = document.getElementById('close-edit-modal');
        if (closeEditModal) {
            closeEditModal.addEventListener('click', () => {
                document.getElementById('edit-profile-modal').style.display = 'none';
                document.getElementById('edit-password').value = ''; // Limpiar campo de contraseña
            });
        }

        // Añadir mascota
        const addPetBtn = document.getElementById('add-pet-btn');
        if (addPetBtn) {
            addPetBtn.addEventListener('click', () => {
                document.getElementById('pet-modal-title').innerHTML = '<i class="fas fa-paw"></i> Añadir Mascota';
                document.getElementById('pet-form').reset();
                document.getElementById('pet-id').value = '';
                document.getElementById('pet-modal').style.display = 'flex';
            });
        }

        // Formulario mascota
        const petForm = document.getElementById('pet-form');
        if (petForm) {
            petForm.addEventListener('submit', (e) => {
                e.preventDefault();

                const petId = document.getElementById('pet-id').value;
                const petData = {
                    nombre: document.getElementById('pet-name').value,
                    tipo: document.getElementById('pet-type').value,
                    raza: document.getElementById('pet-breed').value,
                    edad: document.getElementById('pet-age').value
                    // NOTA: Se eliminó el campo de foto
                };

                try {
                    if (petId) {
                        // Editar mascota existente
                        let todasMascotas = JSON.parse(localStorage.getItem('mascotas') || '[]');
                        const index = todasMascotas.findIndex(m => m.id === petId);

                        if (index !== -1) {
                            todasMascotas[index] = {
                                ...todasMascotas[index],
                                ...petData
                            };
                            localStorage.setItem('mascotas', JSON.stringify(todasMascotas));
                            showNotification('Mascota actualizada correctamente');
                        }
                    } else {
                        // Añadir nueva mascota
                        const todasMascotas = JSON.parse(localStorage.getItem('mascotas') || '[]');
                        const nuevaMascota = {
                            id: 'mascota_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                            dueño: currentUser.correo || currentUser.email,
                            ...petData
                        };

                        todasMascotas.push(nuevaMascota);
                        localStorage.setItem('mascotas', JSON.stringify(todasMascotas));
                        showNotification('Mascota añadida correctamente');
                    }

                    // Recargar datos
                    userMascotas = loadUserMascotas(currentUser);
                    userHistorial = loadUserHistorial(userMascotas);

                    // Actualizar interfaz
                    displayMascotas(userMascotas, userHistorial);
                    displayRecentHistory(userHistorial, userMascotas);
                    document.getElementById('user-pets-count').textContent = userMascotas.length;

                    document.getElementById('pet-modal').style.display = 'none';
                } catch (error) {
                    console.error('❌ Error al guardar mascota:', error);
                    showNotification('Error al guardar mascota', true);
                }
            });
        }

        // Cerrar modal mascota
        const closePetModal = document.getElementById('close-pet-modal');
        if (closePetModal) {
            closePetModal.addEventListener('click', () => {
                document.getElementById('pet-modal').style.display = 'none';
            });
        }

        // Cerrar modales al hacer clic fuera
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                    if (modal.id === 'edit-profile-modal') {
                        document.getElementById('edit-password').value = ''; // Limpiar campo de contraseña
                    }
                }
            });
        });
    }

    // ===== INICIALIZAR APLICACIÓN =====
    function init() {
        

        // 1. Cargar usuario actual
        currentUser = loadCurrentUser();
        if (!currentUser) return;

        // 2. Cargar mascotas del usuario
        userMascotas = loadUserMascotas(currentUser);

        // 3. Cargar historial médico
        userHistorial = loadUserHistorial(userMascotas);

        // 4. Mostrar datos en la interfaz
        displayUserData(currentUser);
        displayMascotas(userMascotas, userHistorial);
        displayRecentHistory(userHistorial, userMascotas);

        // 5. Actualizar contador de mascotas
        document.getElementById('user-pets-count').textContent = userMascotas.length;

        // 6. Configurar eventos
        setupEventListeners();

        
    }

    // Iniciar la aplicación
    init();
});
