// js/menu.js - Sistema de gestión de mascotas (VERSIÓN CORREGIDA)

document.addEventListener("DOMContentLoaded", () => {
  

  // ===== VERIFICAR SESIÓN PRIMERO =====
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const userSession = JSON.parse(localStorage.getItem("userSession") || "null");
  
  // Validar que tanto currentUser como userSession existan y sean válidos
  if (!currentUser || !userSession || !userSession.sessionActive) {
    console.warn("⚠️ No hay sesión activa");
    alert("⚠️ Tu sesión ha expirado. Por favor inicia sesión nuevamente");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userSession");
    window.location.href = "login.html";
    return;
  }

  

  // Email del usuario (compatibilidad con campos `correo` y `email`)
  const correoUsuario = currentUser.correo || currentUser.email || null;

  // ===== ELEMENTOS DEL DOM =====
  const modal = document.getElementById("petModal");
  const petForm = document.getElementById("petForm");
  const emptyStateBtn = document.getElementById("emptyStateBtn");
  const quickAddBtn = document.getElementById("quickAddBtn");
  const petsList = document.getElementById("petsList");
  const emptyState = document.getElementById("emptyState");
  const petsCounter = document.getElementById("petsCounter");
  const totalPets = document.getElementById("totalPets");
  const pendingVaccines = document.getElementById("pendingVaccines");
  const upcomingAppointments = document.getElementById("upcomingAppointments");
  const addMoreBtn = document.getElementById("addMoreBtn");
  
  const notificationBtn = document.getElementById("notificationBtn");
  const notificationBadge = document.querySelector(".notification-badge");
  // 🔧 CORRECCIÓN: Buscar botones de cerrar con diferentes IDs posibles
  const closeModalBtn = document.getElementById("closeModalBtn") || 
                        document.getElementById("closeModal") ||
                        document.querySelector(".close-modal") ||
                        document.querySelector(".btn-close");
  
  const cancelBtn = document.getElementById("cancelBtn") || 
                    document.getElementById("cancelButton") ||
                    document.querySelector(".btn-secondary");
  
  // Elementos del formulario
  const photoInput = document.getElementById("petPhoto");
  const photoPreview = document.getElementById("photoPreview");
  const previewImage = document.getElementById("previewImage");
  const removePhotoBtn = document.getElementById("removePhoto");
  const notesTextarea = document.getElementById("petNotes");
  const notesCounter = document.getElementById("notesCounter");
  const modalTitle = document.getElementById("modalTitle");
  const submitBtnText = document.getElementById("submitBtnText");

  // Verificar elementos críticos
  if (!modal) {
    console.error("❌ No se encontró el modal con ID 'petModal'");
    alert("Error: El modal no está configurado correctamente. Revisa el HTML.");
    return;
  }

  if (!petForm) {
    console.error("❌ No se encontró el formulario con ID 'petForm'");
    return;
  }

  

  // Variable para modo edición
  let editingPetId = null;

  // Mostrar nombre de usuario
  const userNameElement = document.getElementById("userName");
  if (userNameElement) {
    userNameElement.textContent = currentUser.nombre || "Usuario";
  }

  // ===== FUNCIONES DEL MODAL =====
  function openModal(petId = null) {
    if (!modal) return;

    if (petId) {
      // Modo edición
      editingPetId = petId;
      loadPetData(petId);
      if (modalTitle) modalTitle.textContent = "Editar Mascota";
      if (submitBtnText) submitBtnText.textContent = "Actualizar Mascota";
    } else {
      // Modo creación
      editingPetId = null;
      if (petForm) petForm.reset();
      resetPhotoPreview();
      if (modalTitle) modalTitle.textContent = "Agregar Mascota";
      if (submitBtnText) submitBtnText.textContent = "Guardar Mascota";
    }
    
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    if (!modal) return;
    
    modal.classList.remove("active");
    document.body.style.overflow = "";
    if (petForm) petForm.reset();
    resetPhotoPreview();
    editingPetId = null;
  }

  // ===== EVENT LISTENERS PARA ABRIR/CERRAR MODAL =====
  
  // Botón del estado vacío
  if (emptyStateBtn) {
      emptyStateBtn.addEventListener("click", () => {
      openModal();
    });
  }

  // Botón de agregar rápido (header)
  if (quickAddBtn) {
    quickAddBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openModal();
    });
  }

  // Botón para agregar más mascotas
  if (addMoreBtn) {
    addMoreBtn.addEventListener("click", () => {
      openModal();
    });
  }

  // 🔧 CORRECCIÓN: Event listener para botón X (cerrar)
  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", (e) => {
      e.preventDefault();
      closeModal();
    });
  } else {
    console.warn("⚠️ No se encontró el botón de cerrar modal");
  }

  // 🔧 CORRECCIÓN: Event listener para botón Cancelar
  if (cancelBtn) {
    cancelBtn.addEventListener("click", (e) => {
      e.preventDefault();
      closeModal();
    });
  }

  // Cerrar modal al hacer clic fuera (en el overlay)
  if (modal) {
      modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  // Cerrar con tecla ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && modal.classList.contains("active")) {
      closeModal();
    }
  });

  // ===== PREVIEW DE FOTO =====
  if (photoInput) {
    photoInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        // Validar tamaño (máx 5MB)
        if (file.size > 5 * 1024 * 1024) {
          showNotification("⚠️ La imagen es muy grande. Máximo 5MB", "error");
          photoInput.value = "";
          return;
        }

        // Validar tipo
        if (!file.type.startsWith("image/")) {
          showNotification("⚠️ Solo se permiten imágenes", "error");
          photoInput.value = "";
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          if (previewImage) previewImage.src = event.target.result;
          if (photoPreview) photoPreview.classList.remove("hidden");
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (removePhotoBtn) {
    removePhotoBtn.addEventListener("click", (e) => {
      e.preventDefault();
      resetPhotoPreview();
    });
  }

  function resetPhotoPreview() {
    if (photoInput) photoInput.value = "";
    if (previewImage) previewImage.src = "";
    if (photoPreview) photoPreview.classList.add("hidden");
  }

  // ===== CONTADOR DE CARACTERES =====
  if (notesTextarea && notesCounter) {
    notesTextarea.addEventListener("input", (e) => {
      const length = e.target.value.length;
      notesCounter.textContent = `${length}/500`;
      if (length > 450) {
        notesCounter.style.color = "#ef4444";
      } else {
        notesCounter.style.color = "#999";
      }
    });
  }

  // ===== GUARDAR/ACTUALIZAR MASCOTA =====
  if (petForm) {
    petForm.addEventListener("submit", (e) => {
      e.preventDefault();

      // Validar campos requeridos
      const nombreInput = document.getElementById("petName");
      const tipoInput = document.getElementById("petType");
      
      if (!nombreInput || !tipoInput) {
        showNotification("⚠️ Error en el formulario", "error");
        return;
      }

      const nombre = nombreInput.value.trim();
      const tipo = tipoInput.value;
      
      if (!nombre || !tipo) {
        showNotification("⚠️ Por favor completa los campos obligatorios", "error");
        return;
      }

      // Crear objeto mascota
      const razaInput = document.getElementById("petBreed");
      const edadInput = document.getElementById("petAge");
      const pesoInput = document.getElementById("petWeight");
      const generoInput = document.getElementById("petGender");
      const colorInput = document.getElementById("petColor");
      const notasInput = document.getElementById("petNotes");

      const mascotaData = {
        nombre: nombre,
        tipo: tipo,
        raza: razaInput ? razaInput.value.trim() || "No especificada" : "No especificada",
        edad: edadInput ? edadInput.value : "",
        peso: pesoInput ? pesoInput.value : "",
        genero: generoInput ? generoInput.value || "No especificado" : "No especificado",
        color: colorInput ? colorInput.value.trim() : "",
        foto: (previewImage && previewImage.src) ? previewImage.src : getDefaultPetIcon(tipo),
        notas: notasInput ? notasInput.value.trim() : "",
        dueño: correoUsuario,
        owner: correoUsuario
      };

      if (editingPetId) {
        updatePet(editingPetId, mascotaData);
      } else {
        createPet(mascotaData);
      }
    });
  }

  // ===== CREAR MASCOTA =====
  function createPet(mascotaData) {
    const mascota = {
      id: "pet_" + Date.now(),
      ...mascotaData,
      creado: new Date().toISOString()
    };

    const mascotas = JSON.parse(localStorage.getItem("mascotas") || "[]");
    mascotas.push(mascota);
    localStorage.setItem("mascotas", JSON.stringify(mascotas));

    
    showNotification(`🎉 ¡${mascota.nombre} fue agregado exitosamente!`, "success");
    closeModal();
    loadPets();
  }

  // ===== ACTUALIZAR MASCOTA =====
  function updatePet(petId, mascotaData) {
    const mascotas = JSON.parse(localStorage.getItem("mascotas") || "[]");
    const index = mascotas.findIndex(p => p.id === petId);
    
    if (index === -1) {
      showNotification("⚠️ Mascota no encontrada", "error");
      return;
    }

    mascotas[index] = {
      ...mascotas[index],
      ...mascotaData,
      actualizado: new Date().toISOString()
    };

    localStorage.setItem("mascotas", JSON.stringify(mascotas));
    
    showNotification(`✅ ${mascotaData.nombre} fue actualizado exitosamente`, "success");
    
    closeModal();
    loadPets();
  }

  // ===== CARGAR DATOS PARA EDITAR =====
  function loadPetData(petId) {
    const mascotas = JSON.parse(localStorage.getItem("mascotas") || "[]");
    const pet = mascotas.find(p => p.id === petId);
    
    if (!pet) return;

    // Llenar el formulario de forma segura
    const setInputValue = (id, value) => {
      const element = document.getElementById(id);
      if (element) element.value = value || "";
    };

    setInputValue("petName", pet.nombre);
    setInputValue("petType", pet.tipo);
    setInputValue("petBreed", pet.raza !== "No especificada" ? pet.raza : "");
    setInputValue("petAge", pet.edad);
    setInputValue("petWeight", pet.peso);
    setInputValue("petGender", pet.genero !== "No especificado" ? pet.genero : "");
    setInputValue("petColor", pet.color);
    setInputValue("petNotes", pet.notas);

    // Actualizar contador de caracteres
    if (notesCounter) {
      notesCounter.textContent = `${pet.notas?.length || 0}/500`;
    }

    // Mostrar foto si existe y no es emoji
    if (pet.foto && (pet.foto.startsWith('data:') || pet.foto.startsWith('http'))) {
      if (previewImage) previewImage.src = pet.foto;
      if (photoPreview) photoPreview.classList.remove("hidden");
    }
  }

  // ===== CARGAR MASCOTAS =====
  function loadPets() {
    const mascotas = JSON.parse(localStorage.getItem("mascotas") || "[]");
    const userPets = mascotas.filter(pet =>
      pet.dueño === correoUsuario || pet.owner === correoUsuario || pet.userId === currentUser.id
    );

    

    // Actualizar contadores
    const count = userPets.length;
    if (petsCounter) petsCounter.textContent = count;
    if (totalPets) totalPets.textContent = count;

    // Mostrar/ocultar estado vacío
    if (count === 0) {
      if (emptyState) emptyState.classList.remove("hidden");
      if (petsList) petsList.classList.add("hidden");
      if (addMoreBtn) addMoreBtn.classList.add("hidden");
    } else {
      if (emptyState) emptyState.classList.add("hidden");
      if (petsList) {
        petsList.classList.remove("hidden");
        renderPets(userPets);
      }
      if (addMoreBtn) addMoreBtn.classList.remove("hidden");
    }
  }

  // ===== RENDERIZAR MASCOTAS =====
  function renderPets(pets) {
    if (!petsList) return;

    petsList.innerHTML = pets.map(pet => {
      const hasPhoto = pet.foto && (pet.foto.startsWith('data:') || pet.foto.startsWith('http'));
      
      return `
        <div class="pet-card" data-pet-id="${pet.id}">
          <div class="pet-card-header">
            <div class="pet-photo">
              ${hasPhoto 
                ? `<img src="${pet.foto}" alt="${pet.nombre}">` 
                : `<div class="pet-icon">${pet.foto || getDefaultPetIcon(pet.tipo)}</div>`
              }
            </div>
            <div class="pet-info">
              <h3 class="pet-name">${pet.nombre}</h3>
              <span class="pet-type">${getPetTypeName(pet.tipo)}</span>
            </div>
            <div class="pet-actions">
              <button class="btn-icon edit-pet" data-id="${pet.id}" title="Editar">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn-icon delete-pet" data-id="${pet.id}" title="Eliminar">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          <div class="pet-details">
            ${pet.raza && pet.raza !== "No especificada" 
              ? `<div class="detail-item"><i class="fas fa-dna"></i> ${pet.raza}</div>` 
              : ""
            }
            ${pet.edad 
              ? `<div class="detail-item"><i class="fas fa-birthday-cake"></i> ${pet.edad} años</div>` 
              : ""
            }
            ${pet.peso 
              ? `<div class="detail-item"><i class="fas fa-weight"></i> ${pet.peso} kg</div>` 
              : ""
            }
            ${pet.genero && pet.genero !== "No especificado" 
              ? `<div class="detail-item"><i class="fas fa-venus-mars"></i> ${pet.genero}</div>` 
              : ""
            }
            ${pet.color 
              ? `<div class="detail-item"><i class="fas fa-palette"></i> ${pet.color}</div>` 
              : ""
            }
          </div>
        </div>
      `;
    }).join("");

    // Agregar event listeners
    document.querySelectorAll(".edit-pet").forEach(btn => {
        btn.addEventListener("click", (e) => {
        const petId = e.target.closest("button").dataset.id;
        openModal(petId);
      });
    });

    document.querySelectorAll(".delete-pet").forEach(btn => {
        btn.addEventListener("click", (e) => {
        const petId = e.target.closest("button").dataset.id;
        deletePet(petId);
      });
    });
  }

  // ===== ELIMINAR MASCOTA =====
  function deletePet(petId) {
    const mascotas = JSON.parse(localStorage.getItem("mascotas") || "[]");
    const pet = mascotas.find(p => p.id === petId);
    
    if (!pet) return;

    const confirmed = confirm(
      `¿Estás seguro de eliminar a ${pet.nombre}?\n\n` +
      `Esta acción no se puede deshacer.`
    );

    if (confirmed) {
      const newMascotas = mascotas.filter(p => p.id !== petId);
      localStorage.setItem("mascotas", JSON.stringify(newMascotas));
      
      showNotification(`🗑️ ${pet.nombre} fue eliminado`, "info");
      loadPets();
    }
  }

  // ===== FUNCIONES AUXILIARES =====
  function getDefaultPetIcon(tipo) {
    const icons = {
      perro: "🐕",
      gato: "🐱",
      ave: "🦜",
      conejo: "🐰",
      hamster: "🐹",
      pez: "🐠",
      reptil: "🦎",
      otro: "🐾"
    };
    return icons[tipo] || "🐾";
  }

  function getPetTypeName(tipo) {
    const nombres = {
      perro: "Perro",
      gato: "Gato",
      ave: "Ave",
      conejo: "Conejo",
      hamster: "Hámster",
      pez: "Pez",
      reptil: "Reptil",
      otro: "Otro"
    };
    return nombres[tipo] || tipo;
  }

  function showNotification(message, type = "info") {
    // Remover notificaciones anteriores
    document.querySelectorAll(".notification").forEach(n => n.remove());

    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add("show"), 100);
    
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => notification.remove(), 300);
    }, 3500);
  }

  // ===== INICIALIZAR =====
  
  loadPets();
  // Cargar eventos próximos para el usuario
  loadUpcomingEvents();
  // Inicializar notificaciones
  initNotifications();
});

// ===== FUNCIONES DE EVENTOS PRÓXIMOS =====
function getAllUpcomingEvents() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
  const correoUsuario = currentUser.correo || currentUser.email || null;

  // Obtener mascotas del usuario
  const todasMascotas = JSON.parse(localStorage.getItem('mascotas') || '[]');
  const userPets = todasMascotas.filter(p =>
    p.dueño === correoUsuario || p.owner === correoUsuario || p.userId === currentUser.id
  );
  const userPetIds = userPets.map(p => p.id);

  // Cargar citas
  const todasCitas = JSON.parse(localStorage.getItem('citas') || '[]');
  const now = new Date();
  const upcomingCitas = todasCitas
    .filter(c => userPetIds.includes(c.mascotaId))
    .map(c => ({
      type: 'cita',
      id: c.id,
      title: c.nombreMascota || 'Cita',
      subtitle: c.tipo || '',
      date: c.fecha,
      time: c.hora,
      datetime: new Date(`${c.fecha}T${c.hora}`),
      raw: c
    }))
    .filter(e => !isNaN(e.datetime) && e.datetime >= now);

  // Cargar vacunas próximas (nextDoseDate)
  const todasVacunas = JSON.parse(localStorage.getItem('vacunas') || '[]');
  const upcomingVacunas = todasVacunas
    .filter(v => (v.userId === correoUsuario) || userPetIds.includes(v.petId))
    .map(v => ({
      type: 'vacuna',
      id: v.id,
      title: v.vaccineName || 'Vacuna',
      subtitle: (v.petId ? (userPets.find(p=>p.id===v.petId)?.nombre || '') : ''),
      date: v.nextDoseDate || v.applicationDate,
      time: '00:00',
      datetime: v.nextDoseDate ? new Date(v.nextDoseDate) : (v.applicationDate ? new Date(v.applicationDate) : null),
      raw: v
    }))
    .filter(e => e.datetime && !isNaN(e.datetime) && e.datetime >= now);

  // Cargar recordatorios próximos
  const todosRecordatorios = JSON.parse(localStorage.getItem('recordatorios') || '[]');
  const upcomingRecordatorios = todosRecordatorios
    .filter(r => userPetIds.includes(r.mascotaId))
    .map(r => ({
      type: 'recordatorio',
      id: r.id,
      title: userPets.find(p=>p.id===r.mascotaId)?.nombre || 'Recordatorio',
      subtitle: r.titulo || r.motivo || '',
      date: r.fecha,
      time: r.hora || '00:00',
      datetime: new Date(`${r.fecha}T${r.hora || '00:00'}`),
      raw: r
    }))
    .filter(e => !isNaN(e.datetime) && e.datetime >= now && !e.raw.completado);

  // Cargar registros médicos futuros
  const todosRegistros = JSON.parse(localStorage.getItem('historialMedico') || '[]');
  const upcomingHistorial = todosRegistros
    .filter(r => userPetIds.includes(r.mascotaId) && r.fecha)
    .map(r => {
      const fechaRegistro = r.fecha && r.hora ? new Date(`${r.fecha}T${r.hora}`) : (r.fecha ? new Date(r.fecha) : null);
      return {
        type: 'historial',
        id: r.id,
        title: r.titulo || r.motivo || r.tipo || 'Registro médico',
        subtitle: r.tipo || '',
        date: r.fecha,
        time: r.hora || '00:00',
        datetime: fechaRegistro,
        raw: r
      };
    })
    .filter(e => e.datetime && !isNaN(e.datetime) && e.datetime >= now);

  // Unir y ordenar todos los eventos futuros
  const allEvents = [...upcomingCitas, ...upcomingVacunas, ...upcomingRecordatorios, ...upcomingHistorial]
    .sort((a,b) => a.datetime - b.datetime);

  // Retornar estructura útil
  return { allEvents, upcomingVacunas, userPets };
}

function loadUpcomingEvents() {
  try {
    const eventsListEl = document.getElementById('eventsList');
    const pendingVaccinesEl = document.getElementById('pendingVaccines');
    const upcomingAppointmentsEl = document.getElementById('upcomingAppointments');

    const { allEvents, upcomingVacunas } = getAllUpcomingEvents();

    // Actualizar contadores
    if (pendingVaccinesEl) pendingVaccinesEl.textContent = upcomingVacunas.length;
    if (upcomingAppointmentsEl) upcomingAppointmentsEl.textContent = allEvents.length;

    // Renderizar lista (máx 5)
    if (!eventsListEl) return;
    if (allEvents.length === 0) {
      eventsListEl.innerHTML = `<div style="padding:20px;color:#666;text-align:center;">No hay eventos próximos</div>`;
      updateNotificationBadge(allEvents);
      return;
    }

    const itemsToShow = allEvents.slice(0,5);
    eventsListEl.innerHTML = itemsToShow.map(ev => {
      const dateStr = formatEventDate(ev.datetime);
      const icon = ev.type === 'cita' ? '<i class="fas fa-calendar-check"></i>' : (ev.type === 'vacuna' ? '<i class="fas fa-syringe"></i>' : '<i class="fas fa-bell"></i>');
      // Construir enlace a la página de citas. Incluye fecha y, si existe, id y tipo.
      const href = `citas.html?date=${encodeURIComponent(ev.date)}&type=${encodeURIComponent(ev.type)}${ev.id ? `&id=${encodeURIComponent(ev.id)}` : ''}`;
      return `
        <a class="event-card" href="${href}">
          <div class="event-date">${dateStr}</div>
          <div class="event-info">
            <div class="event-title">${icon} ${ev.title}</div>
            <div class="event-sub">${ev.subtitle}</div>
          </div>
        </a>
      `;
    }).join('');

    // Actualizar contador de notificaciones
    updateNotificationBadge(allEvents);

  } catch (err) {
    console.error('Error cargando eventos próximos', err);
  }
}

// ===== Notificaciones: panel y contador =====
function initNotifications() {
  if (!notificationBtn) return;
  notificationBtn.addEventListener('click', (e) => {
    e.preventDefault();
    toggleNotificationPanel();
  });

  // Cerrar panel al hacer click fuera
  document.addEventListener('click', (e) => {
    const panel = document.getElementById('notificationPanel');
    if (!panel) return;
    if (!panel.contains(e.target) && !notificationBtn.contains(e.target)) {
      panel.remove();
    }
  });

  // Actualizar badge inicialmente
  const { allEvents } = getAllUpcomingEvents();
  updateNotificationBadge(allEvents);
}

function updateNotificationBadge(allEvents) {
  try {
    if (!notificationBadge) return;
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
    const correoUsuario = currentUser.correo || currentUser.email || null;
    const key = `lastNotificationsRead_${correoUsuario || 'guest'}`;
    const lastRead = parseInt(localStorage.getItem(key) || '0', 10);

    const unread = allEvents ? allEvents.filter(ev => ev.datetime.getTime() > (lastRead || 0)).length : 0;

    if (unread > 0) {
      notificationBadge.textContent = unread;
      // use flex to match CSS alignment
      notificationBadge.style.display = 'flex';
    } else {
      notificationBadge.textContent = '';
      notificationBadge.style.display = 'none';
    }
  } catch (e) {
    // silent
  }
}

function toggleNotificationPanel() {
  const existing = document.getElementById('notificationPanel');
  if (existing) { existing.remove(); return; }

  const { allEvents } = getAllUpcomingEvents();
  renderNotificationPanel(allEvents);
  // Marcar como leídas al abrir
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
  const correoUsuario = currentUser.correo || currentUser.email || null;
  const key = `lastNotificationsRead_${correoUsuario || 'guest'}`;
  localStorage.setItem(key, String(Date.now()));
  updateNotificationBadge(allEvents);
}

function renderNotificationPanel(allEvents) {
  const panel = document.createElement('div');
  panel.id = 'notificationPanel';
  panel.className = 'notification-panel';
  panel.style.position = 'absolute';
  panel.style.right = '16px';
  panel.style.top = '64px';
  panel.style.width = '320px';
  panel.style.maxHeight = '60vh';
  panel.style.overflow = 'auto';
  panel.style.background = '#fff';
  panel.style.boxShadow = '0 6px 18px rgba(0,0,0,0.12)';
  panel.style.borderRadius = '10px';
  panel.style.zIndex = '9999';
  panel.style.padding = '8px';

  if (!allEvents || allEvents.length === 0) {
    panel.innerHTML = `<div style="padding:16px;color:#666;text-align:center;">No hay notificaciones</div>`;
    document.body.appendChild(panel);
    return;
  }

  const items = allEvents.slice(0,10).map(ev => {
    const dateStr = formatEventDate(ev.datetime);
    const icon = ev.type === 'cita' ? '<i class="fas fa-calendar-check"></i>' : (ev.type === 'vacuna' ? '<i class="fas fa-syringe"></i>' : '<i class="fas fa-bell"></i>');
    const href = `citas.html?date=${encodeURIComponent(ev.date)}&type=${encodeURIComponent(ev.type)}${ev.id ? `&id=${encodeURIComponent(ev.id)}` : ''}`;
    return `
      <a class="notification-item" href="${href}" style="display:flex;gap:10px;padding:10px;border-radius:8px;text-decoration:none;color:inherit;align-items:center;border:1px solid rgba(0,0,0,0.04);margin-bottom:6px;">
        <div style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;background:#f5f5f6;border-radius:8px;">${icon}</div>
        <div style="flex:1;">
          <div style="font-weight:600">${ev.title}</div>
          <div style="font-size:12px;color:#666">${ev.subtitle} · ${dateStr}</div>
        </div>
      </a>
    `;
  }).join('');

  panel.innerHTML = `<div style="padding:8px 12px;border-bottom:1px solid rgba(0,0,0,0.06);font-weight:700">Notificaciones</div><div style="padding:8px;">${items}</div>`;
  document.body.appendChild(panel);
}

function formatEventDate(d) {
  try {
    const opts = { day: '2-digit', month: 'short' };
    return d.toLocaleDateString('es-ES', opts);
  } catch (e) {
    return '';
  }
}