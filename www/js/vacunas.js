
// js/vacunas.js - Sistema de control de vacunas

document.addEventListener("DOMContentLoaded", () => {
  

  // Verificar sesión
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    alert("⚠️ Debes iniciar sesión primero");
    window.location.href = "login.html";
    return;
  }

  // Elementos del DOM
  const modal = document.getElementById("vaccineModal");
  const closeModalBtn = document.getElementById("closeModal");
  const cancelBtn = document.getElementById("cancelBtn");
  const vaccineForm = document.getElementById("vaccineForm");
  const btnAddVaccine = document.getElementById("btnAddVaccine");
  const btnAddVaccineEmpty = document.getElementById("btnAddVaccineEmpty");
  const quickAddBtn = document.getElementById("quickAddBtn"); // ← NUEVO
  const petSelector = document.getElementById("petSelector");
  const vaccinePetSelect = document.getElementById("vaccinePet");
  const vaccineNameSelect = document.getElementById("vaccineName");
  const customNameGroup = document.getElementById("customNameGroup");
  const notesTextarea = document.getElementById("vaccineNotes");
  const notesCounter = document.getElementById("notesCounter");
  
  const emptyState = document.getElementById("emptyState");
  const vaccinesContainer = document.getElementById("vaccinesContainer");
  const vaccinesList = document.getElementById("vaccinesList");
  const vaccinesCount = document.getElementById("vaccinesCount");
  const upcomingVaccines = document.getElementById("upcomingVaccines");
  const upcomingList = document.getElementById("upcomingList");

  let editingVaccineId = null;

  // Email del usuario (compatibilidad `correo` / `email`)
  const correoUsuario = currentUser.correo || currentUser.email || null;

  // ===== CARGAR MASCOTAS EN SELECTORES =====
  function loadPets() {
    const mascotas = JSON.parse(localStorage.getItem("mascotas") || "[]");
    const userPets = mascotas.filter(pet =>
      pet.dueño === correoUsuario || pet.owner === correoUsuario || pet.userId === currentUser.id
    );

    // Selector de filtro
    petSelector.innerHTML = '<option value="">Todas las mascotas</option>';
    
    // Selector del formulario
    vaccinePetSelect.innerHTML = '<option value="">Selecciona una mascota</option>';

    userPets.forEach(pet => {
      const option1 = document.createElement("option");
      option1.value = pet.id;
      option1.textContent = `${pet.nombre} (${pet.tipo})`;
      petSelector.appendChild(option1);

      const option2 = document.createElement("option");
      option2.value = pet.id;
      option2.textContent = `${pet.nombre} (${pet.tipo})`;
      vaccinePetSelect.appendChild(option2);
    });

    if (userPets.length === 0) {
      alert("⚠️ Primero debes registrar una mascota");
      window.location.href = "menu.html";
    }
  }

  // ===== MODAL =====
  function openModal(vaccineId = null) {
    if (vaccineId) {
      editingVaccineId = vaccineId;
      loadVaccineData(vaccineId);
      document.getElementById("modalTitle").textContent = "Editar Vacuna";
      document.getElementById("submitBtnText").textContent = "Actualizar";
    } else {
      editingVaccineId = null;
      vaccineForm.reset();
      document.getElementById("modalTitle").textContent = "Agregar Vacuna";
      document.getElementById("submitBtnText").textContent = "Guardar Vacuna";
      customNameGroup.classList.add("hidden");
    }
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.remove("active");
    document.body.style.overflow = "";
    vaccineForm.reset();
    editingVaccineId = null;
    customNameGroup.classList.add("hidden");
  }

  // ===== EVENT LISTENERS PARA ABRIR/CERRAR MODAL =====
  if (btnAddVaccine) {
    btnAddVaccine.addEventListener("click", (e) => {
      e.preventDefault();
      openModal();
    });
  }
  
  if (btnAddVaccineEmpty) {
    btnAddVaccineEmpty.addEventListener("click", (e) => {
      e.preventDefault();
      openModal();
    });
  }

  // ⭐ NUEVO: Botón del nav inferior
  if (quickAddBtn) {
    quickAddBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openModal();
    });
  }
  
  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", closeModal);
  }
  
  if (cancelBtn) {
    cancelBtn.addEventListener("click", closeModal);
  }

  // Cerrar al hacer clic fuera
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // Cerrar con ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      closeModal();
    }
  });

  // ===== MOSTRAR CAMPO PERSONALIZADO =====
  vaccineNameSelect.addEventListener("change", (e) => {
    if (e.target.value === "Otra") {
      customNameGroup.classList.remove("hidden");
    } else {
      customNameGroup.classList.add("hidden");
    }
  });

  // ===== CONTADOR DE CARACTERES =====
  if (notesTextarea) {
    notesTextarea.addEventListener("input", (e) => {
      const length = e.target.value.length;
      notesCounter.textContent = `${length}/500`;
      notesCounter.style.color = length > 450 ? "#ef4444" : "#999";
    });
  }

  // ===== GUARDAR/ACTUALIZAR VACUNA =====
  vaccineForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const petId = document.getElementById("vaccinePet").value;
    const vaccineName = vaccineNameSelect.value === "Otra" 
      ? document.getElementById("customVaccineName").value.trim()
      : vaccineNameSelect.value;
    const applicationDate = document.getElementById("applicationDate").value;
    const nextDoseDate = document.getElementById("nextDoseDate").value;
    const veterinarian = document.getElementById("veterinarian").value.trim();
    const batchNumber = document.getElementById("batchNumber").value.trim();
    const notes = document.getElementById("vaccineNotes").value.trim();

    if (!petId || !vaccineName || !applicationDate) {
      alert("⚠️ Por favor completa los campos obligatorios");
      return;
    }

    const vaccineData = {
      petId,
      vaccineName,
      applicationDate,
      nextDoseDate,
      veterinarian,
      batchNumber,
      notes,
      userId: correoUsuario
    };

    if (editingVaccineId) {
      updateVaccine(editingVaccineId, vaccineData);
    } else {
      createVaccine(vaccineData);
    }
  });

  // ===== CREAR VACUNA =====
  function createVaccine(vaccineData) {
    const vaccine = {
      id: "vaccine_" + Date.now(),
      ...vaccineData,
      creado: new Date().toISOString()
    };

    const vaccines = JSON.parse(localStorage.getItem("vacunas") || "[]");
    vaccines.push(vaccine);
    localStorage.setItem("vacunas", JSON.stringify(vaccines));

    
    showNotification(`🎉 Vacuna registrada exitosamente`, "success");
    closeModal();
    loadVaccines();
  }

  // ===== ACTUALIZAR VACUNA =====
  function updateVaccine(vaccineId, vaccineData) {
    const vaccines = JSON.parse(localStorage.getItem("vacunas") || "[]");
    const index = vaccines.findIndex(v => v.id === vaccineId);

    if (index === -1) {
      showNotification("⚠️ Vacuna no encontrada", "error");
      return;
    }

    vaccines[index] = {
      ...vaccines[index],
      ...vaccineData,
      actualizado: new Date().toISOString()
    };

    localStorage.setItem("vacunas", JSON.stringify(vaccines));
    
    showNotification(`✅ Vacuna actualizada exitosamente`, "success");
    closeModal();
    loadVaccines();
  }

  // ===== CARGAR DATOS PARA EDITAR =====
  function loadVaccineData(vaccineId) {
    const vaccines = JSON.parse(localStorage.getItem("vacunas") || "[]");
    const vaccine = vaccines.find(v => v.id === vaccineId);

    if (!vaccine) return;

    document.getElementById("vaccinePet").value = vaccine.petId;
    vaccineNameSelect.value = vaccine.vaccineName;
    document.getElementById("applicationDate").value = vaccine.applicationDate;
    document.getElementById("nextDoseDate").value = vaccine.nextDoseDate || "";
    document.getElementById("veterinarian").value = vaccine.veterinarian || "";
    document.getElementById("batchNumber").value = vaccine.batchNumber || "";
    document.getElementById("vaccineNotes").value = vaccine.notes || "";
    notesCounter.textContent = `${vaccine.notes?.length || 0}/500`;
  }

  // ===== CARGAR VACUNAS =====
  function loadVaccines() {
    const vaccines = JSON.parse(localStorage.getItem("vacunas") || "[]");
    const mascotas = JSON.parse(localStorage.getItem("mascotas") || "[]");
    const selectedPet = petSelector.value;

    let userVaccines = vaccines.filter(v => v.userId === correoUsuario || v.userId === currentUser.correo);

    if (selectedPet) {
      userVaccines = userVaccines.filter(v => v.petId === selectedPet);
    }

    vaccinesCount.textContent = userVaccines.length;

    if (userVaccines.length === 0) {
      emptyState.classList.remove("hidden");
      vaccinesContainer.classList.add("hidden");
      upcomingVaccines.classList.add("hidden");
      return;
    }

    emptyState.classList.add("hidden");
    vaccinesContainer.classList.remove("hidden");

    // Renderizar vacunas
    vaccinesList.innerHTML = userVaccines.map(vaccine => {
      const pet = mascotas.find(p => p.id === vaccine.petId);
      const petName = pet ? pet.nombre : "Mascota eliminada";

      return `
        <div class="vaccine-card">
          <div class="vaccine-card-header">
            <div class="vaccine-info">
              <h3>${vaccine.vaccineName}</h3>
              <span class="vaccine-pet-name">
                <i class="fas fa-paw"></i>
                ${petName}
              </span>
            </div>
            <div class="vaccine-actions">
              <button class="btn-icon-small btn-edit" data-id="${vaccine.id}">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn-icon-small btn-delete" data-id="${vaccine.id}">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          <div class="vaccine-details">
            <div class="detail-item">
              <i class="fas fa-calendar"></i>
              <span><strong>Aplicada:</strong> ${formatDate(vaccine.applicationDate)}</span>
            </div>
            ${vaccine.nextDoseDate ? `
              <div class="detail-item">
                <i class="fas fa-calendar-plus"></i>
                <span><strong>Próxima:</strong> ${formatDate(vaccine.nextDoseDate)}</span>
              </div>
            ` : ''}
            ${vaccine.veterinarian ? `
              <div class="detail-item">
                <i class="fas fa-user-md"></i>
                <span>${vaccine.veterinarian}</span>
              </div>
            ` : ''}
            ${vaccine.batchNumber ? `
              <div class="detail-item">
                <i class="fas fa-barcode"></i>
                <span>Lote: ${vaccine.batchNumber}</span>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join("");

    // Event listeners para editar/eliminar
    document.querySelectorAll(".btn-edit").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const vaccineId = e.target.closest("button").dataset.id;
        openModal(vaccineId);
      });
    });

    document.querySelectorAll(".btn-delete").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const vaccineId = e.target.closest("button").dataset.id;
        deleteVaccine(vaccineId);
      });
    });

    // Cargar próximas vacunas
    loadUpcomingVaccines(userVaccines, mascotas);
  }

  // ===== PRÓXIMAS VACUNAS =====
  function loadUpcomingVaccines(vaccines, mascotas) {
    const today = new Date();
    const upcoming = vaccines
      .filter(v => v.nextDoseDate && new Date(v.nextDoseDate) >= today)
      .sort((a, b) => new Date(a.nextDoseDate) - new Date(b.nextDoseDate))
      .slice(0, 5);

    if (upcoming.length === 0) {
      upcomingVaccines.classList.add("hidden");
      return;
    }

    upcomingVaccines.classList.remove("hidden");
    upcomingList.innerHTML = upcoming.map(vaccine => {
      const pet = mascotas.find(p => p.id === vaccine.petId);
      const petName = pet ? pet.nombre : "Mascota";
      const daysUntil = Math.ceil((new Date(vaccine.nextDoseDate) - today) / (1000 * 60 * 60 * 24));

      return `
        <div class="vaccine-card">
          <div class="vaccine-card-header">
            <div class="vaccine-info">
              <h3>${vaccine.vaccineName}</h3>
              <span class="vaccine-pet-name">
                <i class="fas fa-paw"></i>
                ${petName}
              </span>
            </div>
          </div>
          <div class="vaccine-details">
            <div class="detail-item">
              <i class="fas fa-calendar-check"></i>
              <span><strong>${formatDate(vaccine.nextDoseDate)}</strong> (en ${daysUntil} ${daysUntil === 1 ? 'día' : 'días'})</span>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  // ===== ELIMINAR VACUNA =====
  function deleteVaccine(vaccineId) {
    const vaccines = JSON.parse(localStorage.getItem("vacunas") || "[]");
    const vaccine = vaccines.find(v => v.id === vaccineId);

    if (!vaccine) return;

    if (confirm(`¿Eliminar registro de ${vaccine.vaccineName}?`)) {
      const newVaccines = vaccines.filter(v => v.id !== vaccineId);
      localStorage.setItem("vacunas", JSON.stringify(newVaccines));
      showNotification("🗑️ Vacuna eliminada", "info");
      loadVaccines();
    }
  }

  // ===== UTILIDADES =====
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }

  function showNotification(message, type = "info") {
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

  // ===== FILTRO POR MASCOTA =====
  petSelector.addEventListener("change", loadVaccines);

  // ===== INICIALIZAR =====
  loadPets();
  loadVaccines();
});