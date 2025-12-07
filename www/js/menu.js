// js/menu.js - Sistema de gestión de mascotas (VERSIÓN CORREGIDA)

document.addEventListener("DOMContentLoaded", () => {
  console.log("🐾 Inicializando sistema de mascotas...");

  // ===== VERIFICAR SESIÓN PRIMERO =====
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    console.warn("⚠️ No hay usuario logueado");
    alert("⚠️ Debes iniciar sesión primero");
    window.location.href = "login.html";
    return;
  }

  console.log("✅ Usuario logueado:", currentUser.nombre);

  // ===== ELEMENTOS DEL DOM =====
  const modal = document.getElementById("petModal");
  const petForm = document.getElementById("petForm");
  const emptyStateBtn = document.getElementById("emptyStateBtn");
  const quickAddBtn = document.getElementById("quickAddBtn");
  const petsList = document.getElementById("petsList");
  const emptyState = document.getElementById("emptyState");
  const petsCounter = document.getElementById("petsCounter");
  const totalPets = document.getElementById("totalPets");
  const addMoreBtn = document.getElementById("addMoreBtn");
  
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

  console.log("✅ Elementos del DOM cargados correctamente");

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
    console.log("✅ Modal abierto");
  }

  function closeModal() {
    if (!modal) return;
    
    modal.classList.remove("active");
    document.body.style.overflow = "";
    if (petForm) petForm.reset();
    resetPhotoPreview();
    editingPetId = null;
    console.log("✅ Modal cerrado");
  }

  // ===== EVENT LISTENERS PARA ABRIR/CERRAR MODAL =====
  
  // Botón del estado vacío
  if (emptyStateBtn) {
    emptyStateBtn.addEventListener("click", () => {
      console.log("🖱️ Click en emptyStateBtn");
      openModal();
    });
  }

  // Botón de agregar rápido (header)
  if (quickAddBtn) {
    quickAddBtn.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("🖱️ Click en quickAddBtn");
      openModal();
    });
  }

  // Botón para agregar más mascotas
  if (addMoreBtn) {
    addMoreBtn.addEventListener("click", () => {
      console.log("🖱️ Click en addMoreBtn");
      openModal();
    });
  }

  // 🔧 CORRECCIÓN: Event listener para botón X (cerrar)
  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("🖱️ Click en botón X (cerrar)");
      closeModal();
    });
    console.log("✅ Botón de cerrar (X) conectado");
  } else {
    console.warn("⚠️ No se encontró el botón de cerrar modal");
  }

  // 🔧 CORRECCIÓN: Event listener para botón Cancelar
  if (cancelBtn) {
    cancelBtn.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("🖱️ Click en Cancelar");
      closeModal();
    });
    console.log("✅ Botón Cancelar conectado");
  }

  // Cerrar modal al hacer clic fuera (en el overlay)
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        console.log("🖱️ Click fuera del modal");
        closeModal();
      }
    });
  }

  // Cerrar con tecla ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && modal.classList.contains("active")) {
      console.log("⌨️ Tecla ESC presionada");
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
        dueño: currentUser.correo
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

    console.log("✅ Mascota creada:", mascota);
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
    console.log("✅ Mascota actualizada:", mascotas[index]);
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
    const userPets = mascotas.filter(pet => pet.dueño === currentUser.correo);

    console.log(`📊 Mascotas del usuario: ${userPets.length}`);

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
        console.log("🖱️ Editando mascota:", petId);
        openModal(petId);
      });
    });

    document.querySelectorAll(".delete-pet").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const petId = e.target.closest("button").dataset.id;
        console.log("🖱️ Eliminando mascota:", petId);
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
      console.log("🗑️ Mascota eliminada:", pet.nombre);
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
  console.log("🚀 Cargando mascotas...");
  loadPets();
});