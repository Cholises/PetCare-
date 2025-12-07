// js/recordatorios.js - Sistema de Recordatorios

document.addEventListener('DOMContentLoaded', () => {
    console.log('🔔 Inicializando sistema de recordatorios...');
    
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
    let recordatorios = [];
    let mascotas = [];
    let editingRecordatorioId = null;
    let currentFilter = 'todos';
    let currentSort = 'fecha';
    
    // ===== ELEMENTOS DEL DOM =====
    const modal = document.getElementById('recordatorioModal');
    const detallesModal = document.getElementById('detallesModal');
    const recordatorioForm = document.getElementById('recordatorioForm');
    const recordatoriosList = document.getElementById('recordatoriosList');
    const emptyState = document.getElementById('emptyState');
    const esRecurrenteCheckbox = document.getElementById('esRecurrente');
    const recurrenciaGroup = document.getElementById('recurrenciaGroup');
    
    // ===== CARGAR DATOS =====
    function loadData() {
        // Cargar mascotas del usuario
        const todasMascotas = JSON.parse(localStorage.getItem('mascotas') || '[]');
        mascotas = todasMascotas.filter(m => m.dueño === currentUser.correo);
        
        console.log(`🐾 Mascotas del usuario: ${mascotas.length}`);
        
        // Cargar recordatorios
        const todosRecordatorios = JSON.parse(localStorage.getItem('recordatorios') || '[]');
        const mascotasIds = mascotas.map(m => m.id);
        recordatorios = todosRecordatorios.filter(r => mascotasIds.includes(r.mascotaId));
        
        console.log(`🔔 Recordatorios: ${recordatorios.length}`);
        
        // Verificar recordatorios vencidos y actualizarlos
        checkVencidos();
    }
    
    // ===== VERIFICAR VENCIDOS =====
    function checkVencidos() {
        const ahora = new Date();
        let cambios = false;
        
        recordatorios.forEach(rec => {
            if (rec.completado) return;
            
            const fechaHora = new Date(`${rec.fecha}T${rec.hora}`);
            if (fechaHora < ahora && rec.estado !== 'vencido') {
                rec.estado = 'vencido';
                cambios = true;
            }
        });
        
        if (cambios) {
            saveRecordatorios();
        }
    }
    
    // ===== GUARDAR RECORDATORIOS =====
    function saveRecordatorios() {
        const todosRecordatorios = JSON.parse(localStorage.getItem('recordatorios') || '[]');
        const mascotasIds = mascotas.map(m => m.id);
        const recordatoriosOtrosUsuarios = todosRecordatorios.filter(r => !mascotasIds.includes(r.mascotaId));
        const nuevosRecordatorios = [...recordatoriosOtrosUsuarios, ...recordatorios];
        localStorage.setItem('recordatorios', JSON.stringify(nuevosRecordatorios));
    }
    
    // ===== INICIALIZAR =====
    function init() {
        loadData();
        renderRecordatorios();
        updateStats();
        setupEventListeners();
    }
    
    // ===== EVENT LISTENERS =====
    function setupEventListeners() {
        // Botones agregar
        const addBtnNav = document.getElementById('addRecordatorioBtn');
        const addBtnEmpty = document.querySelector('.empty-state .btn-primary');
        
        if (addBtnNav) {
            addBtnNav.addEventListener('click', (e) => {
                e.preventDefault();
                openModal();
            });
        }
        
        if (addBtnEmpty) {
            addBtnEmpty.addEventListener('click', (e) => {
                e.preventDefault();
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
        if (recordatorioForm) {
            recordatorioForm.addEventListener('submit', handleSubmit);
        }
        
        // Checkbox recurrente
        if (esRecurrenteCheckbox && recurrenciaGroup) {
            esRecurrenteCheckbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    recurrenciaGroup.classList.remove('hidden');
                } else {
                    recurrenciaGroup.classList.add('hidden');
                }
            });
        }
        
        // Tabs de filtro
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                currentFilter = tab.dataset.filter;
                renderRecordatorios();
            });
        });
        
        // Select de ordenamiento
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                currentSort = e.target.value;
                renderRecordatorios();
            });
        }
    }
    
    // ===== MODAL =====
    function openModal(recordatorioId = null) {
        if (!modal) return;
        
        if (mascotas.length === 0) {
            showNotification('⚠️ Primero debes registrar una mascota', 'warning');
            setTimeout(() => {
                window.location.href = 'menu.html';
            }, 2000);
            return;
        }
        
        const modalTitle = document.getElementById('modalTitle');
        
        if (recordatorioId) {
            editingRecordatorioId = recordatorioId;
            loadRecordatorioData(recordatorioId);
            if (modalTitle) modalTitle.textContent = 'Editar Recordatorio';
        } else {
            editingRecordatorioId = null;
            if (recordatorioForm) recordatorioForm.reset();
            if (modalTitle) modalTitle.textContent = 'Nuevo Recordatorio';
            if (recurrenciaGroup) recurrenciaGroup.classList.add('hidden');
            
            // Fecha y hora actuales
            const now = new Date();
            const today = now.toISOString().split('T')[0];
            const time = now.toTimeString().slice(0, 5);
            
            const fechaInput = document.getElementById('fechaRecordatorio');
            const horaInput = document.getElementById('horaRecordatorio');
            if (fechaInput) fechaInput.value = today;
            if (horaInput) horaInput.value = time;
        }
        
        loadMascotaSelect();
        modal.classList.add('show');
    }
    
    function closeModal() {
        if (!modal) return;
        modal.classList.remove('show');
        if (recordatorioForm) recordatorioForm.reset();
        if (recurrenciaGroup) recurrenciaGroup.classList.add('hidden');
        editingRecordatorioId = null;
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
    }
    
    // ===== GUARDAR RECORDATORIO =====
    function handleSubmit(e) {
        e.preventDefault();
        
        const mascotaId = document.getElementById('mascotaSelect').value;
        const titulo = document.getElementById('titulo').value.trim();
        const tipo = document.getElementById('tipoRecordatorio').value;
        const descripcion = document.getElementById('descripcion').value.trim();
        const fecha = document.getElementById('fechaRecordatorio').value;
        const hora = document.getElementById('horaRecordatorio').value;
        const esRecurrente = document.getElementById('esRecurrente').checked;
        const frecuencia = document.getElementById('frecuencia').value;
        const prioridad = document.getElementById('prioridad').value;
        const anticipacion = document.getElementById('anticipacion').value;
        const notas = document.getElementById('notas').value.trim();
        
        // Validaciones
        if (!mascotaId || !titulo || !tipo || !fecha || !hora || !prioridad) {
            showNotification('⚠️ Completa todos los campos obligatorios', 'error');
            return;
        }
        
        const mascota = mascotas.find(m => m.id === mascotaId);
        if (!mascota) {
            showNotification('⚠️ Mascota no encontrada', 'error');
            return;
        }
        
        // Verificar si la fecha no está en el pasado
        const fechaHora = new Date(`${fecha}T${hora}`);
        const ahora = new Date();
        
        const recordatorioData = {
            mascotaId,
            nombreMascota: mascota.nombre,
            fotoMascota: mascota.foto,
            titulo,
            tipo,
            descripcion,
            fecha,
            hora,
            esRecurrente,
            frecuencia: esRecurrente ? frecuencia : null,
            prioridad,
            anticipacion: parseInt(anticipacion),
            notas,
            completado: false,
            estado: fechaHora < ahora ? 'vencido' : 'activo'
        };
        
        if (editingRecordatorioId) {
            updateRecordatorio(editingRecordatorioId, recordatorioData);
        } else {
            createRecordatorio(recordatorioData);
        }
    }
    
    // ===== CREAR RECORDATORIO =====
    function createRecordatorio(recordatorioData) {
        const nuevoRecordatorio = {
            id: 'recordatorio_' + Date.now(),
            ...recordatorioData,
            creado: new Date().toISOString()
        };
        
        recordatorios.push(nuevoRecordatorio);
        saveRecordatorios();
        
        console.log('✅ Recordatorio creado:', nuevoRecordatorio);
        showNotification(`✅ Recordatorio creado para ${recordatorioData.nombreMascota}`, 'success');
        
        closeModal();
        renderRecordatorios();
        updateStats();
    }
    
    // ===== ACTUALIZAR RECORDATORIO =====
    function updateRecordatorio(recordatorioId, recordatorioData) {
        const index = recordatorios.findIndex(r => r.id === recordatorioId);
        if (index === -1) {
            showNotification('⚠️ Recordatorio no encontrado', 'error');
            return;
        }
        
        recordatorios[index] = {
            ...recordatorios[index],
            ...recordatorioData,
            actualizado: new Date().toISOString()
        };
        
        saveRecordatorios();
        console.log('✅ Recordatorio actualizado:', recordatorios[index]);
        showNotification('✅ Recordatorio actualizado correctamente', 'success');
        
        closeModal();
        renderRecordatorios();
        updateStats();
    }
    
    // ===== CARGAR DATOS PARA EDITAR =====
    function loadRecordatorioData(recordatorioId) {
        const recordatorio = recordatorios.find(r => r.id === recordatorioId);
        if (!recordatorio) return;
        
        document.getElementById('mascotaSelect').value = recordatorio.mascotaId;
        document.getElementById('titulo').value = recordatorio.titulo;
        document.getElementById('tipoRecordatorio').value = recordatorio.tipo;
        document.getElementById('descripcion').value = recordatorio.descripcion || '';
        document.getElementById('fechaRecordatorio').value = recordatorio.fecha;
        document.getElementById('horaRecordatorio').value = recordatorio.hora;
        document.getElementById('esRecurrente').checked = recordatorio.esRecurrente;
        document.getElementById('frecuencia').value = recordatorio.frecuencia || 'mensual';
        document.getElementById('prioridad').value = recordatorio.prioridad;
        document.getElementById('anticipacion').value = recordatorio.anticipacion;
        document.getElementById('notas').value = recordatorio.notas || '';
        
        if (recordatorio.esRecurrente && recurrenciaGroup) {
            recurrenciaGroup.classList.remove('hidden');
        }
    }
    
    // ===== RENDERIZAR RECORDATORIOS =====
    function renderRecordatorios() {
        if (!recordatoriosList) return;
        
        let recordatoriosFiltrados = [...recordatorios];
        
        // Aplicar filtro
        switch (currentFilter) {
            case 'activos':
                recordatoriosFiltrados = recordatoriosFiltrados.filter(r => !r.completado && r.estado === 'activo');
                break;
            case 'proximos':
                const proximosDias = new Date();
                proximosDias.setDate(proximosDias.getDate() + 7);
                recordatoriosFiltrados = recordatoriosFiltrados.filter(r => {
                    const fechaRec = new Date(`${r.fecha}T${r.hora}`);
                    return !r.completado && fechaRec >= new Date() && fechaRec <= proximosDias;
                });
                break;
            case 'completados':
                recordatoriosFiltrados = recordatoriosFiltrados.filter(r => r.completado);
                break;
        }
        
        // Aplicar ordenamiento
        recordatoriosFiltrados.sort((a, b) => {
            switch (currentSort) {
                case 'fecha':
                    const dateA = new Date(`${a.fecha}T${a.hora}`);
                    const dateB = new Date(`${b.fecha}T${b.hora}`);
                    return dateA - dateB;
                case 'prioridad':
                    const prioridadOrden = { alta: 0, media: 1, baja: 2 };
                    return prioridadOrden[a.prioridad] - prioridadOrden[b.prioridad];
                case 'tipo':
                    return a.tipo.localeCompare(b.tipo);
                case 'mascota':
                    return a.nombreMascota.localeCompare(b.nombreMascota);
                default:
                    return 0;
            }
        });
        
        if (recordatoriosFiltrados.length === 0) {
            recordatoriosList.innerHTML = '';
            if (emptyState) emptyState.style.display = 'flex';
            return;
        }
        
        if (emptyState) emptyState.style.display = 'none';
        
        recordatoriosList.innerHTML = recordatoriosFiltrados.map(rec => {
            const tipoEmojis = {
                vacuna: '💉',
                medicamento: '💊',
                cita: '📅',
                desparasitacion: '🐛',
                baño: '🛁',
                comida: '🍖',
                ejercicio: '🏃',
                otro: '📝'
            };
            
            const prioridadClasses = {
                alta: 'priority-high',
                media: 'priority-medium',
                baja: 'priority-low'
            };
            
            const hasPhoto = rec.fotoMascota && (rec.fotoMascota.startsWith('data:') || rec.fotoMascota.startsWith('http'));
            const fechaHora = new Date(`${rec.fecha}T${rec.hora}`);
            const esHoy = isToday(fechaHora);
            const esVencido = rec.estado === 'vencido' && !rec.completado;
            
            return `
                <div class="recordatorio-card ${rec.completado ? 'completado' : ''} ${esVencido ? 'vencido' : ''} ${prioridadClasses[rec.prioridad]}" onclick="showRecordatorioDetails('${rec.id}')">
                    <div class="recordatorio-header">
                        <div class="recordatorio-pet">
                            ${hasPhoto 
                                ? `<img src="${rec.fotoMascota}" alt="${rec.nombreMascota}" class="pet-avatar">`
                                : `<div class="pet-avatar-placeholder">${rec.fotoMascota || '🐾'}</div>`
                            }
                            <div>
                                <h4>${rec.nombreMascota}</h4>
                                <span class="recordatorio-type">${tipoEmojis[rec.tipo]} ${rec.tipo}</span>
                            </div>
                        </div>
                        <div class="recordatorio-priority">
                            <i class="fas fa-flag"></i>
                        </div>
                    </div>
                    
                    <div class="recordatorio-body">
                        <h3 class="recordatorio-title">${rec.titulo}</h3>
                        ${rec.descripcion ? `<p class="recordatorio-desc">${rec.descripcion}</p>` : ''}
                        
                        <div class="recordatorio-datetime">
                            <div class="datetime-item">
                                <i class="fas fa-calendar"></i>
                                <span>${formatDateShort(rec.fecha)}</span>
                                ${esHoy ? '<span class="badge-today">HOY</span>' : ''}
                                ${esVencido ? '<span class="badge-vencido">VENCIDO</span>' : ''}
                            </div>
                            <div class="datetime-item">
                                <i class="fas fa-clock"></i>
                                <span>${rec.hora}</span>
                            </div>
                        </div>
                        
                        ${rec.esRecurrente ? `
                            <div class="recordatorio-recurrente">
                                <i class="fas fa-repeat"></i>
                                <span>Se repite ${rec.frecuencia}</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="recordatorio-actions" onclick="event.stopPropagation()">
                        ${!rec.completado ? `
                            <button class="btn-icon-sm success" onclick="marcarCompletado('${rec.id}')" title="Completar">
                                <i class="fas fa-check"></i>
                            </button>
                        ` : ''}
                        <button class="btn-icon-sm" onclick="editRecordatorio('${rec.id}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon-sm danger" onclick="deleteRecordatorio('${rec.id}')" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // ===== ESTADÍSTICAS =====
    function updateStats() {
        const activosEl = document.getElementById('totalActivos');
        const vencidosEl = document.getElementById('totalVencidos');
        const hoyEl = document.getElementById('totalHoy');
        
        const activos = recordatorios.filter(r => !r.completado && r.estado === 'activo').length;
        const vencidos = recordatorios.filter(r => !r.completado && r.estado === 'vencido').length;
        
        const hoy = recordatorios.filter(r => {
            const fechaRec = new Date(`${r.fecha}T${r.hora}`);
            return !r.completado && isToday(fechaRec);
        }).length;
        
        if (activosEl) activosEl.textContent = activos;
        if (vencidosEl) vencidosEl.textContent = vencidos;
        if (hoyEl) hoyEl.textContent = hoy;
    }
    
    // ===== ACCIONES =====
    window.editRecordatorio = function(recordatorioId) {
        openModal(recordatorioId);
    };
    
    window.deleteRecordatorio = function(recordatorioId) {
        const recordatorio = recordatorios.find(r => r.id === recordatorioId);
        if (!recordatorio) return;
        
        if (confirm(`¿Eliminar el recordatorio "${recordatorio.titulo}"?`)) {
            recordatorios = recordatorios.filter(r => r.id !== recordatorioId);
            saveRecordatorios();
            renderRecordatorios();
            updateStats();
            showNotification('🗑️ Recordatorio eliminado', 'info');
        }
    };
    
    window.marcarCompletado = function(recordatorioId) {
        const index = recordatorios.findIndex(r => r.id === recordatorioId);
        if (index === -1) return;
        
        recordatorios[index].completado = true;
        recordatorios[index].fechaCompletado = new Date().toISOString();
        
        // Si es recurrente, crear uno nuevo
        if (recordatorios[index].esRecurrente) {
            const nuevoRecordatorio = { ...recordatorios[index] };
            delete nuevoRecordatorio.completado;
            delete nuevoRecordatorio.fechaCompletado;
            nuevoRecordatorio.id = 'recordatorio_' + Date.now();
            
            // Calcular próxima fecha según frecuencia
            const fechaActual = new Date(nuevoRecordatorio.fecha);
            switch (nuevoRecordatorio.frecuencia) {
                case 'diario':
                    fechaActual.setDate(fechaActual.getDate() + 1);
                    break;
                case 'semanal':
                    fechaActual.setDate(fechaActual.getDate() + 7);
                    break;
                case 'mensual':
                    fechaActual.setMonth(fechaActual.getMonth() + 1);
                    break;
                case 'anual':
                    fechaActual.setFullYear(fechaActual.getFullYear() + 1);
                    break;
            }
            
            nuevoRecordatorio.fecha = fechaActual.toISOString().split('T')[0];
            nuevoRecordatorio.estado = 'activo';
            recordatorios.push(nuevoRecordatorio);
        }
        
        saveRecordatorios();
        renderRecordatorios();
        updateStats();
        showNotification('✅ Recordatorio completado', 'success');
    };
    
    window.showRecordatorioDetails = function(recordatorioId) {
        const recordatorio = recordatorios.find(r => r.id === recordatorioId);
        if (!recordatorio || !detallesModal) return;
        
        const tipoNombres = {
            vacuna: '💉 Vacuna',
            medicamento: '💊 Medicamento',
            cita: '📅 Cita Veterinaria',
            desparasitacion: '🐛 Desparasitación',
            baño: '🛁 Baño/Grooming',
            comida: '🍖 Comida/Dieta',
            ejercicio: '🏃 Ejercicio',
            otro: '📝 Otro'
        };
        
        const prioridadNombres = {
            alta: '🔴 Alta',
            media: '🟡 Media',
            baja: '🟢 Baja'
        };
        
        const anticipacionTexto = {
            0: 'En el momento',
            15: '15 minutos antes',
            30: '30 minutos antes',
            60: '1 hora antes',
            1440: '1 día antes',
            10080: '1 semana antes'
        };
        
        const detailsHTML = `
            <div class="detail-section">
                <h3>Información Básica</h3>
                <div class="detail-row">
                    <div class="detail-icon"><i class="fas fa-paw"></i></div>
                    <div class="detail-content">
                        <div class="detail-label">Mascota</div>
                        <div class="detail-value">${recordatorio.nombreMascota}</div>
                    </div>
                </div>
                <div class="detail-row">
                    <div class="detail-icon"><i class="fas fa-heading"></i></div>
                    <div class="detail-content">
                        <div class="detail-label">Título</div>
                        <div class="detail-value">${recordatorio.titulo}</div>
                    </div>
                </div>
                <div class="detail-row">
                    <div class="detail-icon"><i class="fas fa-tag"></i></div>
                    <div class="detail-content">
                        <div class="detail-label">Tipo</div>
                        <div class="detail-value">${tipoNombres[recordatorio.tipo]}</div>
                    </div>
                </div>
                ${recordatorio.descripcion ? `
                    <div class="detail-block">
                        <strong>Descripción:</strong>
                        <p>${recordatorio.descripcion}</p>
                    </div>
                ` : ''}
            </div>
            
            <div class="detail-section">
                <h3>Fecha y Hora</h3>
                <div class="detail-row">
                    <div class="detail-icon"><i class="fas fa-calendar"></i></div>
                    <div class="detail-content">
                        <div class="detail-label">Fecha</div>
                        <div class="detail-value">${formatDateLong(recordatorio.fecha)}</div>
                    </div>
                </div>
                <div class="detail-row">
                    <div class="detail-icon"><i class="fas fa-clock"></i></div>
                    <div class="detail-content">
                        <div class="detail-label">Hora</div>
                        <div class="detail-value">${recordatorio.hora}</div>
                    </div>
                </div>
                ${recordatorio.esRecurrente ? `
                    <div class="detail-row">
                        <div class="detail-icon"><i class="fas fa-repeat"></i></div>
                        <div class="detail-content">
                            <div class="detail-label">Recurrencia</div>
                            <div class="detail-value">Se repite ${recordatorio.frecuencia}</div>
                        </div>
                    </div>
                ` : ''}
            </div>
            
            <div class="detail-section">
                <h3>Configuración</h3>
                <div class="detail-row">
                    <div class="detail-icon"><i class="fas fa-flag"></i></div>
                    <div class="detail-content">
                        <div class="detail-label">Prioridad</div>
                        <div class="detail-value">${prioridadNombres[recordatorio.prioridad]}</div>
                    </div>
                </div>
                <div class="detail-row">
                    <div class="detail-icon"><i class="fas fa-bell"></i></div>
                    <div class="detail-content">
                        <div class="detail-label">Recordar</div>
                        <div class="detail-value">${anticipacionTexto[recordatorio.anticipacion]}</div>
                    </div>
                </div>
                <div class="detail-row">
                    <div class="detail-icon"><i class="fas fa-info-circle"></i></div>
                    <div class="detail-content">
                        <div class="detail-label">Estado</div>
                        <div class="detail-value">${recordatorio.completado ? '✅ Completado' : (recordatorio.estado === 'vencido' ? '⚠️ Vencido' : '🔔 Activo')}</div>
                    </div>
                </div>
                ${recordatorio.notas ? `
                    <div class="detail-block">
                        <strong>Notas:</strong>
                        <p>${recordatorio.notas}</p>
                    </div>
                ` : ''}
            </div>
            
            ${recordatorio.completado ? `
                <div class="detail-section">
                    <h3>Completado</h3>
                    <p><i class="fas fa-check-circle"></i> ${formatDateLong(recordatorio.fechaCompletado.split('T')[0])}</p>
                </div>
            ` : ''}
        `;
        
        const detailsContainer = document.getElementById('recordatorioDetails');
        if (detailsContainer) {
            detailsContainer.innerHTML = detailsHTML;
        }
        
        const completarBtn = document.getElementById('marcarCompletadoBtn');
        const editBtn = document.getElementById('editDetailsBtn');
        const deleteBtn = document.getElementById('deleteDetailsBtn');
        
        if (completarBtn) {
            if (recordatorio.completado) {
                completarBtn.style.display = 'none';
            } else {
                completarBtn.style.display = 'flex';
                completarBtn.onclick = () => {
                    closeDetallesModal();
                    marcarCompletado(recordatorioId);
                };
            }
        }
        
        if (editBtn) {
            editBtn.onclick = () => {
                closeDetallesModal();
                editRecordatorio(recordatorioId);
            };
        }
        
        if (deleteBtn) {
            deleteBtn.onclick = () => {
                closeDetallesModal();
                deleteRecordatorio(recordatorioId);
            };
        }
        
        detallesModal.classList.add('show');
    };
    
    // ===== UTILIDADES =====
    function isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    }
    
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
    console.log('✅ Sistema de recordatorios inicializado');
});