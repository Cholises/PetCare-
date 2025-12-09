// js/citas.js - Sistema de Citas Veterinarias (Compatible con menu.js)

document.addEventListener('DOMContentLoaded', () => {
    
    
    // ===== VERIFICAR SESIÓN =====
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        console.warn('⚠️ No hay usuario logueado');
        alert('⚠️ Debes iniciar sesión primero');
        window.location.href = 'login.html';
        return;
    }
    
    

    // Email del usuario (compatibilidad con `correo` / `email`)
    const correoUsuario = currentUser.correo || currentUser.email || null;
    const normalizedCorreo = correoUsuario ? String(correoUsuario).toLowerCase().trim() : null;
    
    // ===== VARIABLES GLOBALES =====
    let citas = [];
    let mascotas = [];
    let vacunas = [];
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    let editingAppointmentId = null;
    let currentFilter = 'all';
    let currentPetFilter = 'all';
    let selectedDateParam = null;
    let targetCitaId = null;
    
    // ===== ELEMENTOS DEL DOM =====
    const modal = document.getElementById('appointmentModal');
    const detailsModal = document.getElementById('detailsModal');
    const appointmentForm = document.getElementById('appointmentForm');
    const appointmentsList = document.getElementById('appointmentsList');
    const calendarGrid = document.getElementById('calendarGrid');
    const emptyState = document.getElementById('emptyState');
    
    // ===== CARGAR DATOS =====
    function loadData() {
        // Cargar todas las mascotas
        const todasMascotas = JSON.parse(localStorage.getItem('mascotas') || '[]');
        // Filtrar solo las del usuario actual (compatibilidad con varias claves)
        // Comparación insensible a mayúsculas para `correo`/`owner` y coincidencia por userId
        mascotas = todasMascotas.filter(m => {
            const ownerVals = [m['dueño'], m.owner, m.userId];
            const ownerMatch = ownerVals.some(v => v && normalizedCorreo && String(v).toLowerCase().trim() === normalizedCorreo);
            const idMatch = (m.userId && currentUser.id && m.userId === currentUser.id);
            return ownerMatch || idMatch;
        });
        
        
        
        // Cargar todas las citas
        const todasCitas = JSON.parse(localStorage.getItem('citas') || '[]');
        // Filtrar solo las citas de las mascotas del usuario
        const mascotasIds = mascotas.map(m => m.id);
        citas = todasCitas.filter(c => mascotasIds.includes(c.mascotaId));
        
        // Cargar vacunas próximas del usuario
        const todasVacunas = JSON.parse(localStorage.getItem('vacunas') || '[]');
        vacunas = todasVacunas.filter(v => 
            (v.userId === correoUsuario) || mascotasIds.includes(v.petId)
        );

        // Si no hay mascotas, mostrar advertencia
        if (mascotas.length === 0) {
            console.warn('⚠️ No hay mascotas registradas');
        }

        // (debug panel removed)
    }
    
    
    // ===== GUARDAR CITAS =====
    function saveCitas() {
        const todasCitas = JSON.parse(localStorage.getItem('citas') || '[]');
        // Actualizar solo las citas del usuario actual
        const mascotasIds = mascotas.map(m => m.id);
        const citasOtrosUsuarios = todasCitas.filter(c => !mascotasIds.includes(c.mascotaId));
        const nuevasCitas = [...citasOtrosUsuarios, ...citas];
        localStorage.setItem('citas', JSON.stringify(nuevasCitas));
    }
    
    // ===== INICIALIZAR =====
    function init() {
        loadData();
        renderCalendar();
        renderAppointments();
        updateStats();
        loadPetFilters();
        setupEventListeners();
    }
    
    // ===== EVENT LISTENERS =====
    function setupEventListeners() {
        // Botón agregar cita
        const addBtn = document.getElementById('addAppointmentBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => openModal());
        }
        
        // Cerrar modal
        const closeBtn = document.getElementById('closeModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }
        
        // Cancelar
        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', closeModal);
        }
        
        // Click fuera del modal
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });
        }
        
        // Formulario
        if (appointmentForm) {
            appointmentForm.addEventListener('submit', handleSubmit);
        }
        
        // Calendario
        const prevBtn = document.getElementById('prevMonth');
        const nextBtn = document.getElementById('nextMonth');
        if (prevBtn) prevBtn.addEventListener('click', () => changeMonth(-1));
        if (nextBtn) nextBtn.addEventListener('click', () => changeMonth(1));
        
        // Filtros
        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
                e.target.classList.add('active');
                currentFilter = e.target.dataset.filter;
                renderAppointments();
            });
        });
        
        const petFilter = document.getElementById('petFilter');
        if (petFilter) {
            petFilter.addEventListener('change', (e) => {
                currentPetFilter = e.target.value;
                renderAppointments();
            });
        }
        
        // Cerrar modal de detalles
        const closeDetailsBtn = document.getElementById('closeDetailsModal');
        if (closeDetailsBtn) {
            closeDetailsBtn.addEventListener('click', closeDetailsModal);
        }
        
        if (detailsModal) {
            detailsModal.addEventListener('click', (e) => {
                if (e.target === detailsModal) closeDetailsModal();
            });
        }
    }
    
    // ===== MODAL =====
    function openModal(citaId = null) {
        if (!modal) return;
        
        // Verificar si hay mascotas
        if (mascotas.length === 0) {
            showNotification('⚠️ Primero debes registrar una mascota en el menú principal', 'warning');
            return;
        }
        
        const modalTitle = document.getElementById('modalTitle');
        
        if (citaId) {
            // Modo edición
            editingAppointmentId = citaId;
            loadAppointmentData(citaId);
            if (modalTitle) modalTitle.textContent = 'Editar Cita';
        } else {
            // Modo creación
            editingAppointmentId = null;
            if (appointmentForm) appointmentForm.reset();
            if (modalTitle) modalTitle.textContent = 'Nueva Cita';
            
            // Fecha mínima: hoy
            const today = new Date().toISOString().split('T')[0];
            const dateInput = document.getElementById('appointmentDate');
            if (dateInput) {
                dateInput.min = today;
                dateInput.value = today;
            }
        }
        
        loadPetSelect();
        modal.classList.add('show');
    }
    
    function closeModal() {
        if (!modal) return;
        modal.classList.remove('show');
        if (appointmentForm) appointmentForm.reset();
        editingAppointmentId = null;
    }
    
    function closeDetailsModal() {
        if (!detailsModal) return;
        detailsModal.classList.remove('show');
    }
    
    // ===== CARGAR SELECT DE MASCOTAS =====
    function loadPetSelect() {
        const petSelect = document.getElementById('petSelect');
        if (!petSelect) return;
        
        petSelect.innerHTML = '<option value="">Selecciona una mascota</option>';
        
        mascotas.forEach(mascota => {
            const option = document.createElement('option');
            option.value = mascota.id;
            option.textContent = `${mascota.nombre} (${mascota.tipo})`;
            petSelect.appendChild(option);
        });
    }
    
    // ===== CARGAR FILTROS DE MASCOTAS =====
    function loadPetFilters() {
        const petFilter = document.getElementById('petFilter');
        if (!petFilter) return;
        
        petFilter.innerHTML = '<option value="all">Todas las mascotas</option>';
        
        mascotas.forEach(mascota => {
            const option = document.createElement('option');
            option.value = mascota.id;
            option.textContent = mascota.nombre;
            petFilter.appendChild(option);
        });
    }
    
    // ===== GUARDAR/ACTUALIZAR CITA =====
    function handleSubmit(e) {
        e.preventDefault();
        
        const mascotaId = document.getElementById('petSelect').value;
        const fecha = document.getElementById('appointmentDate').value;
        const hora = document.getElementById('appointmentTime').value;
        const veterinaria = document.getElementById('veterinary').value.trim();
        const tipo = document.getElementById('appointmentType').value;
        const motivo = document.getElementById('reason').value.trim();
        const notas = document.getElementById('notes').value.trim();
        const recordatorio1dia = document.getElementById('reminder1day').checked;
        const recordatorio1hora = document.getElementById('reminder1hour').checked;
        
        // ✅ VALIDACIÓN: Mascota seleccionada
        if (!mascotaId) {
            showNotification('⚠️ Por favor selecciona una mascota', 'error');
            document.getElementById('petSelect').focus();
            return;
        }
        
        // ✅ VALIDACIÓN: Fecha y hora completas
        if (!fecha || !hora) {
            showNotification('⚠️ Completa la fecha y hora de la cita', 'error');
            if (!fecha) document.getElementById('appointmentDate').focus();
            else document.getElementById('appointmentTime').focus();
            return;
        }
        
        // ✅ VALIDACIÓN: Fecha pasada - rechazo inmediato
        const fechaCita = new Date(`${fecha}T${hora}`);
        const ahora = new Date();
        
        if (fechaCita < ahora) {
            showNotification('❌ No puedes agendar citas en fechas pasadas. Por favor selecciona una fecha futura.', 'error');
            document.getElementById('appointmentDate').focus();
            return;
        }
        
        // ✅ VALIDACIÓN: Veterinaria ingresada
        if (!veterinaria) {
            showNotification('⚠️ Ingresa el nombre de la veterinaria o clínica', 'error');
            document.getElementById('veterinary').focus();
            return;
        }
        
        // ✅ VALIDACIÓN: Tipo de cita seleccionado
        if (!tipo) {
            showNotification('⚠️ Selecciona el tipo de cita', 'error');
            document.getElementById('appointmentType').focus();
            return;
        }
        
        // ✅ VALIDACIÓN: Obtener datos de la mascota
        const mascota = mascotas.find(m => m.id === mascotaId);
        if (!mascota) {
            showNotification('⚠️ Error: Mascota no encontrada en el sistema', 'error');
            return;
        }
        
        // ✅ VALIDACIÓN: Verificar horarios ocupados/bloqueados
        const horarioOcupado = citas.find(c => 
            c.id !== editingAppointmentId && // Excluir la cita actual si estamos editando
            c.fecha === fecha && 
            c.hora === hora && 
            c.veterinaria.toLowerCase() === veterinaria.toLowerCase() &&
            c.estado !== 'cancelada'
        );
        
        if (horarioOcupado) {
            const confirmar = confirm(
                `⚠️ HORARIO OCUPADO\n\n` +
                `Ya tienes una cita programada para:\n` +
                `📅 ${formatDateLong(fecha)} a las ${hora}\n` +
                `🏥 ${veterinaria}\n` +
                `🐾 Mascota: ${horarioOcupado.nombreMascota}\n\n` +
                `¿Deseas continuar de todas formas?`
            );
            
            if (!confirmar) {
                document.getElementById('appointmentTime').focus();
                return;
            }
        }
        
        const citaData = {
            mascotaId: mascotaId,
            nombreMascota: mascota.nombre,
            fotoMascota: mascota.foto,
            fecha: fecha,
            hora: hora,
            veterinaria: veterinaria,
            tipo: tipo,
            motivo: motivo,
            notas: notas,
            recordatorio1dia: recordatorio1dia,
            recordatorio1hora: recordatorio1hora,
            estado: 'pendiente'
        };
        
        if (editingAppointmentId) {
            updateAppointment(editingAppointmentId, citaData);
        } else {
            createAppointment(citaData);
        }
    }
    
    // ===== CREAR CITA =====
    function createAppointment(citaData) {
        const nuevaCita = {
            id: 'cita_' + Date.now(),
            ...citaData,
            creado: new Date().toISOString()
        };
        
        citas.push(nuevaCita);
        saveCitas();
        
        // ✅ Programar notificaciones recordatorias
        programarRecordatorios(nuevaCita);
        
        showNotification(`🎉 Cita agendada para ${citaData.nombreMascota}`, 'success');
        
        closeModal();
        renderAppointments();
        renderCalendar();
        updateStats();
    }
    
    // ===== ACTUALIZAR CITA =====
    function updateAppointment(citaId, citaData) {
        const index = citas.findIndex(c => c.id === citaId);
        if (index === -1) {
            showNotification('⚠️ Cita no encontrada', 'error');
            return;
        }
        
        citas[index] = {
            ...citas[index],
            ...citaData,
            actualizado: new Date().toISOString()
        };
        
        saveCitas();
        
        showNotification('✅ Cita actualizada correctamente', 'success');
        
        closeModal();
        renderAppointments();
        renderCalendar();
        updateStats();
    }
    
    // ===== CARGAR DATOS PARA EDITAR =====
    function loadAppointmentData(citaId) {
        const cita = citas.find(c => c.id === citaId);
        if (!cita) return;
        
        document.getElementById('petSelect').value = cita.mascotaId;
        document.getElementById('appointmentDate').value = cita.fecha;
        document.getElementById('appointmentTime').value = cita.hora;
        document.getElementById('veterinary').value = cita.veterinaria;
        document.getElementById('appointmentType').value = cita.tipo;
        document.getElementById('reason').value = cita.motivo || '';
        document.getElementById('notes').value = cita.notas || '';
        document.getElementById('reminder1day').checked = cita.recordatorio1dia || false;
        document.getElementById('reminder1hour').checked = cita.recordatorio1hora || false;
    }
    
    // ===== RENDERIZAR CITAS =====
    function renderAppointments() {
        if (!appointmentsList) return;
        
        let citasFiltradas = [...citas];
        
        // Filtrar por estado
        if (currentFilter !== 'all') {
            citasFiltradas = citasFiltradas.filter(c => c.estado === currentFilter);
        }
        
        // Filtrar por mascota
        if (currentPetFilter !== 'all') {
            citasFiltradas = citasFiltradas.filter(c => c.mascotaId === currentPetFilter);
        }

        // Si venimos con una fecha específica desde el menú/calendario, filtrar por esa fecha
        if (selectedDateParam) {
            citasFiltradas = citasFiltradas.filter(c => c.fecha === selectedDateParam);
        }
        
        // Ordenar por fecha y hora
        citasFiltradas.sort((a, b) => {
            const dateA = new Date(`${a.fecha}T${a.hora}`);
            const dateB = new Date(`${b.fecha}T${b.hora}`);
            return dateA - dateB;
        });
        
        // Mostrar estado vacío si no hay citas
        if (citasFiltradas.length === 0) {
            appointmentsList.innerHTML = '';
            if (emptyState) emptyState.classList.add('show');
            return;
        }
        
        if (emptyState) emptyState.classList.remove('show');
        
        // Renderizar citas
        appointmentsList.innerHTML = citasFiltradas.map(cita => {
            const tipoNombres = {
                consulta: 'Consulta',
                vacunacion: 'Vacunación',
                cirugia: 'Cirugía',
                emergencia: 'Emergencia',
                control: 'Control',
                dental: 'Dental',
                estetica: 'Estética',
                otro: 'Otro'
            };
            
            const estadoNombres = {
                pendiente: 'Pendiente',
                completada: 'Completada',
                cancelada: 'Cancelada'
            };
            
            const hasPhoto = cita.fotoMascota && (cita.fotoMascota.startsWith('data:') || cita.fotoMascota.startsWith('http'));
            
            return `
                <div class="appointment-card ${cita.estado}" onclick="showAppointmentDetails('${cita.id}')">
                    <div class="appointment-header">
                        <div class="appointment-pet">
                            ${hasPhoto 
                                ? `<img src="${cita.fotoMascota}" alt="${cita.nombreMascota}" class="pet-avatar">`
                                : `<div class="pet-avatar-placeholder">${cita.fotoMascota || '🐾'}</div>`
                            }
                            <div class="pet-info">
                                <h4>${cita.nombreMascota}</h4>
                                <p>${tipoNombres[cita.tipo] || cita.tipo}</p>
                            </div>
                        </div>
                        <span class="appointment-status ${cita.estado}">${estadoNombres[cita.estado]}</span>
                    </div>
                    <div class="appointment-body">
                        <div class="appointment-datetime">
                            <i class="fas fa-calendar"></i>
                            <span>${formatDateLong(cita.fecha)}</span>
                            <i class="fas fa-clock"></i>
                            <span>${cita.hora}</span>
                        </div>
                        <div class="appointment-location">
                            <i class="fas fa-hospital"></i>
                            <span>${cita.veterinaria}</span>
                        </div>
                    </div>
                    <div class="appointment-footer">
                        <div class="appointment-type">
                            ${cita.motivo ? `<span>${cita.motivo}</span>` : ''}
                        </div>
                        <div class="appointment-actions" onclick="event.stopPropagation()">
                            ${cita.estado === 'pendiente' ? `
                                <button class="action-btn complete" onclick="completeAppointment('${cita.id}')" title="Marcar como completada">
                                    <i class="fas fa-check"></i>
                                </button>
                                <button class="action-btn reschedule" onclick="rescheduleAppointment('${cita.id}')" title="Reprogramar cita">
                                    <i class="fas fa-calendar-alt"></i>
                                </button>
                                <button class="action-btn cancel" onclick="cancelAppointment('${cita.id}')" title="Cancelar cita">
                                    <i class="fas fa-ban"></i>
                                </button>
                            ` : ''}
                            <button class="action-btn edit" onclick="editAppointment('${cita.id}')" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete" onclick="deleteAppointment('${cita.id}')" title="Eliminar permanentemente">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        updateFilterCounts();

        // Si se solicitó abrir una cita específica desde parámetros, abrir detalles y limpiar el parámetro
        if (targetCitaId) {
            const citaTarget = citas.find(c => c.id === targetCitaId);
            if (citaTarget) {
                setTimeout(() => {
                    showAppointmentDetails(targetCitaId);
                }, 200);
            }
            targetCitaId = null;
            // Limpiar parámetros de la URL para evitar comportamiento repetido
            try { history.replaceState(null, '', window.location.pathname); } catch (e) {}
        }
    }
    
    // ===== CALENDARIO =====
    function renderCalendar() {
        if (!calendarGrid) return;
        
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                           'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        
        const currentMonthEl = document.getElementById('currentMonth');
        if (currentMonthEl) {
            currentMonthEl.textContent = `${monthNames[currentMonth]} ${currentYear}`;
        }
        
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const today = new Date();
        
        let calendarHTML = '';

        // Debug: listar fechas únicas de citas
        try {
            const uniqueDates = Array.from(new Set(citas.map(c=>c.fecha))).slice(0,20);
            
        } catch(e) {}
        
        // Headers
        const dayHeaders = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
        dayHeaders.forEach(day => {
            calendarHTML += `<div class="calendar-day header">${day}</div>`;
        });
        
        // Días vacíos
        for (let i = 0; i < firstDay; i++) {
            calendarHTML += '<div class="calendar-day inactive"></div>';
        }
        
        // Días del mes
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentYear, currentMonth, day);
            const dateStr = formatDate(date);
            const hasCita = citas.some(c => c.fecha === dateStr);
            const hasVacuna = vacunas.some(v => v.nextDoseDate === dateStr || v.applicationDate === dateStr);
            const isToday = date.toDateString() === today.toDateString();
            
            let classes = 'calendar-day';
            if (isToday) classes += ' today';
            if (hasCita) classes += ' has-appointment';
            if (hasVacuna) classes += ' has-vaccine';
            
            calendarHTML += `<div class="${classes}" data-date="${dateStr}">${day}</div>`;
        }
        
        calendarGrid.innerHTML = calendarHTML;
        
        // Event listeners para días
        document.querySelectorAll('.calendar-day:not(.header):not(.inactive)').forEach(day => {
            day.addEventListener('click', (e) => {
                const date = e.target.dataset.date;
                if (date) {
                    openModal();
                    setTimeout(() => {
                        document.getElementById('appointmentDate').value = date;
                    }, 100);
                }
            });
        });
    }
    
    function changeMonth(direction) {
        currentMonth += direction;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        } else if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    }
    
    // ===== ESTADÍSTICAS =====
    function updateStats() {
        const pendientes = citas.filter(c => c.estado === 'pendiente').length;
        const completadas = citas.filter(c => c.estado === 'completada').length;
        
        const today = new Date();
        const proximas = citas.filter(c => {
            const citaDate = new Date(`${c.fecha}T${c.hora}`);
            return c.estado === 'pendiente' && citaDate >= today;
        }).length;
        
        const pendingEl = document.getElementById('pendingCount');
        const completedEl = document.getElementById('completedCount');
        const upcomingEl = document.getElementById('upcomingCount');
        
        if (pendingEl) pendingEl.textContent = pendientes;
        if (completedEl) completedEl.textContent = completadas;
        if (upcomingEl) upcomingEl.textContent = proximas;
    }
    
    function updateFilterCounts() {
        const all = citas.length;
        const pendiente = citas.filter(c => c.estado === 'pendiente').length;
        const completada = citas.filter(c => c.estado === 'completada').length;
        const cancelada = citas.filter(c => c.estado === 'cancelada').length;
        
        const allEl = document.getElementById('allCount');
        const pendienteEl = document.getElementById('pendienteCount');
        const completadaEl = document.getElementById('completadaCount');
        const canceladaEl = document.getElementById('canceladaCount');
        
        if (allEl) allEl.textContent = all;
        if (pendienteEl) pendienteEl.textContent = pendiente;
        if (completadaEl) completadaEl.textContent = completada;
        if (canceladaEl) canceladaEl.textContent = cancelada;
    }
    
    // ===== ACCIONES =====
    window.editAppointment = function(citaId) {
        openModal(citaId);
    };
    
    window.completeAppointment = function(citaId) {
        const cita = citas.find(c => c.id === citaId);
        if (cita) {
            cita.estado = 'completada';
            saveCitas();
            renderAppointments();
            updateStats();
            showNotification('✅ Cita marcada como completada', 'success');
        }
    };
    
    // ✅ CANCELAR CITA (no elimina, solo cambia estado)
    window.cancelAppointment = function(citaId) {
        const cita = citas.find(c => c.id === citaId);
        if (!cita) return;
        
        const motivo = prompt(
            `¿Estás seguro de cancelar la cita de ${cita.nombreMascota}?\n\n` +
            `📅 ${formatDateLong(cita.fecha)} a las ${cita.hora}\n` +
            `🏥 ${cita.veterinaria}\n\n` +
            `Ingresa el motivo de cancelación (opcional):`
        );
        
        if (motivo !== null) { // null = usuario canceló el prompt
            cita.estado = 'cancelada';
            cita.motivoCancelacion = motivo || 'Sin motivo especificado';
            cita.fechaCancelacion = new Date().toISOString();
            saveCitas();
            renderAppointments();
            renderCalendar();
            updateStats();
            showNotification('❌ Cita cancelada exitosamente', 'info');
        }
    };
    
    // ✅ REPROGRAMAR CITA
    window.rescheduleAppointment = function(citaId) {
        const cita = citas.find(c => c.id === citaId);
        if (!cita) return;
        
        if (confirm(
            `¿Deseas reprogramar la cita de ${cita.nombreMascota}?\n\n` +
            `📅 Fecha actual: ${formatDateLong(cita.fecha)} - ${cita.hora}\n` +
            `🏥 ${cita.veterinaria}\n\n` +
            `Se abrirá el formulario para que selecciones una nueva fecha y hora.`
        )) {
            // Marcar que estamos reprogramando
            cita.reprogramada = true;
            cita.fechaOriginal = cita.fecha;
            cita.horaOriginal = cita.hora;
            openModal(citaId);
        }
    };
    
    window.deleteAppointment = function(citaId) {
        const cita = citas.find(c => c.id === citaId);
        if (!cita) return;
        
        if (confirm(
            `⚠️ ¿ELIMINAR PERMANENTEMENTE?\n\n` +
            `Esta acción eliminará completamente la cita de ${cita.nombreMascota}\n` +
            `📅 ${formatDateLong(cita.fecha)} a las ${cita.hora}\n\n` +
            `Si solo deseas cancelarla, usa el botón "Cancelar Cita".\n\n` +
            `¿Estás seguro de ELIMINAR permanentemente?`
        )) {
            citas = citas.filter(c => c.id !== citaId);
            saveCitas();
            renderAppointments();
            renderCalendar();
            updateStats();
            showNotification('🗑️ Cita eliminada permanentemente', 'info');
        }
    };
    
    window.showAppointmentDetails = function(citaId) {
        const cita = citas.find(c => c.id === citaId);
        if (!cita || !detailsModal) return;
        
        const tipoNombres = {
            consulta: 'Consulta General',
            vacunacion: 'Vacunación',
            cirugia: 'Cirugía',
            emergencia: 'Emergencia',
            control: 'Control/Revisión',
            dental: 'Dental',
            estetica: 'Estética',
            otro: 'Otro'
        };
        
        const estadoNombres = {
            pendiente: 'Pendiente',
            completada: 'Completada',
            cancelada: 'Cancelada'
        };
        
        const detailsHTML = `
            <div class="detail-section">
                <div class="detail-row">
                    <div class="detail-icon"><i class="fas fa-paw"></i></div>
                    <div class="detail-content">
                        <div class="detail-label">Mascota</div>
                        <div class="detail-value">${cita.nombreMascota}</div>
                    </div>
                </div>
                <div class="detail-row">
                    <div class="detail-icon"><i class="fas fa-calendar"></i></div>
                    <div class="detail-content">
                        <div class="detail-label">Fecha y Hora</div>
                        <div class="detail-value">${formatDateLong(cita.fecha)} - ${cita.hora}</div>
                    </div>
                </div>
                <div class="detail-row">
                    <div class="detail-icon"><i class="fas fa-hospital"></i></div>
                    <div class="detail-content">
                        <div class="detail-label">Veterinaria</div>
                        <div class="detail-value">${cita.veterinaria}</div>
                    </div>
                </div>
                <div class="detail-row">
                    <div class="detail-icon"><i class="fas fa-stethoscope"></i></div>
                    <div class="detail-content">
                        <div class="detail-label">Tipo de Cita</div>
                        <div class="detail-value">${tipoNombres[cita.tipo]}</div>
                    </div>
                </div>
                <div class="detail-row">
                    <div class="detail-icon"><i class="fas fa-info-circle"></i></div>
                    <div class="detail-content">
                        <div class="detail-label">Estado</div>
                        <div class="detail-value">${estadoNombres[cita.estado]}</div>
                    </div>
                </div>
                ${cita.motivo ? `
                    <div class="detail-row">
                        <div class="detail-icon"><i class="fas fa-notes-medical"></i></div>
                        <div class="detail-content">
                            <div class="detail-label">Motivo</div>
                            <div class="detail-value">${cita.motivo}</div>
                        </div>
                    </div>
                ` : ''}
                ${cita.notas ? `
                    <div class="detail-row">
                        <div class="detail-icon"><i class="fas fa-comment-medical"></i></div>
                        <div class="detail-content">
                            <div class="detail-label">Notas</div>
                            <div class="detail-value">${cita.notas}</div>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
        
        const detailsContainer = document.getElementById('appointmentDetails');
        if (detailsContainer) {
            detailsContainer.innerHTML = detailsHTML;
        }
        
        const editBtn = document.getElementById('editDetailsBtn');
        const deleteBtn = document.getElementById('deleteDetailsBtn');
        
        if (editBtn) {
            editBtn.onclick = () => {
                closeDetailsModal();
                editAppointment(citaId);
            };
        }
        
        if (deleteBtn) {
            deleteBtn.onclick = () => {
                closeDetailsModal();
                deleteAppointment(citaId);
            };
        }
        
        detailsModal.classList.add('show');
    };
    
    // ===== UTILIDADES =====
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    function formatDateLong(dateStr) {
        const date = new Date(dateStr + 'T00:00:00');
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('es-ES', options);
    }
    
    function showNotification(message, type = 'info') {
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            z-index: 9999;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // ===== PARSEAR PARÁMETROS DE URL (enlaces desde menú/calendario) =====
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('date')) {
        selectedDateParam = urlParams.get('date');
        const d = new Date(selectedDateParam);
        if (!isNaN(d)) {
            currentMonth = d.getMonth();
            currentYear = d.getFullYear();
        }
    }
    if (urlParams.has('id')) {
        targetCitaId = urlParams.get('id');
    } else if (urlParams.has('citaId')) {
        targetCitaId = urlParams.get('citaId');
    }

    // ===== SISTEMA DE NOTIFICACIONES RECORDATORIAS =====
    function programarRecordatorios(cita) {
        if (!cita.recordatorio1dia && !cita.recordatorio1hora) return;
        
        const fechaCita = new Date(`${cita.fecha}T${cita.hora}`);
        const ahora = new Date();
        
        // Recordatorio 1 día antes
        if (cita.recordatorio1dia) {
            const recordatorio1dia = new Date(fechaCita.getTime() - (24 * 60 * 60 * 1000));
            if (recordatorio1dia > ahora) {
                console.log(`📅 Recordatorio programado para: ${recordatorio1dia.toLocaleString()}`);
            }
        }
        
        // Recordatorio 1 hora antes
        if (cita.recordatorio1hora) {
            const recordatorio1hora = new Date(fechaCita.getTime() - (60 * 60 * 1000));
            if (recordatorio1hora > ahora) {
                console.log(`⏰ Recordatorio programado para: ${recordatorio1hora.toLocaleString()}`);
            }
        }
    }
    
    // ✅ Verificar recordatorios pendientes al cargar la página
    function verificarRecordatoriosPendientes() {
        const ahora = new Date();
        const recordatoriosMostrados = JSON.parse(localStorage.getItem('recordatoriosMostrados') || '[]');
        
        citas.forEach(cita => {
            if (cita.estado !== 'pendiente') return;
            
            const fechaCita = new Date(`${cita.fecha}T${cita.hora}`);
            const diferenciaMs = fechaCita - ahora;
            const diferenciaHoras = diferenciaMs / (1000 * 60 * 60);
            
            const recordatorioId = `${cita.id}_${cita.fecha}_${cita.hora}`;
            
            // Notificar si falta 1 día (24 horas) y no se ha mostrado
            if (cita.recordatorio1dia && diferenciaHoras <= 24 && diferenciaHoras > 23 && !recordatoriosMostrados.includes(recordatorioId + '_1dia')) {
                showNotification(
                    `🔔 Recordatorio: Mañana tienes cita para ${cita.nombreMascota} a las ${cita.hora} en ${cita.veterinaria}`,
                    'warning'
                );
                recordatoriosMostrados.push(recordatorioId + '_1dia');
                localStorage.setItem('recordatoriosMostrados', JSON.stringify(recordatoriosMostrados));
            }
            
            // Notificar si falta 1 hora y no se ha mostrado
            if (cita.recordatorio1hora && diferenciaHoras <= 1 && diferenciaHoras > 0 && !recordatoriosMostrados.includes(recordatorioId + '_1hora')) {
                showNotification(
                    `⏰ ¡URGENTE! En 1 hora tienes cita para ${cita.nombreMascota} en ${cita.veterinaria}`,
                    'warning'
                );
                recordatoriosMostrados.push(recordatorioId + '_1hora');
                localStorage.setItem('recordatoriosMostrados', JSON.stringify(recordatoriosMostrados));
            }
        });
    }
    
    // Verificar recordatorios cada 5 minutos
    setInterval(verificarRecordatoriosPendientes, 5 * 60 * 1000);
    verificarRecordatoriosPendientes(); // Verificar al cargar
    
    // ===== INICIAR APLICACIÓN =====
    init();
});