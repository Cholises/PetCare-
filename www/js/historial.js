// js/historial.js - Sistema de Historial Médico CORREGIDO

document.addEventListener('DOMContentLoaded', () => {
    console.log('📋 Inicializando sistema de historial médico...');
    
    // ===== VERIFICAR SESIÓN =====
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        console.warn('⚠️ No hay usuario logueado');
        alert('⚠️ Debes iniciar sesión primero');
        window.location.href = 'login.html';
        return;
    }
    
    console.log('✅ Usuario logueado:', currentUser.nombre);
    
    // ===== VARIABLES GLOBALES =====
    let registros = [];
    let mascotas = [];
    let editingRegistroId = null;
    let currentPetFilter = 'all';
    
    // ===== ELEMENTOS DEL DOM =====
    const modal = document.getElementById('registroModal');
    const detallesModal = document.getElementById('detallesModal');
    const registroForm = document.getElementById('registroForm');
    const timeline = document.getElementById('timeline');
    const emptyState = document.getElementById('emptyState');
    
    // ===== CARGAR DATOS =====
    function loadData() {
        // Cargar mascotas del usuario
        const todasMascotas = JSON.parse(localStorage.getItem('mascotas') || '[]');
        mascotas = todasMascotas.filter(m => m.dueño === currentUser.correo);
        
        console.log(`🐾 Mascotas del usuario: ${mascotas.length}`);
        
        // Cargar registros médicos
        const todosRegistros = JSON.parse(localStorage.getItem('historialMedico') || '[]');
        const mascotasIds = mascotas.map(m => m.id);
        registros = todosRegistros.filter(r => mascotasIds.includes(r.mascotaId));
        
        console.log(`📋 Registros médicos: ${registros.length}`);
    }
    
    // ===== GUARDAR REGISTROS =====
    function saveRegistros() {
        const todosRegistros = JSON.parse(localStorage.getItem('historialMedico') || '[]');
        const mascotasIds = mascotas.map(m => m.id);
        const registrosOtrosUsuarios = todosRegistros.filter(r => !mascotasIds.includes(r.mascotaId));
        const nuevosRegistros = [...registrosOtrosUsuarios, ...registros];
        localStorage.setItem('historialMedico', JSON.stringify(nuevosRegistros));
    }
    
    // ===== INICIALIZAR =====
    function init() {
        loadData();
        renderTimeline();
        updateStats();
        loadPetFilters();
        setupEventListeners();
    }
    
    // ===== EVENT LISTENERS =====
    function setupEventListeners() {
        // Botones agregar (NAV y ESTADO VACÍO)
        const addBtnNav = document.getElementById('addRegistroBtn');
        const addBtnEmpty = document.querySelector('.empty-state .btn-primary');
        
        if (addBtnNav) {
            addBtnNav.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🔘 Botón NAV clickeado');
                openModal();
            });
        }
        
        if (addBtnEmpty) {
            addBtnEmpty.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🔘 Botón EMPTY STATE clickeado');
                openModal();
            });
        }
        
        // Cerrar modales
        const closeBtn = document.getElementById('closeModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }
        
        const closeDetallesBtn = document.getElementById('closeDetallesModal');
        if (closeDetallesBtn) {
            closeDetallesBtn.addEventListener('click', closeDetallesModal);
        }
        
        // Cancelar
        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', closeModal);
        }
        
        // Click fuera
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });
        }
        
        if (detallesModal) {
            detallesModal.addEventListener('click', (e) => {
                if (e.target === detallesModal) closeDetallesModal();
            });
        }
        
        // Formulario
        if (registroForm) {
            registroForm.addEventListener('submit', handleSubmit);
        }
        
        // Filtro de mascotas
        const petFilter = document.getElementById('petFilter');
        if (petFilter) {
            petFilter.addEventListener('change', (e) => {
                currentPetFilter = e.target.value;
                renderTimeline();
            });
        }
    }
    
    // ===== MODAL =====
    function openModal(registroId = null) {
        console.log('🚀 Abriendo modal...', { registroId, mascotasCount: mascotas.length });
        
        if (!modal) {
            console.error('❌ Modal no encontrado en el DOM');
            return;
        }
        
        if (mascotas.length === 0) {
            showNotification('⚠️ Primero debes registrar una mascota', 'warning');
            setTimeout(() => {
                window.location.href = 'menu.html';
            }, 2000);
            return;
        }
        
        const modalTitle = document.getElementById('modalTitle');
        
        if (registroId) {
            editingRegistroId = registroId;
            loadRegistroData(registroId);
            if (modalTitle) modalTitle.textContent = 'Editar Registro Médico';
        } else {
            editingRegistroId = null;
            if (registroForm) registroForm.reset();
            if (modalTitle) modalTitle.textContent = 'Nuevo Registro Médico';
            
            // Fecha y hora actuales
            const now = new Date();
            const today = now.toISOString().split('T')[0];
            const time = now.toTimeString().slice(0, 5);
            
            const fechaInput = document.getElementById('fechaConsulta');
            const horaInput = document.getElementById('horaConsulta');
            if (fechaInput) fechaInput.value = today;
            if (horaInput) horaInput.value = time;
        }
        
        loadMascotaSelect();
        modal.classList.add('show');
        console.log('✅ Modal abierto');
    }
    
    function closeModal() {
        if (!modal) return;
        modal.classList.remove('show');
        if (registroForm) registroForm.reset();
        editingRegistroId = null;
        console.log('❌ Modal cerrado');
    }
    
    function closeDetallesModal() {
        if (!detallesModal) return;
        detallesModal.classList.remove('show');
    }
    
    // ===== CARGAR SELECT DE MASCOTAS =====
    function loadMascotaSelect() {
        const mascotaSelect = document.getElementById('mascotaSelect');
        if (!mascotaSelect) return;
        
        mascotaSelect.innerHTML = '<option value="">Selecciona una mascota</option>';
        
        mascotas.forEach(mascota => {
            const option = document.createElement('option');
            option.value = mascota.id;
            option.textContent = `${mascota.nombre} (${mascota.tipo})`;
            mascotaSelect.appendChild(option);
        });
        
        console.log(`✅ Select cargado con ${mascotas.length} mascotas`);
    }
    
    // ===== CARGAR FILTROS =====
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
    
    // ===== GUARDAR REGISTRO =====
    function handleSubmit(e) {
        e.preventDefault();
        
        const mascotaId = document.getElementById('mascotaSelect').value;
        const fecha = document.getElementById('fechaConsulta').value;
        const hora = document.getElementById('horaConsulta').value;
        const veterinario = document.getElementById('veterinario').value.trim();
        const veterinaria = document.getElementById('veterinaria').value.trim();
        const tipoConsulta = document.getElementById('tipoConsulta').value;
        const motivo = document.getElementById('motivo').value.trim();
        const sintomas = document.getElementById('sintomas').value.trim();
        const diagnostico = document.getElementById('diagnostico').value.trim();
        const tratamiento = document.getElementById('tratamiento').value.trim();
        const examenes = document.getElementById('examenes').value.trim();
        const peso = document.getElementById('peso').value;
        const temperatura = document.getElementById('temperatura').value;
        const proximaVisita = document.getElementById('proximaVisita').value;
        const costo = document.getElementById('costo').value;
        const notas = document.getElementById('notas').value.trim();
        
        // Validaciones
        if (!mascotaId || !fecha || !hora || !veterinario || !veterinaria || !tipoConsulta || !motivo || !diagnostico) {
            showNotification('⚠️ Completa todos los campos obligatorios', 'error');
            return;
        }
        
        const mascota = mascotas.find(m => m.id === mascotaId);
        if (!mascota) {
            showNotification('⚠️ Mascota no encontrada', 'error');
            return;
        }
        
        const registroData = {
            mascotaId,
            nombreMascota: mascota.nombre,
            fotoMascota: mascota.foto,
            fecha,
            hora,
            veterinario,
            veterinaria,
            tipoConsulta,
            motivo,
            sintomas,
            diagnostico,
            tratamiento,
            examenes,
            peso: peso ? parseFloat(peso) : null,
            temperatura: temperatura ? parseFloat(temperatura) : null,
            proximaVisita: proximaVisita || null,
            costo: costo ? parseFloat(costo) : null,
            notas
        };
        
        if (editingRegistroId) {
            updateRegistro(editingRegistroId, registroData);
        } else {
            createRegistro(registroData);
        }
    }
    
    // ===== CREAR REGISTRO =====
    function createRegistro(registroData) {
        const nuevoRegistro = {
            id: 'registro_' + Date.now(),
            ...registroData,
            creado: new Date().toISOString()
        };
        
        registros.push(nuevoRegistro);
        saveRegistros();
        
        console.log('✅ Registro creado:', nuevoRegistro);
        showNotification(`✅ Registro guardado para ${registroData.nombreMascota}`, 'success');
        
        closeModal();
        renderTimeline();
        updateStats();
    }
    
    // ===== ACTUALIZAR REGISTRO =====
    function updateRegistro(registroId, registroData) {
        const index = registros.findIndex(r => r.id === registroId);
        if (index === -1) {
            showNotification('⚠️ Registro no encontrado', 'error');
            return;
        }
        
        registros[index] = {
            ...registros[index],
            ...registroData,
            actualizado: new Date().toISOString()
        };
        
        saveRegistros();
        console.log('✅ Registro actualizado:', registros[index]);
        showNotification('✅ Registro actualizado correctamente', 'success');
        
        closeModal();
        renderTimeline();
        updateStats();
    }
    
    // ===== CARGAR DATOS PARA EDITAR =====
    function loadRegistroData(registroId) {
        const registro = registros.find(r => r.id === registroId);
        if (!registro) return;
        
        document.getElementById('mascotaSelect').value = registro.mascotaId;
        document.getElementById('fechaConsulta').value = registro.fecha;
        document.getElementById('horaConsulta').value = registro.hora;
        document.getElementById('veterinario').value = registro.veterinario;
        document.getElementById('veterinaria').value = registro.veterinaria;
        document.getElementById('tipoConsulta').value = registro.tipoConsulta;
        document.getElementById('motivo').value = registro.motivo;
        document.getElementById('sintomas').value = registro.sintomas || '';
        document.getElementById('diagnostico').value = registro.diagnostico;
        document.getElementById('tratamiento').value = registro.tratamiento || '';
        document.getElementById('examenes').value = registro.examenes || '';
        document.getElementById('peso').value = registro.peso || '';
        document.getElementById('temperatura').value = registro.temperatura || '';
        document.getElementById('proximaVisita').value = registro.proximaVisita || '';
        document.getElementById('costo').value = registro.costo || '';
        document.getElementById('notas').value = registro.notas || '';
    }
    
    // ===== RENDERIZAR TIMELINE =====
    function renderTimeline() {
        if (!timeline) return;
        
        let registrosFiltrados = [...registros];
        
        if (currentPetFilter !== 'all') {
            registrosFiltrados = registrosFiltrados.filter(r => r.mascotaId === currentPetFilter);
        }
        
        // Ordenar por fecha (más recientes primero)
        registrosFiltrados.sort((a, b) => {
            const dateA = new Date(`${a.fecha}T${a.hora}`);
            const dateB = new Date(`${b.fecha}T${b.hora}`);
            return dateB - dateA;
        });
        
        if (registrosFiltrados.length === 0) {
            timeline.innerHTML = '';
            if (emptyState) emptyState.style.display = 'flex';
            return;
        }
        
        if (emptyState) emptyState.style.display = 'none';
        
        timeline.innerHTML = registrosFiltrados.map(registro => {
            const tipoNombres = {
                consulta: 'Consulta General',
                emergencia: 'Emergencia',
                cirugia: 'Cirugía',
                control: 'Control Post-operatorio',
                vacunacion: 'Vacunación',
                examenes: 'Exámenes/Análisis',
                dental: 'Tratamiento Dental',
                otro: 'Otro'
            };
            
            const tipoIconos = {
                consulta: 'fa-stethoscope',
                emergencia: 'fa-ambulance',
                cirugia: 'fa-user-md',
                control: 'fa-clipboard-check',
                vacunacion: 'fa-syringe',
                examenes: 'fa-vial',
                dental: 'fa-tooth',
                otro: 'fa-notes-medical'
            };
            
            const hasPhoto = registro.fotoMascota && (registro.fotoMascota.startsWith('data:') || registro.fotoMascota.startsWith('http'));
            
            return `
                <div class="timeline-item" onclick="showRegistroDetails('${registro.id}')">
                    <div class="timeline-marker">
                        <i class="fas ${tipoIconos[registro.tipoConsulta] || 'fa-notes-medical'}"></i>
                    </div>
                    <div class="timeline-content">
                        <div class="timeline-header">
                            <div class="timeline-pet">
                                ${hasPhoto 
                                    ? `<img src="${registro.fotoMascota}" alt="${registro.nombreMascota}" class="pet-avatar">`
                                    : `<div class="pet-avatar-placeholder">${registro.fotoMascota || '🐾'}</div>`
                                }
                                <div>
                                    <h4>${registro.nombreMascota}</h4>
                                    <span class="timeline-type">${tipoNombres[registro.tipoConsulta]}</span>
                                </div>
                            </div>
                            <div class="timeline-date">
                                <i class="fas fa-calendar"></i> ${formatDateShort(registro.fecha)}
                                <br>
                                <i class="fas fa-clock"></i> ${registro.hora}
                            </div>
                        </div>
                        
                        <div class="timeline-body">
                            <div class="timeline-info">
                                <i class="fas fa-user-md"></i>
                                <strong>Dr. ${registro.veterinario}</strong>
                                <span> - ${registro.veterinaria}</span>
                            </div>
                            
                            <div class="timeline-diagnosis">
                                <strong>Diagnóstico:</strong> ${registro.diagnostico}
                            </div>
                            
                            ${registro.tratamiento ? `
                                <div class="timeline-treatment">
                                    <i class="fas fa-pills"></i> ${registro.tratamiento.substring(0, 100)}${registro.tratamiento.length > 100 ? '...' : ''}
                                </div>
                            ` : ''}
                            
                            <div class="timeline-meta">
                                ${registro.peso ? `<span><i class="fas fa-weight"></i> ${registro.peso} kg</span>` : ''}
                                ${registro.temperatura ? `<span><i class="fas fa-thermometer-half"></i> ${registro.temperatura}°C</span>` : ''}
                                ${registro.costo ? `<span><i class="fas fa-dollar-sign"></i> $${registro.costo}</span>` : ''}
                            </div>
                        </div>
                        
                        <div class="timeline-actions" onclick="event.stopPropagation()">
                            <button class="btn-icon-sm" onclick="editRegistro('${registro.id}')" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon-sm danger" onclick="deleteRegistro('${registro.id}')" title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // ===== ESTADÍSTICAS =====
    function updateStats() {
        const totalEl = document.getElementById('totalRegistros');
        const consultasEl = document.getElementById('totalConsultas');
        const mesEl = document.getElementById('ultimoMes');
        
        if (totalEl) totalEl.textContent = registros.length;
        
        const consultas = registros.filter(r => r.tipoConsulta === 'consulta').length;
        if (consultasEl) consultasEl.textContent = consultas;
        
        const haceUnMes = new Date();
        haceUnMes.setMonth(haceUnMes.getMonth() - 1);
        const ultimoMes = registros.filter(r => new Date(r.fecha) >= haceUnMes).length;
        if (mesEl) mesEl.textContent = ultimoMes;
    }
    
    // ===== ACCIONES =====
    window.editRegistro = function(registroId) {
        openModal(registroId);
    };
    
    window.deleteRegistro = function(registroId) {
        const registro = registros.find(r => r.id === registroId);
        if (!registro) return;
        
        if (confirm(`¿Eliminar el registro de ${registro.nombreMascota}?`)) {
            registros = registros.filter(r => r.id !== registroId);
            saveRegistros();
            renderTimeline();
            updateStats();
            showNotification('🗑️ Registro eliminado', 'info');
        }
    };
    
    window.showRegistroDetails = function(registroId) {
        const registro = registros.find(r => r.id === registroId);
        if (!registro || !detallesModal) return;
        
        const tipoNombres = {
            consulta: 'Consulta General',
            emergencia: 'Emergencia',
            cirugia: 'Cirugía',
            control: 'Control Post-operatorio',
            vacunacion: 'Vacunación',
            examenes: 'Exámenes/Análisis',
            dental: 'Tratamiento Dental',
            otro: 'Otro'
        };
        
        const detailsHTML = `
            <div class="detail-section">
                <h3>Información Básica</h3>
                <div class="detail-row">
                    <div class="detail-icon"><i class="fas fa-paw"></i></div>
                    <div class="detail-content">
                        <div class="detail-label">Mascota</div>
                        <div class="detail-value">${registro.nombreMascota}</div>
                    </div>
                </div>
                <div class="detail-row">
                    <div class="detail-icon"><i class="fas fa-calendar"></i></div>
                    <div class="detail-content">
                        <div class="detail-label">Fecha y Hora</div>
                        <div class="detail-value">${formatDateLong(registro.fecha)} - ${registro.hora}</div>
                    </div>
                </div>
                <div class="detail-row">
                    <div class="detail-icon"><i class="fas fa-user-md"></i></div>
                    <div class="detail-content">
                        <div class="detail-label">Veterinario</div>
                        <div class="detail-value">Dr. ${registro.veterinario}</div>
                    </div>
                </div>
                <div class="detail-row">
                    <div class="detail-icon"><i class="fas fa-hospital"></i></div>
                    <div class="detail-content">
                        <div class="detail-label">Clínica</div>
                        <div class="detail-value">${registro.veterinaria}</div>
                    </div>
                </div>
                <div class="detail-row">
                    <div class="detail-icon"><i class="fas fa-stethoscope"></i></div>
                    <div class="detail-content">
                        <div class="detail-label">Tipo</div>
                        <div class="detail-value">${tipoNombres[registro.tipoConsulta]}</div>
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h3>Motivo y Síntomas</h3>
                <div class="detail-block">
                    <strong>Motivo:</strong>
                    <p>${registro.motivo}</p>
                </div>
                ${registro.sintomas ? `
                    <div class="detail-block">
                        <strong>Síntomas:</strong>
                        <p>${registro.sintomas}</p>
                    </div>
                ` : ''}
            </div>
            
            <div class="detail-section">
                <h3>Diagnóstico y Tratamiento</h3>
                <div class="detail-block">
                    <strong>Diagnóstico:</strong>
                    <p>${registro.diagnostico}</p>
                </div>
                ${registro.tratamiento ? `
                    <div class="detail-block">
                        <strong>Tratamiento:</strong>
                        <p>${registro.tratamiento}</p>
                    </div>
                ` : ''}
                ${registro.examenes ? `
                    <div class="detail-block">
                        <strong>Exámenes Realizados:</strong>
                        <p>${registro.examenes}</p>
                    </div>
                ` : ''}
            </div>
            
            ${registro.peso || registro.temperatura ? `
                <div class="detail-section">
                    <h3>Datos Vitales</h3>
                    ${registro.peso ? `<p><i class="fas fa-weight"></i> Peso: ${registro.peso} kg</p>` : ''}
                    ${registro.temperatura ? `<p><i class="fas fa-thermometer-half"></i> Temperatura: ${registro.temperatura}°C</p>` : ''}
                    ${registro.proximaVisita ? `<p><i class="fas fa-calendar-plus"></i> Próxima visita: ${formatDateShort(registro.proximaVisita)}</p>` : ''}
                </div>
            ` : ''}
            
            ${registro.costo || registro.notas ? `
                <div class="detail-section">
                    <h3>Costos y Observaciones</h3>
                    ${registro.costo ? `<p><i class="fas fa-dollar-sign"></i> Costo: $${registro.costo} MXN</p>` : ''}
                    ${registro.notas ? `
                        <div class="detail-block">
                            <strong>Notas:</strong>
                            <p>${registro.notas}</p>
                        </div>
                    ` : ''}
                </div>
            ` : ''}
        `;
        
        const detailsContainer = document.getElementById('registroDetails');
        if (detailsContainer) {
            detailsContainer.innerHTML = detailsHTML;
        }
        
        const editBtn = document.getElementById('editDetailsBtn');
        const deleteBtn = document.getElementById('deleteDetailsBtn');
        
        if (editBtn) {
            editBtn.onclick = () => {
                closeDetallesModal();
                editRegistro(registroId);
            };
        }
        
        if (deleteBtn) {
            deleteBtn.onclick = () => {
                closeDetallesModal();
                deleteRegistro(registroId);
            };
        }
        
        detallesModal.classList.add('show');
    };
    
    // ===== UTILIDADES =====
    function formatDateShort(dateStr) {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    
    function formatDateLong(dateStr) {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
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
    
    // ===== INICIAR APLICACIÓN =====
    init();
    console.log('✅ Sistema de historial médico inicializado');
});